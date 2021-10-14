<template>
  <h1>User Account</h1>
  <div v-if="user">
    <h2>Your profile from 42</h2>
    <img :src="user.avatar" class="ua-img" alt="[Your avatar]" />
    <p>Your avatar: {{ user.avatar }}</p>
    <p>Your id: {{ user.id }}</p>
    <p>Your username: {{ user.username }}</p>
    <p>Your login 42: {{ user.forty_two_login }}</p>
    <p>Two-Factor Auth activated: {{ user.two_fa_enabled }}</p>
    <p>Profile created at: {{ formatDate(user.created_at) }}</p>

    <div v-if="!user.two_fa_enabled">
      <router-link :to="{ name: 'InitTwoFactor' }"
        >Activate Two-Factor Authentication</router-link
      >
    </div>
    <div v-else>
      <a @click.prevent="deactivateTwoFactor" href="#">Deactivate Two-Factor Authentication</a>
    </div>

    <form method="post" @submit.prevent="postAvatar">
      <input @change="handleFile" type="file" ref="avatar" id="avatar" />
      <button>Update avatar</button>
    </form>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import axios from "axios";
import { DefaultApi } from "@/../sdk/typescript-axios-client-generated";
import { useRouter } from "vue-router";
import moment from "moment";
import { useStore } from "vuex";
import { User } from "../types/User";

export default defineComponent({
  name: "UserAccount",
  setup() {
    const api = new DefaultApi();
    const store = useStore();
    const router = useRouter();

    const avatar = ref();

    //To exchange cookie or auth header w/o in every req
    axios.defaults.withCredentials = true;

    // Purement utilitaire => should be placed somewhere else
    const formatDate = (date: Date) => {
      if (date) {
        return moment(date).format("YYYY-MM-DD HH:mm:ss");
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
          window.location.reload();
        })
        .catch(function (err) {
          console.log(err.response.data.message);
        });
    };

    const deactivateTwoFactor = async () => {
      await axios
        .get("http://localhost:3000/auth/2fa/turn-off")
        .then((res) => {
          console.log(res);
          window.location.reload();
        })
        .catch((error) => console.log(error));
    };

    return {
      user: computed<User>(() => store.state.user),
      formatDate,
      postAvatar,
      handleFile,
      avatar,
      deactivateTwoFactor
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
.ua-img {
  width: 300px;
  height: 300px;
  border-radius: 300px;
}
</style>
