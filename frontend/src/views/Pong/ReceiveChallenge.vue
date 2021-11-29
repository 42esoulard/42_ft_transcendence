<template>
  <div
    v-for="challenge in challengesList"
    :key="challenge"
    class="pong-challenges"
  >
    <div class="pong-invitation">
      <router-link
        :class="['link', 'link--user-list']"
        :to="{
          name: 'UserProfile',
          params: { username: challenge.challenger },
        }"
      >
        {{ challenge.challenger }}
      </router-link>
      <div class="pong-invitation__buttons">
        <button
          class="button button--third button--invitation"
          v-on:click="accept(challenge.challenger)"
          title="accept"
        >
          accept
        </button>
        <button
          class="button button--invitation"
          v-on:click="refuse(challenge.challenger)"
          title="decline"
        >
          decline
        </button>
      </div>
    </div>
    <hr />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onUpdated, ref } from "vue";
import { pongSocket } from "@/App.vue";
import { store } from "@/store";

export default defineComponent({
  setup() {
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

    return {
      accept,
      refuse,
      challengesList: computed(() => store.state.challengesReceived),
    };
  },
});
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>
