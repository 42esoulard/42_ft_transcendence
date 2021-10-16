<template>
  <h1>Welcome to ft_transcendence</h1>
  <div v-if="isTwoFactorEnabled">
    <OtpInput :codeSendToUrl="codeSendToUrl" />
  </div>
  <div v-else>
    <h2>Please Login</h2>
    <button @click="logInWith42">Login with 42</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import OtpInput from "@/components/OtpInput.vue";
import axios from "axios";

export default defineComponent({
  name: "Login",
  components: { OtpInput },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const isTwoFactorEnabled = ref(false);
    const qrcodeURL = ref("");
    const codeSendToUrl = ref("authenticate");

    //To exchange cookie or auth header w/o in every req
    axios.defaults.withCredentials = true;

    onBeforeMount(() => {
      console.log("FROM", route.query.from);
      router.replace("/login"); // to remove code from URL: DIRTY ?
      console.log("isTwoFactorEnabled", isTwoFactorEnabled);
      if (route.query.code) {
        const code = route.query.code;
        axios
          .get("http://localhost:3000/auth/42/login", {
            params: {
              code: code,
            },
          })
          .then((res) => {
            console.log("status", res.status);
            if (res.status === 206) {
              isTwoFactorEnabled.value = true;
            } else if (res.status === 200) {
              router.push("account"); //find a way to push to requested route, not only account ??
            }
          })
          .catch((err: any) => console.log(err.message));
      }
    });

    const logInWith42 = () => {
      window.location.href = process.env.VUE_APP_42_AUTH_URL;
    };

    return {
      logInWith42,
      isTwoFactorEnabled,
      qrcodeURL,
      codeSendToUrl,
    };
  },
});
</script>

<style scoped>
</style>
