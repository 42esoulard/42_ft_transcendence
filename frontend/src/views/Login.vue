<template>
  <h1>Welcome to ft_transcendence</h1>
  <div v-if="isTwoFactorEnabled">
    <OtpInput :codeSendToUrl="codeSendToUrl" />
  </div>
  <div v-else>
    <h2>Please Login</h2>
    <button class="button button--log-in" @click="logInWith42">Login with 42</button>
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
    // axios.defaults.withCredentials = true;

    onBeforeMount(() => {
      let redirectUrl = "account";
      if (route.query.state != "undefined") {
        redirectUrl = route.query.state as string;
      }
      if (route.query.code) {
        const code = route.query.code;
        // router.replace("/login"); // to remove code from URL: DIRTY ?
        axios
          .get("http://localhost:3000/auth/42/login", {
            params: {
              code: code
            }
          })
          .then(res => {
            if (res.status === 206) {
              isTwoFactorEnabled.value = true;
            } else if (res.status === 200) {
              // console.log('REDIRECT', redirectUrl);
              router.push(redirectUrl);
            }
          })
          .catch((err: any) => console.log(err.message));
      }
    });

    const logInWith42 = () => {
      if (route.query.from === "undefined") {
        route.query.from = "account";
      }
      window.location.href = `${process.env.VUE_APP_42_AUTH_URL}&state=${route.query.from}`;
    };

    return {
      logInWith42,
      isTwoFactorEnabled,
      qrcodeURL,
      codeSendToUrl
    };
  }
});
</script>

<style scoped>
</style>
