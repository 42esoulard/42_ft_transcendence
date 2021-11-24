<template>
  <div class="user-account" v-if="user.id != 0">
    <div class="users users--admin">
      <div class="users__title">Manage users</div>
      <div class="users-list-selectors" :key="userList">
        <button
          @click="toggleOnline"
          :class="[
            'button',
            'button--selector',
            onlinelist ? 'button--selector--on' : '',
          ]"
        >
          online
        </button>
        <button
          @click="toggleAdmin"
          :class="[
            'button',
            'button--selector',
            adminlist ? 'button--selector--on' : '',
          ]"
        >
          admin
        </button>
        <button
          @click="toggleBanned"
          :class="[
            'button',
            'button--selector',
            bannedlist ? 'button--selector--on' : '',
          ]"
        >
          banned
        </button>
      </div>
      <div class="users-list">
        <tr v-for="user in selectList" :key="user.id" class="users-list__elt">
          <td>
            <img v-if="isOnline(user)" class="users-list__avatar users-list__avatar--online" :src="user.avatar" />
            <img v-else class="users-list__avatar users-list__avatar--offline" :src="user.avatar" />
          </td>
          <td>
            <router-link
              class="link link--user-list"
              :to="{ name: 'UserProfile', params: { username: user.username } }"
            >
              {{ user.username }}
            </router-link>
          </td>
          <td class="users-list__interactions">
            <button v-if="bannedlist"
              class="link link--neutral"
              @click="unbanUser(user)">
               <i class="fas fa-user-slash" />
            </button>
            <button v-else
              class="link link--neutral"
              @click="banUser(user)">
               <i class="fas fa-ban" />
            </button>
            <button class="link link--neutral"
              @click="deleteUser(user)">
               <i class="fas fa-trash" />
            </button>
            <button v-if="!bannedlist && !isAdmin(user)"
              class="link link--neutral"
              @click="promote(user)">
               <i class="fas fa-crown" />
            </button>
            <button v-if="isAdmin(user)"
              class="link link--neutral"
              @click="demote(user)">
               <i class="fas fa-arrow-down" />
            </button>
          </td>
        </tr>
      </div>

      <div class="users-search">
        <input
          class="users-search__bar"
          type="text"
          maxlength="10"
          v-model="searchQuery"
        />
      </div>
    </div>

    <div class="users users--admin">
      <div class="users__title">Manage channels</div>
      <div class="users-list-selectors" :key="channelList">
        <button
          @click="togglePublic"
          :class="[
            'button',
            'button--selector',
            publiclist ? 'button--selector--on' : '',
          ]"
        >
          public
        </button>
        <button
          @click="togglePrivate"
          :class="[
            'button',
            'button--selector',
            privatelist ? 'button--selector--on' : '',
          ]"
        >
          private
        </button>
      </div>
      <div class="users-list">
        <tr v-for="channel in selectChannelList" :key="channel.id" class="users-list__elt">
          <td>
            {{ channel.name }}
          </td>
          <td class="users-list__interactions">
            <button class="link link--neutral"
              @click="deleteChannel(channel)">
               <i class="fas fa-trash" />
            </button>
          </td>
        </tr>
      </div>

      <div class="users-search">
        <input
          class="users-search__bar"
          type="text"
          v-model="searchQueryChat"
        />
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import { useStore } from "@/store";
import { User, Channel } from "sdk/typescript-axios-client-generated";
import { io } from "socket.io-client";
import { useUserApi, useChatApi } from "@/plugins/api.plugin";

