<template>
  <div class="toast-wrapper" v-if="message != undefined">
    <div class="toast-content">
      {{ toDisplay }}
      <button v-if="pongLink" class="button button--invitation" @click="accept">
        accept
      </button>
    </div>
  </div>
  <div class="toast-wrapper" v-else>
    <div class="toast-content toast-content--error">
      {{ toDisplayError }}
    </div>
  </div>
</template>

<script lang="ts">
import { pongSocket } from "@/App.vue";
import { useUserApi } from "@/plugins/api.plugin";
import { store } from "@/store";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  name: "Toast",
  props: ["message", "errorMessage"],
  setup(props) {
    const message = props.message;
    const errorMessage = props.errorMessage;
    const pongLink =
      message != undefined ? ref(message.includes("[PONG-LINK]")) : ref();
    const userApi = useUserApi();

    const accept = () => {
      userApi
        .getUser(store.state.user.id)
        .then(() => {
          store.commit(
            "removeChallenge",
            message.substr(0, message.indexOf(" "))
          );
          pongSocket.emit(
            "challengeAccepted",
            message.substr(0, message.indexOf(" "))
          );
        })
        .catch((err: any) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
          window.location.reload();
        });
    };

    const toDisplay = computed(() => {
      return message.replace("[PONG-LINK]", "");
    });

    const toDisplayError = computed(() => {
      return `Error: ${errorMessage}`;
    });

    return { toDisplay, toDisplayError, pongLink, accept };
  },
});
</script>
