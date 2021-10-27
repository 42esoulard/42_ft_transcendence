<template>
  <h1>List of all users in database</h1>
  <div v-if="users.length" class="users-div">
    <div>
      <div v-for="user in users" :key="user.id" class="user">
        <h2>
          <router-link :to="{ name: 'UserProfile', params: {username: user.username} }">
            {{ user.username }}
          </router-link>
        </h2>

      </div>
    </div>
    <div>
      <FriendsList />
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

    return {  users };
  },
});
</script>

<style scoped>
.users-div {
  display: grid;
  grid-template: 100% / 80% 20%;
  width: 80%;
  margin: auto;
}
.user {
  background: #f4f4f4;
  padding: 20px;
  border-radius: 10px;
  margin: 10px auto;
  max-width: 600px;
  cursor: pointer;
  color: #444;
}
.user:hover {
  background: #ddd;
}
.user a {
  text-decoration: none;
}
</style>
