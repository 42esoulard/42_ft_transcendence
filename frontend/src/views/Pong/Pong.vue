<template>
  <div class="pong-main">
    <div class="pong-launch">
      <div
        v-if="!queuing && challengee.name == undefined"
        class="pong-launch pong-launch--bis"
      >
        <h1 class="pong-launch__title">Random game</h1>
        <div class="pong-launch__buttons">
          <button
            @click="toggleClassic"
            :class="[
              'pong-launch__selector',
              classicMode ? 'pong-launch__selector--on' : '',
            ]"
          >
            classic mode
          </button>
          <button
            @click="toggleCustom"
            :class="[
              'pong-launch__selector',
              classicMode ? '' : 'pong-launch__selector--on',
            ]"
          >
            transcendence
          </button>
        </div>
        <button class="button button--start" v-on:click="JoinQueue()">
          Play
        </button>
      </div>
      <div v-else-if="!queuing && challengee.name">
        <SendChallenge
          :challengeeId="challengee.id"
          :challengeeName="challengee.name"
          }
        />
      </div>
      <div v-else>
        <div class="lds-roller">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <h1>Matchmaking...</h1>
      </div>
    </div>

    <div class="pong-invitations">
      <div class="list-div">
        <h1>Invitations</h1>
        <hr />
        <div class="table__body">
          <ReceiveChallenge />
        </div>
      </div>
    </div>

    <Ruleset />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";
import { pongSocket } from "@/App.vue";
import { useStore } from "@/store";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { gameMode } from "@/types/PongGame";
import { useUserApi } from "@/plugins/api.plugin";
import { User } from "sdk/typescript-axios-client-generated";
import ReceiveChallenge from "./ReceiveChallenge.vue";
import SendChallenge from "./SendChallenge.vue";
import Ruleset from "../../components/Ruleset.vue";

export default defineComponent({
  components: { SendChallenge, ReceiveChallenge, Ruleset },
  props: {
    challengeeId: { type: String },
    challengeeName: { type: String },
  },
  setup(props) {
    const queuing = ref(false);
    const gameMode = ref<gameMode>("transcendence");
    const api = useUserApi();
    const users = ref<User[]>([]);
    const classicMode = ref(true);
    const challengee = { id: props.challengeeId, name: props.challengeeName };
    const userApi = useUserApi();

    const store = useStore();
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

    const JoinQueue = () => {
      if (store.state.user.id !== 0) {
        userApi
          .getUser(store.state.user.id)
          .then(() => {
            if (userStatus(store.state.user) == "ingame") {
              store.dispatch("setErrorMessage", "you're already playing!");
              return;
            }
            pongSocket.emit("joinGame", {
              userId: store.state.user.id,
              userName: store.state.user.username,
              gameMode: classicMode.value ? "classic" : "transcendence",
            });
          })
          .catch((err: any) => {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
            window.location.reload();
          });
      }
    };

    pongSocket.on("addedToQueue", () => {
      queuing.value = true;
    });

    pongSocket.on("alreadyInQueue", () => {
      store.dispatch("setErrorMessage", "you're already in queue!");
      return;
    });

    const router = useRouter();

    onBeforeRouteLeave(() => {
      pongSocket.off("addedToQueue");
      pongSocket.off("alreadyInQueue");
      if (queuing.value) pongSocket.emit("leaveQueue");
    });

    onMounted(() => {
      api
        .getUsers()
        .then((res: any) => (users.value = res.data))
        .catch((err) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    });

    const toggleClassic = () => (classicMode.value = true);
    const toggleCustom = () => (classicMode.value = false);

    return {
      queuing,
      JoinQueue,
      gameMode,
      users,
      classicMode,
      toggleClassic,
      toggleCustom,
      challenges: computed(() => store.state.challengesReceived),
      challengee,
    };
  },
});
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>
