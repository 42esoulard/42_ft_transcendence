<template>
  <div>
    <div
      class="lds-roller"
      v-if="challengeStatus != 'challenge has been declined!'"
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div class="challenge-sent">
      <h1 class="challenge-status">{{ challengeStatus }}</h1>
      <button
        v-if="challengeStatus != 'challenge has been declined!'"
        class="button button--primary button--invitation"
        v-on:click="cancelChallenge()"
      >
        cancel
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { pongSocket } from "@/App.vue";
import { useStore } from "@/store";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { useUserApi } from "@/plugins/api.plugin";

export default defineComponent({
  props: {
    challengeeId: { type: String, required: true },
    challengeeName: { type: String, required: true },
  },
  inheritAttrs: false, // we dont need it, and not setting it to false a warning: "extraneous non prop attributes (authorized) were passed to component but could not be automatically inherited..."
  setup(props) {
    const store = useStore();
    const userApi = useUserApi();
    onMounted(() => {
      if (store.state.user.id !== 0) {
        userApi
          .getUser(store.state.user.id)
          .then(() =>
            challenge(Number(props.challengeeId), props.challengeeName)
          )
          .catch((err: any) => {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          });
      }
    });
    const challengeStatus = ref("");
    const challenge = (id: number, name: string) => {
      challengeStatus.value = "challenge sent to " + name;
      pongSocket.emit("challengeRequest", {
        challengerId: store.state.user.id,
        challengerName: store.state.user.username,
        challengeeId: id,
        challengeeName: name,
        expiry_date: new Date(new Date().getTime() + 30000),
        gameMode: "transcendence",
      });
      setTimeout(() => timedOutChallenge(), 30000);
    };

    const router = useRouter();

    const cancelChallenge = () => {
      pongSocket.emit("cancelChallenge", store.state.user.username);
      pongSocket.emit("challengeCanceled", Number(props.challengeeId));
      history.go();
    };

    const timedOutChallenge = () => {
      if (
        store.state.inGameUsers.find((u) => u === store.state.user.username)
      ) {
        return;
      }
      pongSocket.emit("cancelChallenge", store.state.user.username);
      challengeStatus.value = "challenge has been declined!";
      setTimeout(() => {
        history.go();
      }, 2000);
    };

    pongSocket.on("challengeDeclined", () => {
      challengeStatus.value = "challenge has been declined!";
      setTimeout(() => {
        history.go();
      }, 2000);
    });

    onBeforeRouteLeave(() => {
      pongSocket.off("challengeDeclined");
      pongSocket.emit("cancelChallenge", store.state.user.username);
    });

    return { challengeStatus, cancelChallenge };
  },
});
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>
