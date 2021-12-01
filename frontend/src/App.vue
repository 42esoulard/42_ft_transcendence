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

<script lang="ts">
import SideBar from "./components/SideBar.vue";
import Header from "./components/Header.vue";
import Toast from "@/components/Toast.vue";
import { io } from "socket.io-client";
import { useStore } from "@/store";
import { computed, onUpdated } from "vue";
import { Relationship, User } from "sdk/typescript-axios-client-generated";
import { challengeExport, challengeMessage, gameMode } from "./types/PongGame";
import { useRouter } from "vue-router";

export const pongSocket = io("http://localhost:3000/pong");
export const presenceSocket = io("http://localhost:3000/presence");
export const chatSocket = io("http://localhost:3000/chat");

export default {
  components: { SideBar, Header, Toast },
  setup() {
    const store = useStore();

    onUpdated(() => {
      if (store.state.user.id != 0) {
        if (!store.state.isConnected) {
          console.log("newConnection");
          presenceSocket.emit("newConnection", store.state.user);
          chatSocket.emit("newConnection", store.state.user);
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
    });

    pongSocket.on("removeInGameUsers", (players: string[]) => {
      store.commit("removeInGameUsers", players);
      console.log("removed Ingame Users", players);
      console.log("inGameUsers", store.state.inGameUsers);
    });

    pongSocket.on("allPlayingUsers", (playersUserNames: string[]) => {
      store.commit("allPlayingUsers", playersUserNames);
      console.log("allPlayingUsers", store.state.inGameUsers);
    });

    pongSocket.on(
      "gameReadyToStart",
      (
        room: string,
        player1UserName: string,
        player2UserName: string,
        gameMode: gameMode
      ) => {
        router.push({
          name: "PongGame",
          params: {
            room,
            player1UserName,
            player2UserName,
            gameMode,
            authorized: "ok",
            userType: "player",
          },
        });
      }
    );

    const router = useRouter();
    pongSocket.on("challengeRequest", (message: challengeMessage) => {
      console.log(
        "challenge received from " +
          message.challengerName +
          " to " +
          message.challengeeName
      );
      if (message.challengeeId === store.state.user.id) {
        store.commit("addChallenge", {
          challenger: message.challengerName,
          expiry_date: message.expiry_date,
        });
        store.dispatch(
          "setChallenge",
          `${message.challengerName} challenged you! [PONG-LINK]`
        );
      }
    });

    pongSocket.on("allPendingChallenges", (message: challengeExport[]) => {
      store.commit("allPendingChallenges", message);
    });

    chatSocket.on("chatNotifications", () => {
      store.state.chatNotification = true;
    });

    chatSocket.on("chat-message", (data: any) => {
      // console.log("HERE", store.state.chatOn)
      if (store.state.user.id != 0) {
        if (store.state.chatOn) { 
          //meow!
          chatSocket.emit("chat-message-on", data);
        } else if (store.state.isConnected) {
          // store.state.chatNotification = true;
          chatSocket.emit("chat-message-off", data, store.state.user);
        }
      }
    });

    return {
      user: computed(() => store.state.user),
      message: computed(() => store.state.message),
    };
  },
};
</script>

<style lang="scss">
@import "../sass/main.scss";
body {
  background: url("./assets/background.jpg");
}
</style>
