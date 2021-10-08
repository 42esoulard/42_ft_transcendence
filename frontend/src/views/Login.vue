<template>
  <h1>Welcome to ft_transcendence</h1>
  <h2>Please Login</h2>
  <button @click="logWith42">Login with 42</button>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
// import { DefaultApi } from "sdk-client";

export default defineComponent({
  name: "Login",
  setup() {
    const route = useRoute();
    const router = useRouter();
    // const user = ref<User>();

    //To exchange cookie or auth header w/o in every req
    axios.defaults.withCredentials = true;

    onMounted(() => {
      if (route.query.code) {
        const code = route.query.code;
        console.log(code);
        axios
          .get("http://localhost:3000/auth/login", {
            params: {
              code: code,
            },
          })
          .then((response) => {
            router.push("account"); //find a way to push to requested route, not only account ??
            // console.log(response.data);
          })
          .catch((err: any) => console.log(err.message));
      }
    });

    const logWith42 = () => {
      window.location.href =
        "https://api.intra.42.fr/oauth/authorize?client_id=46e320031831547c491335678b8367e6dbc16e9dbce7359eea37b29a97a2e854&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Flogin&response_type=code";
    };

    return { logWith42 };
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
</style>
