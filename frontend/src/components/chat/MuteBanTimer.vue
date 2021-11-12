<template>

  <div v-if="action === 'unmute' || action === 'unban'" class='chat-channel-form'>
    <div @click="closeModal()" class="close-cross">
      &times;
    </div>

    <form class="chat-channel-form__form" @submit.prevent='unmuteUnban()'>
      <div class="chat-channel-form__subtitle">[{{ targetCm.member.username }}] is {{ state }} until {{ getEndDate() }}</div>
      <!-- <div class="chat-channel-form__subtitle">To join, please enter the channel's password:</div> -->

      <!-- <input class="chat-channel-form__input" required type="datetime-local" v-model="endDate"> -->
      <button class="button button--join-locked-chan" type='submit'> {{ action }} </button>
    </form>
  </div>
  <div v-else class='chat-channel-form'>
    <div @click="closeModal()" class="close-cross">
      &times;
    </div>

    <form class="chat-channel-form__form" @submit.prevent='checkEndDate()'>
      <div class="chat-channel-form__subtitle">[{{ targetCm.member.username }}] will be {{ action }} until...</div>
      <!-- <div class="chat-channel-form__subtitle">To join, please enter the channel's password:</div> -->

      <input class="chat-channel-form__input" required type="datetime-local" v-model="endDate">
      <button class="button button--join-locked-chan" type='submit'> Confirm </button>
    </form>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, computed } from "vue";
import { ChatApi } from "@/../sdk/typescript-axios-client-generated";
import { socket } from "./ChatComponent.vue"
import { useStore } from 'vuex'
 
export default defineComponent({
  name: 'MuteBanTimer',
  props: [ 'action', 'targetCm', 'activeChannel' ],

  setup(props, context) {
    const api = new ChatApi();
    const store = useStore();

    const dateInput = computed(() => <HTMLInputElement>document.querySelector('input')!);
    const curDate = new Date(Date.now() + 3600000);
    const tz = curDate.toLocaleString("sv-SE");
    const endDate = ref(tz.substring(0, 16));
    
    const state = (props.action === 'unmute'? 'muted': 'banned');

    const closeModal = () => {
      context.emit("close");
    };

    const checkEndDate = async () => {
      const parsedDate = Date.parse(endDate.value);
      console.log("parsed date ", parsedDate)
      if (parsedDate - Date.now() <= 0) {
        dateInput.value.setCustomValidity("Please select a future date!");
        dateInput.value.reportValidity();
        return;
      }

      console.log("enddate ", endDate.value, typeof(endDate.value), Date.parse(endDate.value))

      await api.muteBanMember(props.action, props.targetCm.id, Date.parse(endDate.value)) //endDate.value
      .then((res) => {
        // console.log("targetcm", props.targetCm)
        // console.log("mutebanmember ret", res)
        store.dispatch("setMessage", "[" + props.targetCm.member.username + "] is " + props.action + " from channel [" + props.activeChannel.channel.name.substring(0, 16) + "] until " + endDate.value);
        closeModal();
      })
      .catch((err) => console.log(err)) 
    }

    const getEndDate = () => {
      const property = (props.action === 'unmute'? 'mute': 'ban');
      const rawDate = new Date(Number(props.targetCm[property]));
      const locale = rawDate.toLocaleString("sv-SE");
      return locale.substring(0, 16);
    }

    const unmuteUnban = async () => {
      const newState = (props.action === 'unmute'? 'unmuted': 'unbanned');

      await api.muteBanMember(props.action, props.targetCm.id, 0) //endDate.value
      .then((res) => {
        // console.log("targetcm", props.targetCm)
        // console.log("mutebanmember ret", res)
        store.dispatch("setMessage", "[" + props.targetCm.member.username + "] has been " + newState + " from channel [" + props.activeChannel.channel.name.substring(0, 16) + "]");
        closeModal();
      })
      .catch((err) => console.log(err)) 
    }
    // const reinitError = () => {
    //   passwordInput.value.setCustomValidity("");
    // }

    // const checkPassword = () => {

    //   api.checkPasswordMatch(props.channel.id, passwordAttempt.value)
    //   .then((res) => {
    //     console.log("password match res", res)
    //     if (res.data) {
    //       context.emit('join-channel', props.channel);
    //       closeModal();
    //     }
    //     else {
    //       passwordInput.value.setCustomValidity("Wrong channel password.");
    //       passwordInput.value.reportValidity();
    //       return ;
    //     }
    //   })
    //   .catch((err) => console.log(err));
    // }

    return {
      // passwordAttempt,
      // checkPassword,
      // reinitError,
      closeModal,
      endDate,
      checkEndDate,
      getEndDate,
      unmuteUnban,
      state,
      
    }
  }
});
</script>

<style lang="scss">
  @import "../../../sass/main.scss";
</style>