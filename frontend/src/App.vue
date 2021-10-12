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
  <div class="main-div">
    <SideBar />
    <div class="body-div">
      <Header />
      <div class="router-view">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../sass/main.scss";
  body {
    background: url("./assets/background.jpg");
    //background-color: white;
  }
</style>
