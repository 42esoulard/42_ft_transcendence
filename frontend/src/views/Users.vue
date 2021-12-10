<template>
  <div v-if="userList.length" class="users-main">
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
      <div class="users-list users-list--userlist">
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
              :to="{
                name: 'UserProfile',
                params: { username: user.username },
              }"
            >
              {{ user.username }}
            </router-link>
          </td>
          <td class="users-list__interactions">
            <button class="link link--neutral" @click="sendDM(user)" title="dm">
              <i class="link link--neutral fas fa-envelope" />
            </button>
            <button
              v-if="
                userStatus(user) == 'online' && userStatus(self) == 'online'
              "
              class="link link--neutral"
              @click="challengeUser(user)"
              title="challenge"
            >
              <i class="fas fa-table-tennis" />
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
    <Pending />
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
import { useRouter } from "vue-router";
import { chatSocket } from "@/App.vue";
import Pending from "../components/Pending.vue";

export default defineComponent({
  components: { Pending },
  name: "Users",
  setup() {
    const router = useRouter();
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
      store.state.toggleFriendship = false;
      userApi
        .getUsers()
        .then((res: any) => {
          userList.value = res.data;
          userList.value.sort((a, b) => a.username.localeCompare(b.username));
        })
        .catch((err: any) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
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
          .catch((err: any) => {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          });
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
          .catch((err: any) => {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          });
      }
    });

    chatSocket.on("updateFriendshipList", (friendsInfo) => {
      if (friendsInfo.length == 4) {
        const newFriend =
          friendsInfo[0] == store.state.user.id
            ? friendsInfo[2]
            : friendsInfo[0];
        if (Number(newFriend)) {
          friendList.value.push(newFriend);
        }
      } else if (Number(friendsInfo)) {
        friendList.value.push(friendsInfo);
      }
    });

    chatSocket.on("newBlocked", (blocked) => {
      if (store.state.user.id == blocked[0].adresseeId) {
        userList.value = userList.value.filter(
          (usr: User) => usr.id != blocked[0].requesterId
        );
      } else if (store.state.user.id == blocked[0].requesterId) {
        friendList.value = friendList.value.filter(
          (fr: Number) => fr != blocked[0].adresseeId
        );
        blockedList.value.push(blocked[0].adresseeId);
      }
    });

    chatSocket.on("removeBlocked", (infos) => {
      if (store.state.user.id == infos[1]) {
        userList.value.push(infos[0]);
      } else if (store.state.user.id == infos[0].id) {
        blockedList.value = blockedList.value.filter(
          (id: number) => id != infos[1]
        );
      }
    });

    chatSocket.on("rmFromFriendshipList", (friendsInfo) => {
      if (Number(friendsInfo)) {
        const index = friendList.value.indexOf(friendsInfo);
        if (index >= 0) {
          friendList.value.splice(index, 1);
        }
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
      list.value.sort((a: User, b: User) =>
        a.username.localeCompare(b.username)
      );
      list.value.sort(
        (a: User, b: User) =>
          userStatus(a) == "offline" && userStatus(b) != "offline"
      );
      list.value.sort(
        (a: User, b: User) =>
          userStatus(a) == "ingame" && userStatus(b) == "online"
      );
      return list.value;
    });

    const challengeUser = (usr: User) => {
      for (const challenge of store.state.challengesReceived) {
        if (challenge.challenger == usr.username) {
          store.dispatch(
            "setErrorMessage",
            `Error: ${usr.username} already invited you to play!`
          );
          return;
        }
      }
      router.push({
        name: "Pong",
        params: {
          challengeeId: usr.id,
          challengeeName: usr.username,
        },
      });
    };

    const sendDM = (recipient: User) => {
      chatSocket.emit("userlist-dm", recipient);
    };

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
      challengeUser,
      sendDM,
      self: computed(() => store.state.user),
    };
  },
});
</script>
