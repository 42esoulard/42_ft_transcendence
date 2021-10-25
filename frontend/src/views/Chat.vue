<template>
  <ChatComponent/>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { io } from "socket.io-client";
import ChatComponent from "@/components/chat/ChatComponent.vue"

export default defineComponent({
  name: "Chat",
  components: { ChatComponent },
});
</script>

<style>
/* DEFINE CHAT FOR MAIN TAB STYLE HERE (aka full view)*/
</style>
