<template>
  <h1>User Account</h1>
  <div v-if="user">
    <h2>Your profile from 42</h2>
    <img :src="user.avatar" alt="[Your avatar]" />
    <p>Your avatar: {{ user.avatar }}</p>
    <p>Your id: {{ user.id }}</p>
    <p>Your username: {{ user.username }}</p>
    <p>Your login 42: {{ user.forty_two_login }}</p>
    <p>Two-Factor Auth activated: {{ user.two_fa }}</p>
    <p>Profile created at: {{ formatDate() }}</p>
    <button @click="logOut">LogOut</button>

    <form
      method="post"
      @submit.prevent="postAvatar"
      enctype="multipart/form-data"
    >
      <input @change="handleFile" type="file" ref="avatar" id="avatar" />
      <button>Update avatar</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import axios from "axios";
import { DefaultApi } from "sdk-client";
import { useRouter } from "vue-router";
import moment from "moment";
import { User } from "../types/User";
import { useStore } from "vuex";

export default defineComponent({
  name: "UserAccount",
  setup() {
    const api = new DefaultApi();
    const store = useStore();
    const router = useRouter();

    const user = ref<User>();
    const avatar = ref();

    //To exchange cookie or auth header w/o in every req
    axios.defaults.withCredentials = true;

    onMounted(async () => {
      getProfile();
    });

    const getProfile = () => {
      user.value = store.state.user;
    };

    const logOut = () => {
      axios
        .get("http://localhost:3000/auth/logout", { withCredentials: true })
        .then((response) => {
          console.log(response);
          store.state.user = null;
          router.push("/login");
        })
        .catch((err: any) => console.log(err.message));
    };

    // Purement utilitaire => should be placed somewhere else
    const formatDate = () => {
      if (user.value) {
        return moment(user.value.created_at).format("YYYY-MM-DD HH:mm:ss");
      }
      return null;
    };

    const handleFile = (
      event: Event & {
        target: HTMLInputElement & {
          files: FileList;
        };
      }
    ) => {
      const { target } = event;
      const { files } = target;
      if (files.length === 0) {
        return;
      }
      avatar.value = files[0];
      console.log(avatar.value);
    };

    const postAvatar = () => {
      const data = new FormData();
      data.append("avatar", avatar.value);
      axios
        .post("http://localhost:3000/users/upload", data)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (err) {
          console.log(err);
        });
    };

    return {
      user,
      getProfile,
      logOut,
      formatDate,
      postAvatar,
      handleFile,
      avatar,
    };
  },
});
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
img {
  width: 300px;
  height: 300px;
  border-radius: 300px;
}
</style>