export default defineComponent({
  name: "UserAccount",
  components: {},
  setup() {
    const store = useStore();
    const userApi = useUserApi();
    const chatApi = useChatApi();
    const userList = ref<User[]>([]);
    const bannedList = ref<User[]>([]);
    const channelList = ref<Channel[]>([]);
    const onlinelist = ref(false);
    const publiclist = ref(false);
    const privatelist = ref(false);
    const bannedlist = ref(false);
    const adminlist = ref(false);
    const searchQuery = ref("");
    const searchQueryChat = ref("");

    const isOnline = (user: User): boolean => {
      if (user != undefined) {
        const isonline = store.state.onlineUsers.find((u) => u.id === user.id);
        console.log(isonline != undefined);
        return isonline != undefined;
      }
      return false;
    };

    const isAdmin = (user: User): boolean => {
      if (user != undefined && user.admin)
        return true;
      return false;
    };

    onMounted(() => {
      userApi
        .getUsers()
        .then((res: any) => {
          userList.value = res.data;
          userList.value.sort((a, b) => a.username.localeCompare(b.username));
        })
        .catch((err: any) => console.log(err.message));
      userApi
        .getBannedUsers()
        .then((res: any) => {
          bannedList.value = res.data;
          bannedList.value.sort((a, b) => a.username.localeCompare(b.username));
        })
        .catch((err: any) => console.log(err.message));
      chatApi
        .getChannels()
        .then((res: any) => {
          channelList.value = res.data;
          channelList.value.sort((a, b) => a.name.localeCompare(b.name));
        })
        .catch((err: any) => console.log(err.message));

    });

    const toggleOnline = () => {
      onlinelist.value = !onlinelist.value;
    };

    const toggleBanned = () => {
      bannedlist.value = !bannedlist.value;
    };

    const toggleAdmin = () => {
      adminlist.value = !adminlist.value;
    };

    const togglePublic = () => {
      publiclist.value = !publiclist.value;
    };

    const togglePrivate = () => {
      privatelist.value = !privatelist.value;
    };

    const selectList = computed((): User[] => {
      const list = ref();
      if (bannedlist.value) {
        if (onlinelist.value || adminlist.value) return list.value;
        list.value = bannedList.value;
      } else if (onlinelist.value)
        list.value = userList.value.filter((user) =>
          store.state.onlineUsers.find((u: User) => u.id === user.id)
        );
      else list.value = userList.value;
      if (searchQuery.value.length) {
        list.value = list.value.filter((entity: User) =>
          entity.username.toLowerCase().startsWith(searchQuery.value)
        );
      }
      list.value = list.value.filter(
        (entity: User) => entity.id != store.state.user.id
      );
      if (adminlist.value)
        list.value = list.value.filter(
        (entity: User) => entity.admin == true
      );
      return list.value;
    });

    const selectChannelList = computed((): Channel[] => {
      const list = ref();

      list.value = channelList.value;
      if (publiclist.value) {
        if (privatelist.value) return list.value;
        return list.value.filter((chan: Channel) => chan.type == "public");
      }
      else if (privatelist.value)
        return list.value.filter((chan: Channel) => chan.type == "private");
      return list.value;
    });

    const deleteUser = async(user: User) => {
      if(confirm(`Do you really want to delete ${user.username}?`)){
        await userApi
          .removeUser(user.id)
          .then((res: any) => {
            console.log("account deleted");
            userList.value = userList.value.filter((usr: User) => usr.id != user.id);
            bannedList.value = bannedList.value.filter((usr: User) => usr.id != user.id);
          })
          .catch((err: any) => console.log(err));
      }
    };

    const deleteChannel = async(channel: Channel) => {
      if(confirm(`Do you really want to delete ${channel.name}?`)){
        await chatApi
          .deleteChannel(channel.id)
          .then((res: any) => {
            console.log("channel deleted");
            channelList.value = channelList.value.filter((chan: Channel) => chan.id != chan.id);
          })
          .catch((err: any) => console.log(err));
      }
    };

    const promote = async(user: User) => {
      if(confirm(`Do you really want to promote ${user.username}?`)){
        await userApi
          .promoteUser(user.id)
          .then((res: any) => {
            console.log("user promoted");
            user.admin = true;
          })
          .catch((err: any) => console.log(err));
      }
    };

    const demote = async(user: User) => {
      if(confirm(`Do you really want to demote ${user.username}?`)){
        await userApi
          .demoteUser(user.id)
          .then((res: any) => {
            console.log("user demoted");
            user.admin = false;
          })
          .catch((err: any) => console.log(err));
      }
    };

    const banUser = async(user: User) => {
      if(confirm(`Do you really want to ban ${user.username}?`)){
        await userApi
          .updateUser({id: user.id, banned: true})
          .then((res: any) => {
            console.log("user banned");
            bannedList.value.push(user);
            userList.value = userList.value.filter((usr: User) => usr.id != user.id);
            user.admin = false;
          })
          .catch((err: any) => console.log(err));
      }
    };

    const unbanUser = async(user: User) => {
      await userApi
        .updateUser({id: user.id, banned: false})
        .then((res: any) => {
          console.log("user unbanned");
          userList.value.push(user);
          bannedList.value = bannedList.value.filter((usr: User) => usr.id != user.id);
        })
        .catch((err: any) => console.log(err));
    };

    return {
      user: computed(() => store.state.user),
      selectList,
      searchQuery,
      searchQueryChat,
      onlinelist,
      bannedlist,
      adminlist,
      userList,
      isAdmin,
      isOnline,
      toggleBanned,
      toggleOnline,
      toggleAdmin,
      promote,
      unbanUser,
      banUser,
      deleteUser,
      demote,
      selectChannelList,
      togglePublic,
      togglePrivate,
      privatelist,
      publiclist,
      deleteChannel
    };
  },
});
</script>

<style scoped></style>
