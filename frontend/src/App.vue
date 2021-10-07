<script lang="ts">
import SideBar from "./components/SideBar.vue"
import Header from "./components/Header.vue"
import { io } from "socket.io-client"

export const clientSocket = io('http://localhost:3000/pong')

export default {
  components: { SideBar, Header },
  setup() {
  }
}

</script>

<template>
  <Header />
  <SideBar />
  <router-view />
</template>

<style lang="scss">
  @import "../sass/main.scss";
  body {
    //background: url("./assets/background.jpg");
    background-color: white;
  }
  .app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: black;
  }
</style>
