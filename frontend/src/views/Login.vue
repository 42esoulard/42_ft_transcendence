<template>
  <h1>Welcome to ft_transcendence</h1>
  <div v-if="isTwoFactorEnabled">
    <OtpInput :codeSendToUrl="codeSendToUrl" />
  </div>
  <div v-else class="log-in-div">
    <button class="button button--log-in" @click="logInWith42">
      <span>Login with  </span>
      <img class="button-log-in__logo" src="../assets/42_logo_white.png" alt="">
    </button>
    <button class="button button--log-in" @click="$router.push('fake-login')">Login with fake user</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import OtpInput from "@/components/OtpInput.vue";
import { useStore } from "vuex";
import axios from "axios";

export default defineComponent({
  name: "Login",
  components: { OtpInput },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();

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
              // Put this commit under if block, condition from backend: first connect == true
              store.commit('setFirstTimeConnect', true);
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
