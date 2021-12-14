<template>
  <div v-if="userList.length" class="users-main">
    <div class="users users--ladder">
      <div class="users__title">Ladder</div>
      <div class="users-list">
        <tr v-for="user in selectList" :key="user.id" class="users-list__elt">
          <td class="ladder__td--rank">#{{ selectList.indexOf(user) + 1 }}</td>
          <td class="ladder__td">
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
import { defineComponent, onMounted, ref, computed } from "vue";
import { User, GameUser } from "sdk/typescript-axios-client-generated";
import { useStore } from "@/store";
import { useUserApi } from "@/plugins/api.plugin";
import Pending from "../components/Pending.vue";

export default defineComponent({
  components: { Pending },
  name: "Users",
  setup() {
    const store = useStore();
    const userList = ref<User[]>([]);
    const userApi = useUserApi();
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
      userApi
        .getUsersLadder()
        .then((res: any) => {
          userList.value = res.data;
        })
        .catch((err: any) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    });

    const selectList = computed((): User[] => {
      const list = ref();
      list.value = userList.value;
      if (searchQuery.value.length) {
        list.value = list.value.filter((entity: User) =>
          entity.username.toLowerCase().startsWith(searchQuery.value)
        );
      }
      let userA = 0;
      let userB = 0;
      list.value.sort((a: User, b: User) => {
        userA = a.games
          ? a.games.filter((game: GameUser) => game.won == true).length
          : 0;
        userB = b.games
          ? b.games.filter((game: GameUser) => game.won == true).length
          : 0;
        if (userA < userB) return 1;
        else if (userA > userB) return -1;
        return 0;
      });
      return list.value;
    });

    return {
      userList,
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
