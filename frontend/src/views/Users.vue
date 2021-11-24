<template>
  <div v-if="userList.length" class="users-div">
    <div class="users">
      <div class="users__title">Userlist</div>
      <div class="users-list-selectors" :key="friendlist">
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
          @click="toggleFriends"
          :class="[
            'button',
            'button--selector',
            friendlist ? 'button--selector--on' : '',
          ]"
        >
          friends
        </button>
        <button
          @click="toggleBlocked"
          :class="[
            'button',
            'button--selector',
            blockedlist ? 'button--selector--on' : '',
          ]"
        >
          blocked
        </button>
      </div>
      <div class="users-list">
        <tr v-for="user in selectList" :key="user.id" class="users-list__elt">
          <td>
            <img
              v-if="userStatus(user) == 'online'"
              class="users-list__avatar users-list__avatar--online"
              :src="user.avatar"
            />
            <img
              v-else-if="userStatus(user) == 'ingame'"
              class="users-list__avatar users-list__avatar--in-game"
              :src="user.avatar"
            />
            <img
              v-else
              class="users-list__avatar users-list__avatar--offline"
              :src="user.avatar"
            />
          </td>
          <td>
            <router-link
              :class="[
                'link',
                'link--user-list',
                user.role == 'user' ? '' : 'link--admin',
              ]"
              :to="{ name: 'UserProfile', params: { username: user.username } }"
            >
              {{ user.username }}
            </router-link>
          </td>
          <td class="users-list__interactions">
            <i class="link link--neutral fas fa-envelope" />
            <i class="link link--neutral fas fa-table-tennis" />
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
  </div>
  <div v-else>
    <p>Loading some data...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, ref, computed } from "vue";
import { User, Relationship } from "sdk/typescript-axios-client-generated";
import { useStore } from "@/store";
import { useUserApi, useRelationshipApi } from "@/plugins/api.plugin";

export default defineComponent({
  name: "Users",
  setup() {
    const store = useStore();
    const userList = ref<User[]>([]);
    const friendList = ref<number[]>([]);
    const blockedList = ref<number[]>([]);
    const userApi = useUserApi();
    const relationshipApi = useRelationshipApi();
    const friendlist = ref(false);
    const onlinelist = ref(false);
    const blockedlist = ref(false);
    const searchQuery = ref("");

    // const isOnline = (user: User): boolean => {
    //   if (user != undefined) {
    //     const isonline = store.state.onlineUsers.find((u) => u.id === user.id);
    //     console.log(isonline != undefined);
    //     return isonline != undefined;
    //   }
    //   return false;
    // };

    const userStatus = (user: User): "online" | "offline" | "ingame" => {
      if (user != undefined) {
        const inGameUser = store.state.inGameUsers.find(
          (u) => u === user.username
        );
        const onlineUser = store.state.onlineUsers.find(
          (u) => u.id === user.id
        );
        if (inGameUser) {
          return "ingame";
        } else if (onlineUser) {
          return "online";
        }
      }
      return "offline";
    };

    onMounted(() => {
      userApi
        .getUsers()
        .then((res: any) => {
          userList.value = res.data;
          userList.value.sort((a, b) => a.username.localeCompare(b.username));
        })
        .catch((err: any) => console.log(err.message));
      if (store.state.user.id != 0) {
        relationshipApi
          .getUserFriendships(store.state.user.id)
          .then((res: any) => {
            for (const friendship of res.data) {
              if (friendship.requesterId == store.state.user.id)
                friendList.value.push(friendship.adresseeId);
              else friendList.value.push(friendship.requesterId);
            }
          })
          .catch((err: any) => console.log(err.message));
        relationshipApi
          .getUserBlocked(store.state.user.id)
          .then((res: any) => {
            for (const blocked of res.data) {
              if (blocked.requesterId == store.state.user.id)
                blockedList.value.push(blocked.adresseeId);
            }
            userList.value = userList.value.filter(
              (user: User) =>
                !res.data.find((rs: Relationship) => rs.requesterId === user.id)
            );
          })
          .catch((err: any) => console.log(err.message));
      }
    });

    const toggleFriends = () => {
      friendlist.value = !friendlist.value;
    };

    const toggleOnline = () => {
      onlinelist.value = !onlinelist.value;
    };

    const toggleBlocked = () => {
      blockedlist.value = !blockedlist.value;
    };

    const selectList = computed((): User[] => {
      const list = ref();
      if (blockedlist.value) {
        if (friendlist.value || onlinelist.value) return list.value;
        list.value = userList.value.filter((user: User) =>
          blockedList.value.find((id: number) => id === user.id)
        );
      } else if (friendlist.value) {
        list.value = userList.value.filter((user: User) =>
          friendList.value.find((id: number) => id === user.id)
        );
        if (onlinelist.value)
          list.value = list.value.filter((user: User) =>
            store.state.onlineUsers.find((u: User) => u.id === user.id)
          );
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
      if (!blockedlist.value)
        list.value = list.value.filter(
          (user: User) =>
            !blockedList.value.find((id: number) => id === user.id)
        );
      return list.value;
    });

    return {
      userList,
      toggleFriends,
      toggleOnline,
      toggleBlocked,
      friendlist,
      onlinelist,
      blockedlist,
      selectList,
      searchQuery,
      userStatus,
    };
  },
});
</script>
