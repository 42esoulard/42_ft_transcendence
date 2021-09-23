<template>
  <h1>List of all users in database</h1>
  <div v-if="users.length">
    <div v-for="user in users" :key="user.id" class="user">
      <h2>{{ user.firstname }} {{ user.lastname }}</h2>
    </div>
  </div>
  <div v-else>
    <p>Loading some data...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, ref } from "vue";
import { User } from "@/types/User";
import { DefaultApi } from "@/../sdk/typescript-axios-client-generated";

export default defineComponent({
  name: "Users",
  setup() {
    // const api: any = inject('api');
    const users = ref<User[]>([]);

    // const config = {
    //   basePath: process.env.VUE_APP_API_URL,
    // };

    const api = new DefaultApi();

    onMounted(() => {
      api.getUsers()
        .then((res: any) => (users.value = res.data))
        .catch((err: any) => console.log(err.message));
    });

    // onMounted(() => {
    //   fetch("http://localhost:3000/users")
    //     .then((res) => res.json())
    //     .then((data) => (users.value = data))
    //     .catch((err) => console.log(err.message));
    // });

    return { users };
  },
});

// import { defineComponent } from "vue";
// import { User } from "@/types/User";

// export default defineComponent({
//   name: "Users",
//   components: {},
//   data() {
//     return {
//       users: [] as User[]
//     }
//   },
//   mounted() {
//     fetch("http://localhost:3000/users")
//       .then((res) => res.json())
//       .then((data) => (this.users = data))
//       .catch((err) => console.log(err.message));
//   },
// });
</script>

<style>
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
