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
            onlinelist ? 'button--selector--on' : ''
          ]">
          online
        </button>
        <button
          @click="toggleFriends"
          :class="[
            'button',
            'button--selector',
            friendlist ? 'button--selector--on' : ''
          ]">
          friends
        </button>
      </div>
      <div class="users-list">
        <tr v-for="user in selectList" :key="user.id" class="users-list__elt">
          <td>
            <img class="users-list__avatar" :src="user.avatar" />
          </td>
          <td>
            <router-link
              class="link link--user-list"
              :to="{ name: 'UserProfile', params: { username: user.username } }">
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
          v-model="searchQuery" />
      </div>
    </div>
  </div>
  <div v-else>
    <p>Loading some data...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, ref, computed } from "vue";
import { User } from "@/types/User";
import { useStore } from "vuex";
import { useUserApi } from "@/plugins/api.plugin";

export default defineComponent({
  name: "Users",
  setup() {
    const store = useStore();
    const userList = ref<User[]>([]);
    const friendList = ref<User[]>([]);
    const onlineList = store.state.onlineUsers;
    const userApi = useUserApi();
    const friendlist = ref(false);
    const onlinelist = ref(false);
    const searchQuery = ref("");

    onMounted(() => {
      userApi
        .getUsers()
        .then((res: any) => {
          userList.value = res.data;
          userList.value.sort((a, b) => a.username.localeCompare(b.username));
        })
        .catch((err: any) => console.log(err.message));
      userApi
        .getUserFriendships(store.state.user.id)
        .then((res: any) => {
          for (const requested of res.data.friendships_requested)
            if (requested.pending == false)
              friendList.value.push(requested.adressee);
          for (const adressed of res.data.friendships_adressed)
            if (adressed.pending == false)
              friendList.value.push(adressed.requester);
          friendList.value.sort((a, b) => a.username.localeCompare(b.username));
        })
        .catch((err: any) => console.log(err.message));
    });

    const toggleFriends = () => {
      friendlist.value = !friendlist.value;
    };

    const toggleOnline = () => {
      onlinelist.value = !onlinelist.value;
    };

    const selectList = computed(() => {
      const list = ref();
      if (friendlist.value && onlinelist.value)
        list.value = friendList.value.filter(user => (onlineList.find((u: User) => u.id === user.id)));
      else if (friendlist.value) list.value = friendList.value;
      else if (onlinelist.value) list.value = userList.value.filter(user => (onlineList.find((u: User) => u.id === user.id)));
      else list.value = userList.value;
      if (searchQuery.value.length) {
        list.value = list.value.filter((entity: User) =>
          entity.username.toLowerCase().startsWith(searchQuery.value)
        );
      }
      list.value = list.value.filter(
        (entity: User) => entity.username != store.state.user.username
      );
      return list.value;
    });

    return {
      userList,
      toggleFriends,
      toggleOnline,
      friendlist,
      onlinelist,
      selectList,
      searchQuery
    };
  }
});
</script>
