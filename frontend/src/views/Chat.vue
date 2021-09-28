<template>
  <ChatComponent/>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { io } from "socket.io-client";
import ChatComponent from "@/components/ChatComponent.vue"

const socket = io("http://localhost:3000");

export default defineComponent({
  name: "Chat",
  components: { ChatComponent },
});
</script>

<style>
/* DEFINE CHAT FOR MAIN TAB STYLE HERE (aka full view)*/
</style>
