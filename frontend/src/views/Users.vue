<template>
  <div v-if="users.length" class="users-div">
    <div class="users">
      <div class="users__title">All Users</div>
      <div class="users-list">
          <tr v-for="user in users" :key="user.id" class="users-list__elt">
            <td>
              <img class="users-list__avatar" :src="user.avatar" />
            </td>
            <td>
              <router-link class="link link--user-list" :to="{ name: 'UserProfile', params: {username: user.username} }">
                {{ user.username }}
              </router-link>
            </td>
            <td>
            </td>
          </tr>
      </div>
      <div class="users__search">searchbar</div>
    </div>
  </div>
  <div v-else>
    <p>Loading some data...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, ref, computed} from "vue";
import { User } from "@/types/User";
import { useStore } from "vuex";
import FriendsList from "../components/FriendsList.vue";
import { useUserApi } from "@/plugins/api.plugin";

export default defineComponent({
  name: "Users",
  components: { FriendsList },
  setup() {
    const users = ref<User[]>([]);
    const userApi = useUserApi();
    // const api = new DefaultApi();

  onMounted(() => {
      userApi
        .getUsers()
        .then((res: any) => (users.value = res.data))
        .catch((err: any) => console.log(err.message));
  });

  const   orderUsers = computed(() => {
      return (users.value.sort((a, b) => a.username.localeCompare(b.username)));
  })

    return {  users, orderUsers };
  },
});
</script>

<style scoped>

</style>
