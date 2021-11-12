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
import { User } from 'sdk/typescript-axios-client-generated';
import { useAuthApi, useUserApi } from "@/plugins/api.plugin";
import { io } from "socket.io-client";
import { useStore } from "@/store";
import { presenceSocket } from "@/views/UserAccount.vue";

export default defineComponent({
  name: "Login",
  setup() {
    const router = useRouter();

    const store = useStore();
    const authApi = useAuthApi();
    const userApi = useUserApi();
    const users = ref<User[]>([]);
    const selectedUser = ref('');

    onMounted(() => {
      userApi
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
      // console.log(selectedUser.value);
      await axios
        .post("http://localhost:3000/auth/fake-login", {
          username: selectedUser.value
        })
        .then(async res => {
          await getProfile();
          sendConnection();
          router.push("account");
        })
        .catch(error => console.log(error));
    };

    const getProfile = async () => {
      await authApi
        .profile({ withCredentials: true })
        .then(response => {
          store.state.user = response.data;
        })
        .catch((err: Error) => {
          console.log("ERROR GET PROFILE");
        });
    };

    const sendConnection = () => {
      presenceSocket.emit("newConnection", store.state.user);
      // console.log("NEWLY CONNECTED USER", store.state.user);
    };
    presenceSocket.on("newUser", (user: User) => {
      store.commit("addOnlineUser", user);
      console.log("onlineUsers", store.state.onlineUsers);
    });

    return { Fakelogin, users, selectedUser };
  }
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
  opacity: 0.8;
}
</style>
