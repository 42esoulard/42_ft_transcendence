<template>
  <h1>Dev login</h1>
  <h2>To authenticate whitout 42</h2>
  <form @submit.prevent="Fakelogin">
    <label>User:</label>
    <select v-model="selectedUser">
      <option v-for="user in users" :key="user.id" :value="user.username">
        {{ user.username }}
      </option>
    </select>
    <div class="submit">
      <button>Fake Login</button>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { User } from "@/types/User";
import { DefaultApi } from "sdk-client";

export default defineComponent({
  name: "Login",
  setup() {
    const router = useRouter();

    const api = new DefaultApi();
    const users = ref<User[]>([]);
    const selectedUser = ref<string>();

    onMounted(() => {
      api
        .getUsers()
        .then((res: any) => {
          users.value = res.data;
          if (users) {
            selectedUser.value = users.value[0].username;
          }
        })
        .catch((err: any) => console.log(err.message));
    });

    const Fakelogin = async () => {
      console.log(selectedUser.value);
      await axios
        .post("http://localhost:3000/auth/fake-login", {
          username: selectedUser.value,
        })
        .then((res) => {
          console.log(res);
          router.push("account");
        })
        .catch((error) => console.log(error));
    };

    return { Fakelogin, users, selectedUser };
  },
});
</script>

<style scoped>
form {
  max-width: 420px;
  margin: 30px auto;
  background: white;
  text-align: left;
  padding: 40px;
  border-radius: 10px;
}
label {
  color: #aaa;
  display: inline-block;
  margin: 25px 0 15px;
  font-size: 0.6em;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: bold;
}
select {
  display: block;
  padding: 10px 6px;
  width: 100%;
  box-sizing: border-box;
  border: none;
  border-bottom: 1px solid #ddd;
  color: #555;
}

button {
  background: #0b6dff;
  border: 0;
  padding: 10px 20px;
  margin-top: 20px;
  color: white;
  border-radius: 20px;
}
.submit {
  text-align: center;
}
.submit:hover {
  opacity: .8;
}
.error {
  color: #ff0062;
  margin-top: 10px;
  font-size: 0.8em;
  font-weight: bold;
}
</style>
