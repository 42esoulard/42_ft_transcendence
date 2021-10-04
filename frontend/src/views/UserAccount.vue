<template>
  <h1>User Account</h1>
  <div v-if="user">
    <h2>Ce que je sais sur toi:</h2>
    <img :src="user.avatar" alt="" />
    <p>Ton avatar: {{ user.avatar }}</p>
    <p>Ton id: {{ user.id }}</p>
    <p>Ton login: {{ user.username }}</p>
    <button @click="logOut">LogOut</button>
    <button @click="refreshToken">refreshToken</button>
  </div>
  <div v-else>
    <button @click="logWith42">Login with 42</button>
    <button @click="getProfile">Get profile</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUpdated, ref } from "vue";
// import { User } from "@/types/User";
import axios from "axios";
import { DefaultApi } from "sdk-client";
import { useRoute, useRouter } from "vue-router";
import jwt_decode from "jwt-decode";

export default defineComponent({
  name: "UserAccount",
  setup() {
    const api = new DefaultApi();
    const user = ref();
    const token = ref();

    const route = useRoute();
    const router = useRouter();

    onMounted(async () => {
      const jwt = localStorage.getItem("jwt");
      console.log(jwt);
      if (jwt) {
        const decoded: any = jwt_decode(jwt);
        const now =  Math.floor(Date.now() / 1000);
        if (now < Number(decoded.exp)) {
          token.value = jwt;
          getProfile();
        } else {
          localStorage.removeItem('jwt');
        }
      } else if (route.query.code) {
        const code = route.query.code;
        router.push("account");
        console.log(code);
        await axios
          .get("http://localhost:3000/auth/login", {
            params: {
              code: code,
            },
          })
          .then((response) => {
            // console.log(response.data);
            token.value = response.data.access_token;
            localStorage.setItem("jwt", token.value);
            getProfile();
          })
          .catch((err: any) => console.log(err.message));
      }
    });

    const logWith42 = () => {
      window.location.href =
        "https://api.intra.42.fr/oauth/authorize?client_id=46e320031831547c491335678b8367e6dbc16e9dbce7359eea37b29a97a2e854&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Faccount&response_type=code";
    };

    const getProfile = () => {
      axios
        .get("http://localhost:3000/auth/profile", {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        })
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
          user.value = null;
          localStorage.removeItem('jwt');
          router.push('/');
        })
        .catch((err: any) => console.log(err.message));
    };
    const refreshToken = () => {
      axios
        .get("http://localhost:3000/auth/refreshtoken", {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        })
        .then((response) => {
          token.value = response.data.access_token;
          localStorage.setItem("jwt", token.value);
          console.log(token.value);
        })
        .catch((err: any) => console.log(err.message));
    };

    return { user, logWith42, getProfile, logOut, refreshToken };
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
