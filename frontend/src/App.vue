<script lang="ts">
import SideBar from "./components/SideBar.vue";
import Header from "./components/Header.vue";
import Toast from "@/components/Toast.vue";
import { io } from "socket.io-client";
import { useStore } from "@/store";
import { computed, onActivated, onUpdated, reactive } from "vue";
import { User } from "sdk/typescript-axios-client-generated";
import { presenceSocket } from "@/views/UserAccount.vue";
import { challengeMessage } from './types/PongGame';
import { useRouter } from 'vue-router';
import ReceiveChallengeVue from './views/Pong/ReceiveChallenge.vue';

export const pongSocket = io("http://localhost:3000/pong");
// export const presenceSocket = io("http://localhost:3000/presence", {
//   withCredentials: true
// });

export default {
  components: { SideBar, Header, Toast },
  setup() {
    const store = useStore();

    onUpdated(() => {
      console.log("onUpdated", store.state.user);
      if (store.state.user.id != 0) {
        if (!store.state.isConnected) {
          // console.log("newConnection");
          presenceSocket.emit("newConnection", store.state.user);
          store.state.isConnected = true;
        }
      }
    });
    presenceSocket.on("newUser", (user: User) => {
      store.commit("addOnlineUser", user);
      // console.log("onlineUsers", store.state.onlineUsers);
    });
    presenceSocket.on("allConnectedUsers", (user: User[]) => {
      store.commit("allConnectedUsers", user);
      // console.log("onlineUsers", store.state.onlineUsers);
    });
    presenceSocket.on("leftUser", (id: number) => {
      // console.log("removedUser", id);
      store.commit("removeOnlineUser", id);
      // console.log("OnlineUsers(afterRemoved)", store.state.onlineUsers);
    });

    pongSocket.on("newInGameUsers", (players: string[]) => {
      store.commit("addInGameUsers", players);
      console.log("new Ingame Users", players);
      console.log("inGameUsers", store.state.inGameUsers);
    })

    pongSocket.on("removeInGameUsers", (players: string[]) => {
      store.commit("removeInGameUsers", players);
      console.log("removed Ingame Users", players);
      console.log("inGameUsers", store.state.inGameUsers);
    })

    pongSocket.on("allPlayingUsers", (playersUserNames: string[]) => {
      store.commit("allPlayingUsers", playersUserNames);
      console.log("allPlayingUsers", store.state.inGameUsers);
    })

    const router = useRouter()
    pongSocket.on('challengeRequest', (message: challengeMessage) => {
			console.log('challenge received from ' + message.challengerName + ' to ' + message.challengeeName)
			if (message.challengeeId === store.state.user.id)
			{
				console.log('You have been challenged !')
        router.push({name: 'ChallengeReceived', params: {challengerId: message.challengerId, challengerName: message.challengerName, authorized: 'ok'}})
			}
		})

    return {
      user: computed(() => store.state.user),
      message: computed(() => store.state.message),
    };
  },
};
</script>

<template>
  <Header />
  <div class="main-div">
    <SideBar />
    <div class="router-view">
      <router-view :key="$route.fullPath" />
    </div>
  </div>
  <transition name="toast">
    <Toast v-if="message" :message="message" />
  </transition>
</template>

<style lang="scss">
@import "../sass/main.scss";
body {
  background: url("./assets/background.jpg");
}
</style>
