<template>
  <div class="toast-wrapper">
    <div class="toast-content">
      {{ toDisplay }}
      <button class="button button--invitation" @click="accept">accept</button>
    </div>
  </div>
</template>

<script lang="ts">
import { pongSocket } from "@/App.vue";
import { store } from "@/store";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  name: "Toast",
  props: ["message"],
  setup(props) {
    const message = props.message;
    const pongLink = ref(message.includes("[PONG-LINK]"));

    const accept = () => {
      store.commit("removeChallenge", message.substr(0, message.indexOf(" ")));
      pongSocket.emit(
        "challengeAccepted",
        message.substr(0, message.indexOf(" "))
      );
    };

    const toDisplay = computed(() => {
      return message.replace("[PONG-LINK]", "");
    });

    return { toDisplay, pongLink, accept };
  },
});
</script>
