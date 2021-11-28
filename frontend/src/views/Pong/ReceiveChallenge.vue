<template>
  <div v-for="challenger in challenges" :key="challenger">
    <div class="pong-invitation">
      <div class="pong-invitation__countdown">
        <i class="fas fa-stopwatch" /> 30s
      </div>
      <router-link
        :class="['link', 'link--user-list']"
        :to="{ name: 'UserProfile', params: { username: challenger } }"
      >
        {{ challenger }}
      </router-link>
      <div class="pong-invitation__buttons">
        <button
          class="button button--third button--invitation"
          v-on:click="accept(challenger)"
        >
          accept
        </button>
        <button
          class="button button--invitation"
          v-on:click="refuse(challenger)"
        >
          decline
        </button>
      </div>
    </div>
    <hr />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { pongSocket } from "@/App.vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { store } from "@/store";

export default defineComponent({
  setup(props) {
    const router = useRouter();

    const accept = (challengerName: string) => {
      store.commit("removeChallenge", challengerName);
      pongSocket.emit("challengeAccepted", challengerName);
    };
    const refuse = (challengerName: string) => {
      store.commit("removeChallenge", challengerName);
      pongSocket.emit("challengeDeclined", challengerName);
    };

    pongSocket.on("challengeCancelled", (challengerName: string) => {
      store.commit("removeChallenge", challengerName);
    });

    onBeforeRouteLeave(() => {
      pongSocket.off("challengeCancelled");
    });

    return {
      accept,
      refuse,
      challenges: computed(() => store.state.challengesReceived),
    };
  },
});
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>
