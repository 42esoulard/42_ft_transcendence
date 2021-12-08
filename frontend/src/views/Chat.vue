<template>
  <ChatComponent />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { chatSocket } from "@/App.vue";
import ChatComponent from "@/components/chat/ChatComponent.vue";

export default defineComponent({
  name: "Chat",
  components: { ChatComponent },
  beforeRouteLeave() {
    chatSocket.emit("chatOff");
  },
});
</script>

<style></style>
