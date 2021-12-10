<template>
  <!--
    - Name? [check it doesn't exist yet in db]
    - Type [radio buttons]: public? Private (newcomers must be invited by a member)?
    - If password-protected: [check regex OK, check password match]
      1) please enter a password for the room (a-zA-Z0-9/*-+_):
      2) please re-enter the password:
  -->
  <div class="chat-channel-form">
    <div @click="closeModal()" class="close-cross">&times;</div>

    <form class="chat-channel-form__form" @submit.prevent="submitInputs()">
      <div class="chat-channel-form__title">Creating a new channel</div>

      <label class="chat-channel-form__subtitle" for="name"
        >Channel name:*</label
      >
      <input
        class="chat-channel-form__input"
        required
        type="text"
        name="name"
        id="chanName"
        placeholder="My Cool Channel"
        minlength="1"
        maxlength="200"
        v-model="channelName"
        @input="checkName()"
      />

      <div class="channelAccessContainer">
        <label class="chat-channel-form__subtitle">Channel access:*</label>
        <label
          class="chat-channel-form__radio-container"
          title="A public channel is visible and accessible to any user"
          id="public"
        >
          <input
            type="radio"
            class="chat-channel-form__radio-unit"
            id="chanPublic"
            name="unit"
            value="public"
            v-model="channelType"
          />Public
        </label>
        <label
          class="chat-channel-form__radio-container"
          title="An invite-only channel is only accessible to members who have been invited to join by a channel member"
          id="Private (invite-only)"
        >
          <input
            type="radio"
            class="chat-channel-form__radio-unit"
            id="chanPrivate"
            name="unit"
            value="private"
            v-model="channelType"
          />Private
        </label>
      </div>

      <label class="chat-channel-form__subtitle" for="password"
        >Channel password (optional):</label
      >
      <input
        class="chat-channel-form__input"
        type="text"
        name="password"
        id="password"
        placeholder="Password (optionnal)"
        minlength="8"
        maxlength="20"
        v-model="channelPassword"
        @input="checkPassword()"
      />
      <label class="chat-channel-form__subtitle" for="passwordConfirmation"
        >Password confirmation:</label
      >
      <input
        class="chat-channel-form__input"
        type="text"
        name="passwordConfirmation"
        id="passwordConfirmation"
        v-model="channelPasswordConf"
        @input="checkPasswordConf()"
      />

      <button
        class="button button--create-chan"
        :disabled="wasSubmitted"
        type="submit"
      >
        Submit
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, computed, onMounted } from "vue";
import { ChatApi } from "@/../sdk/typescript-axios-client-generated";
import { chatSocket } from "@/App.vue";
import { store, useStore } from "@/store";

export default defineComponent({
  name: "NewChannelForm",
  setup(props, context) {
    const api = new ChatApi();

    const channelName = ref("");
    const channelType = ref("public");
    const channelPassword = ref("");
    const channelPasswordConf = ref("");
    const user = useStore().state.user;
    const wasSubmitted = ref(false);

    let validName = true;
    let validPassword = true;
    let validPasswordConf = true;

    let channelNames = <string[]>[];

    const getChannelNames = () => {
      return api
        .getChannelsNames({ withCredentials: true })
        .then((res) => {
          channelNames = res.data;
        })
        .catch((err) => {
          {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          }
        });
    };
    getChannelNames();

    const closeModal = () => {
      context.emit("close");
    };

    const checkName = () => {
      const nameInput = <HTMLInputElement>(
        document.querySelector("input[id='chanName']")!
      );

      if (channelNames.includes(channelName.value)) {
        nameInput.setCustomValidity(
          "A channel named [" + channelName.value + "] already exists"
        );
        validName = false;
      } else {
        nameInput.setCustomValidity("");
        validName = true;
      }
      nameInput.reportValidity();
    };

    const checkNameInDb = async () => {
      const nameInput = <HTMLInputElement>(
        document.querySelector("input[id='chanName']")!
      );

      await api
        .getChannelByName(channelName.value, { withCredentials: true })
        .then(() => {
          nameInput.setCustomValidity(
            "A channel named [" + channelName.value + "] already exists"
          );
          validName = false;
        })
        .catch(() => {
          nameInput.setCustomValidity("");
          validName = true;
        });
      nameInput.reportValidity();
    };

    const checkPassword = () => {
      const passwordInput = <HTMLInputElement>(
        document.querySelector("input#password")!
      );

      if (!/^[-_*-+/a-zA-Z0-9]*$/.test(channelPassword.value)) {
        passwordInput.setCustomValidity(
          "Channel password must be 8-20 characters long and only contain letters, numbers, or the following symbols -_*-+/"
        );
        validPassword = false;
      } else if (!validPassword) {
        passwordInput.setCustomValidity("");
        validPassword = true;
      }
      if (channelPasswordConf.value) checkPasswordConf();
    };

    const checkPasswordConf = () => {
      const passwordConfirmationInput = <HTMLInputElement>(
        document.querySelector("input#passwordConfirmation")!
      );

      if (channelPasswordConf.value !== channelPassword.value) {
        passwordConfirmationInput.setCustomValidity(
          "Password and password confirmation don't match"
        );
        validPasswordConf = false;
      } else if (!validPasswordConf) {
        passwordConfirmationInput.setCustomValidity("");
        validPasswordConf = true;
      }
    };

    const submitInputs = async () => {
      checkPassword();
      checkPasswordConf();
      if (!validPassword || !validPasswordConf) return;

      checkNameInDb().then(() => {
        if (validName) {
          createChannel();
        }
      });
    };

    const createChannel = () => {
      wasSubmitted.value = true;
      api
        .saveChannel(
          {
            name: channelName.value,
            owner_id: user.id,
            type: channelType.value,
            password: channelPassword.value,
            notification: false,
            recipient_id: 0,
          },
          { withCredentials: true }
        )
        .then((res) => {
          chatSocket.emit("createChannel", res.data);
          closeModal();
        })
        .catch((err) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    };

    return {
      channelName,
      channelType,
      channelPassword,
      channelPasswordConf,
      checkName,
      checkPassword,
      checkPasswordConf,
      submitInputs,
      wasSubmitted,
      closeModal,
    };
  },
});
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>
