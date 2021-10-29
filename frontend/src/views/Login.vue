<template>
  <h1>Welcome to ft_transcendence</h1>
  <div v-if="isTwoFactorEnabled">
    <OtpInput :authApi="authApi" :codeSendToUrl="codeSendToUrl" />
  </div>
  <div v-else class="log-in-div">
    <button class="button button--log-in" @click="logInWith42">
      <span>Login with </span>
      <img
        class="button-log-in__logo"
        src="../assets/42_logo_white.png"
        alt=""
      />
    </button>
    <button class="button button--log-in" @click="$router.push('fake-login')">
      Login with fake user
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import OtpInput from "@/components/OtpInput.vue";
import { useStore } from "vuex";
import { useAuthApi } from "@/plugins/api.plugin";
import { User } from "@/types/User";
import { presenceSocket } from "@/App.vue";


export default defineComponent({
  name: "Login",
  components: { OtpInput },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const authApi = useAuthApi();

    const isTwoFactorEnabled = ref(false);
    const qrcodeURL = ref("");
    const codeSendToUrl = ref("authenticate");
    

    onBeforeMount(() => {
      let redirectUrl = "account";
      if (route.query.state != "undefined") {
        redirectUrl = route.query.state as string;
      }
      if (route.query.code) {
        const code = route.query.code;
        // router.replace("/login"); // to remove code from URL: DIRTY ?

        authApi
          .login({ params: { code: code }, withCredentials: true })
          .then(async (res: any) => {
            if (res.status === 206) {
              isTwoFactorEnabled.value = true;
            } else if (res.status === 200) {
              if (res.data.newlyCreated == true) {
                store.commit("setFirstTimeConnect", true);
              }
              await getProfile();
              sendConnection();
              router.push(redirectUrl);
            }
          })
          .catch((err: any) => console.log(err.message));
      }
    });

    const getProfile = async () => {
      await authApi
        .profile({withCredentials: true})
        .then(response => {
          store.state.user = response.data;
        })
        .catch( (err: Error) => {
          console.log("ERROR GET PROFILE");
        });
    };

    const sendConnection = () => {
      presenceSocket.emit("connection", store.state.user);
      // console.log("NEWLY CONNECTED USER", store.state.user);
    };

    presenceSocket.on("newUser", (user: User) => {
      store.commit('addOnlineUser', user);
      console.log("onlineUsers", store.state.onlineUsers);
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
      codeSendToUrl,
      authApi
    };
  }
});
</script>
