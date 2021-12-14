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
import { User } from "sdk/typescript-axios-client-generated";
import { useUserApi } from "@/plugins/api.plugin";

export default defineComponent({
  setup() {
    const userApi = useUserApi();
    const userStatus = (user: User): "online" | "offline" | "ingame" => {
      if (user != undefined) {
        const inGameUser = store.state.inGameUsers.find(
          (u) => u === user.username
        );
        const onlineUser = store.state.onlineUsers.find(
          (u) => u.id === user.id
        );
        if (inGameUser) {
          return "ingame";
        } else if (onlineUser) {
          return "online";
        }
      }
      return "offline";
    };

    const accept = (challengerName: string) => {
      if (store.state.user.id !== 0) {
        userApi
          .getUser(store.state.user.id)
          .then(() => {
            if (userStatus(store.state.user) == "ingame") {
              store.dispatch("setErrorMessage", "you're already playing!");
              return;
            }
            if (
              store.state.challengesReceived.filter(
                (chall) => chall.challenger == challengerName
              ).length
            ) {
              store.commit("removeChallenge", challengerName);
              pongSocket.emit("challengeAccepted", challengerName);
              store.dispatch("setMessage", "");
            }
          })
          .catch((err: any) => {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
            window.location.reload();
          });
      }
    };

    const refuse = (challengerName: string) => {
      store.commit("removeChallenge", challengerName);
      pongSocket.emit("challengeDeclined", challengerName);
      store.dispatch("setMessage", "");
    };

    pongSocket.on("challengeCancelled", (challengerName: string) => {
      store.commit("removeChallenge", challengerName);
      store.dispatch("setMessage", "");
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
