<template>
  <h1>List of all users in database</h1>
  <div v-if="users.length">
    <div v-for="user in users" :key="user.id" class="user">
      <h2>{{ user.username }}</h2>
    </div>
  </div>
  <div v-else>
    <p>Loading some data...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, ref } from "vue";
import { User } from "@/types/User";
// import { DefaultApi } from "@/../sdk/typescript-axios-client-generated";
import { useUserApi } from "@/plugins/api.plugin";

export default defineComponent({
  name: "Users",
  setup() {
    const users = ref<User[]>([]);
    const api = useUserApi();
    // const api = new DefaultApi();

    onMounted(() => {
      api
        .getUsers()
        .then((res: any) => (users.value = res.data))
        .catch((err: any) => console.log(err.message));
    });

    return { users };
  },
});
</script>

<style scoped>
.user h2 {
  background: #f4f4f4;
  padding: 20px;
  border-radius: 10px;
  margin: 10px auto;
  max-width: 600px;
  cursor: pointer;
  color: #444;
}
.user h2:hover {
  background: #ddd;
}
.user a {
  text-decoration: none;
}
</style>
