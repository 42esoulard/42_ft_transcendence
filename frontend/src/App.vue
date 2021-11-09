<script lang="ts">
import SideBar from "./components/SideBar.vue";
import Header from "./components/Header.vue";
import Toast from "@/components/Toast.vue";
import { io } from "socket.io-client";
import { useStore } from "vuex";
import { computed, onActivated, onUpdated, reactive } from "vue";
import { User } from "./types/User";
import { presenceSocket } from "@/views/UserAccount.vue";

export const clientSocket = io("http://localhost:3000/pong");
// export const presenceSocket = io("http://localhost:3000/presence", {
//   withCredentials: true
// });

export default {
  components: { SideBar, Header, Toast },
  setup() {
    const store = useStore();

    onUpdated(() => {
      // console.log("onUpdated", store.state.user);
      if (store.state.user) {
        if (!store.state.isConnected) {
          console.log("newConnection");
          presenceSocket.emit("newConnection", store.state.user);
          store.state.isConnected = true;
        }
      }
    });
    presenceSocket.on("newUser", (user: User) => {
      store.commit("addOnlineUser", user);
      console.log("onlineUsers", store.state.onlineUsers);
    });
    presenceSocket.on("allConnectedUsers", (user: User[]) => {
      store.commit("allConnectedUsers", user);
      console.log("onlineUsers", store.state.onlineUsers);
    });
    presenceSocket.on("leftUser", (id: number) => {
      console.log("removedUser", id);
      store.commit("removeOnlineUser", id);
      console.log("OnlineUsers(afterRemoved)", store.state.onlineUsers);
    });

    return {
      user: computed(() => store.state.user),
      message: computed(() => store.state.message)
    };
  }
};
</script>

<template>
  <Header />
  <div class="main-div">
    <SideBar />
    <div class="router-view">
      <transition name="fade--log">
        <router-view :key="$route.fullPath" />
      </transition>
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
