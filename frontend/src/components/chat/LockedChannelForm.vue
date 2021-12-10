<template>
  <div class="chat-channel-form">
    <div @click="closeModal()" class="close-cross">&times;</div>

    <form class="chat-channel-form__form" @submit.prevent="checkPassword()">
      <div class="chat-channel-form__title">
        [{{ channel.name }}] is a password-protected community.
      </div>
      <div class="chat-channel-form__subtitle">
        To join, please enter the channel's password:
      </div>

      <input
        class="chat-channel-form__input"
        required
        type="text"
        name="password"
        placeholder="Channel Password"
        minlength="1"
        v-model="passwordAttempt"
        @input="reinitError()"
      />
      <button class="button button--join-locked-chan" type="submit">
        Submit
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, computed } from "vue";
import { ChatApi } from "@/../sdk/typescript-axios-client-generated";
import { useStore } from "@/store";

export default defineComponent({
  name: "LockedChannelForm",
  props: ["channel"],

  setup(props, context) {
    const api = new ChatApi();

    const passwordInput = computed(
      () => <HTMLInputElement>document.querySelector("input")!
    );
    const passwordAttempt = ref("");
    const store = useStore();

    const closeModal = () => {
      context.emit("close");
    };

    const reinitError = () => {
      passwordInput.value.setCustomValidity("");
    };

    const checkPassword = () => {
      api
        .checkPasswordMatch(props.channel.id, passwordAttempt.value, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.data) {
            context.emit("join-channel", props.channel);
            closeModal();
          } else {
            passwordInput.value.setCustomValidity("Wrong channel password.");
            passwordInput.value.reportValidity();
            return;
          }
        })
        .catch((err) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    };

    return {
      passwordAttempt,
      checkPassword,
      reinitError,
      closeModal,
    };
  },
});
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>
