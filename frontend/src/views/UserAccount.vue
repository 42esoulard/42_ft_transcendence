<template>
  <h1>User Account</h1>
  <div v-if="user">
    <h2>Your profile from 42</h2>
    <img :src="user.avatar" alt="[Your avatar]"  />
    <p>Your avatar: {{ user.avatar }}</p>
    <p>Your id: {{ user.id }}</p>
    <p>Your username: {{ user.username }}</p>
    <p>Your login 42: {{ user.forty_two_login }}</p>
    <p>Two-Factor Auth activated: {{ user.two_fa }}</p>
    <p>Profile created at: {{ formatDate() }}</p>
    <button @click="logOut">LogOut</button>
  </div>
  <div v-else>
    <h2>Please log in</h2>
    <button @click="logWith42">Login with 42</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUpdated, ref } from "vue";
import axios from "axios";
import { DefaultApi } from "sdk-client";
import { useRoute, useRouter } from "vue-router";
import moment from 'moment';
import { User } from "../types/User";

export default defineComponent({
  name: "UserAccount",
  setup() {
    const api = new DefaultApi();
    const user = ref<User>();

    const route = useRoute();
    const router = useRouter();

    //To exchange cookie or auth header w/o in every req
    axios.defaults.withCredentials = true;

    onMounted(async () => {
      if (route.query.code) {
        const code = route.query.code;
        router.push("account"); // In order to remove query from URL
        console.log(code);
        await axios
          .get("http://localhost:3000/auth/login", {
            params: {
              code: code,
            },
          })
          .then((response) => console.log(response.data))
          .catch((err: any) => console.log(err.message));
      } else {
        refreshToken();
      }
      getProfile();
    });

    const logWith42 = () => {
      window.location.href =
        "https://api.intra.42.fr/oauth/authorize?client_id=46e320031831547c491335678b8367e6dbc16e9dbce7359eea37b29a97a2e854&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Faccount&response_type=code";
    };

    const getProfile = () => {
      axios
        .get("http://localhost:3000/auth/profile")
        .then((response) => {
          user.value = response.data;
          // console.log(user.value);
        })
        .catch((err: any) => console.log(err.message));

      // api
      //   .login()
      //   .then((res: any) => console.log(res.data))
      //   .catch((err: any) => console.log(err.message));
    };
    const logOut = () => {
      axios
        .get("http://localhost:3000/auth/logout", { withCredentials: true })
        .then((response) => {
          console.log(response);
          // user.value = null;
          localStorage.removeItem("jwt");
          router.push("/");
        })
        .catch((err: any) => console.log(err.message));
    };
    const refreshToken = () => {
      axios
        .get("http://localhost:3000/auth/refreshtoken")
        .then((response) => console.log(response))
        .catch((err: any) => console.log(err.message));
    };

    const formatDate = () => {
      if (user.value) {
        return moment(user.value.created_at).format('YYYY-MM-DD HH:mm:ss')
      }
      return null;
    }

    return { user, logWith42, getProfile, logOut, refreshToken, formatDate };
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
