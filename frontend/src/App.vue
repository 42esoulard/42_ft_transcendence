<script lang="ts">
import SideBar from "./components/SideBar.vue"
import Header from "./components/Header.vue"
import { io } from "socket.io-client"
import { useStore } from "vuex"
import { computed } from "vue"

export const clientSocket = io('http://localhost:3000/pong')

export default {
  components: { SideBar, Header },
  setup() {
    const store = useStore();
    return {
      user: computed(() => store.state.user),
    };
  }

}
</script>

<template>
  <SideBar />
  <div class="main-div">
    <Header />
    <div class="router-view">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss">
  @import "../sass/main.scss";
  body {
    background: url("./assets/background.jpg");
  }
</style>
