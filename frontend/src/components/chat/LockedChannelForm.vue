<template>
  <!-- 
    - Name? [check it doesn't exist yet in db]
    - Type [radio buttons]: public? Private (newcomers must be invited by a member)?
    - If password-protected: [check regex OK, check password match]
      1) please enter a password for the room (a-zA-Z0-9/*-+_):
      2) please re-enter the password:
  -->
  <div class='chat-locked'>
    <div @click="closeModal()" class="close-cross">
      &times;
    </div>

    <form class="chat-locked__form" @submit.prevent='checkPassword()'>
      <div class="chat-locked__title">{{ channel.name }} is a password-protected community.</div>
      <div class="chat-locked__title">To join, please enter the channel's password:</div>

      <input class="chat-locked__input" required type="text" name='password' placeholder='Channel Password' minlength="1" v-model="passwordAttempt">
      <button class="button button--join-locked-chan" type='submit'>Submit</button>
    </form>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";
import { DefaultApi } from "@/../sdk/typescript-axios-client-generated";
import { socket } from "./ChatComponent.vue"
import { useStore } from 'vuex'
import { Channel } from "@/types/Channel";
 
export default defineComponent({
  name: 'LockedChannelForm',
  props: [ 'channel' ],
  // methods: {
  //   joinChannel(chan: Channel) {
  //     this.$parent.joinChannel(chan);
  //   },
  //   toggleModal() {
  //     this.$parent.toggleModal(1);
  //   }
  // },
  setup(props, context) {
    const api = new DefaultApi();

    const passwordAttempt = ref('');
    const user = useStore().state.user;
    const sock = ref(socket);

    const closeModal = () => {
      context.emit("close");
    };

    const checkPassword = () => {
      const passwordInput = <HTMLInputElement>document.querySelector('input')!;

      passwordInput.setCustomValidity("");
      api.checkPasswordMatch(props.channel.id, passwordAttempt.value)
      .then((res) => {
        console.log("password match res", res)
        if (res.data) {
          context.emit('join-channel', props.channel);
          closeModal();
        }
        else {
          passwordInput.setCustomValidity("Wrong channel password.");
          return ;
        }
      })
      .catch((err) => console.log(err));


      // if (!/^[-_*-+/a-zA-Z0-9]*$/.test(channelPassword.value)) {
      //   passwordInput.setCustomValidity("Channel password must be 8-20 characters long and only contain letters, numbers, or the following symbols -_*-+/");
      //   validPassword = false;
      // } else if (!validPassword) {
      //   passwordInput.setCustomValidity('');
      //   validPassword = true;
      // }
      // if (channelPasswordConf.value)
      //   checkPasswordConf();
    }

    // const checkPasswordConf = () => {
    //   const passwordConfirmationInput = <HTMLInputElement>document.querySelector('input#passwordConfirmation')!;

    //   if (channelPasswordConf.value !== channelPassword.value) {
    //     passwordConfirmationInput.setCustomValidity("Password and password confirmation don't match");
    //     validPasswordConf = false;
    //   } else if (!validPasswordConf) {
    //     passwordConfirmationInput.setCustomValidity('');
    //     validPasswordConf = true;
    //   }
    // }
    
    // const submitInputs = () => {
 
    //   checkName();
    //   checkPassword();
    //   checkPasswordConf();
    //   if (!validPassword || !validPasswordConf)
    //     return;
    
    //   if (!validName)
    //     return;
    //   console.log(channelName.value, channelType.value, channelPassword.value)
    //   const newChannel = api.saveChannel({
    //     name: channelName.value,
    //     owner_id: user.id, 
    //     type: channelType.value,
    //     password: channelPassword.value
    //   })
    //   .then((res) => {
    //     console.log("in createChannel res", res)
    //     socket.emit('createChannel', res.data)
    //   })
    //   .catch((err) => console.log("Failed to create channel: ", err))
    // }

    return {
      passwordAttempt,
      checkPassword,
      closeModal,
    }
  }
});
</script>

<style lang="scss">
  @import "../../../sass/main.scss";
</style>