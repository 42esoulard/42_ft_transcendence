<template>
  <div v-if="isTwoFactorEnabled">
    <OtpInput :authApi="authApi" :codeSendToUrl="codeSendToUrl" />
  </div>
  <div v-else class="log-in">
    <div class="log-in-stat">
      <span class="log-in-stat__text log-in-stat__text--number">{{
        nbGames
      }}</span>
      <span class="log-in-stat__text">games</span>
    </div>
    <div class="log-in-buttons">
      <button
        class="button button--log-in button--log-in--with-ft"
        @click="logInWith42"
      >
        <span>Login with </span>
        <img
          class="button-log-in__logo"
          src="../assets/42_logo_white.png"
          alt=""
        />
      </button>
    </div>
    <div class="log-in-stat">
      <span class="log-in-stat__text log-in-stat__text--number">{{
        nbUsers
      }}</span>
      <span class="log-in-stat__text">users</span>
    </div>
    <div class="log-in-stat">
      <span class="log-in-stat__text log-in-stat__text--number">{{
        nbOngoing
      }}</span>
      <span class="log-in-stat__text">ongoing</span>
    </div>
    <div class="log-in-stat">
      <span class="log-in-stat__text log-in-stat__text--number">{{
        nbOnline
      }}</span>
      <span class="log-in-stat__text">online</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import OtpInput from "@/components/OtpInput.vue";
import { useStore } from "@/store";
import { useAuthApi, useRelationshipApi } from "@/plugins/api.plugin";
import { useUserApi } from "@/plugins/api.plugin";
import { usePongApi } from "@/plugins/api.plugin";
import { User } from "sdk/typescript-axios-client-generated";
import { chatSocket } from "@/App.vue";

export default defineComponent({
  name: "Login",
  components: { OtpInput },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const authApi = useAuthApi();
    const userApi = useUserApi();
    const pongApi = usePongApi();
    const relationshipApi = useRelationshipApi();
    const nbUsers = ref();
    const nbGames = ref();
    const nbOngoing = ref();
    const nbOnline = ref(store.state.onlineUsers.length);

    const isTwoFactorEnabled = ref(false);
    const qrcodeURL = ref("");
    const codeSendToUrl = ref("authenticate");

    onBeforeMount(async () => {
      if (route.query.code) {
        const code = route.query.code;

        await authApi
          .login({ params: { code: code }, withCredentials: true })
          .then((res: any) => {
            if (res.status === 206) {
              isTwoFactorEnabled.value = true;
            } else if (res.status === 200) {
              if (res.data.newlyCreated == true) {
                store.commit("setFirstTimeConnect", true);
                router.push(`/profile/${res.data.username}`);
              } else router.push("/");
            }
          })
          .catch((err: any) => {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
            return;
          });

        if (!isTwoFactorEnabled.value) {
          await getProfile();
          if (store.state.user.id != 0) {
            relationshipApi
              .getPendingRelationships(store.state.user.id)
              .then((res: any) => {
                if (res.data.length > 0) store.state.toggleFriendship = true;
              })
              .catch((err: any) => {
                if (err && err.response)
                  store.dispatch("setErrorMessage", err.response.data.message);
              });
          }
        }
      }
    });

    onMounted(() => {
      userApi
        .getUsers()
        .then((res: any) => (nbUsers.value = res.data.length))
        .catch((err: any) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
      pongApi
        .getAll()
        .then((res: any) => (nbGames.value = res.data.length))
        .catch((err: any) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
      pongApi
        .getOnGoingGames()
        .then((res: any) => (nbOngoing.value = res.data.length))
        .catch((err: any) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    });

    const getProfile = async () => {
      await authApi
        .profile({ withCredentials: true })
        .then((response) => {
          chatSocket.emit("isAlreadyConnected", response.data);
          store.state.user = response.data;
        })
        .catch((err) => {
          {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          }
        });
    };

    const logInWith42 = () => {
      window.location.href = process.env.VUE_APP_42_AUTH_URL;
    };

    return {
      logInWith42,
      isTwoFactorEnabled,
      qrcodeURL,
      codeSendToUrl,
      authApi,
      nbUsers,
      nbOnline,
      nbOngoing,
      nbGames,
    };
  },
});
</script>
