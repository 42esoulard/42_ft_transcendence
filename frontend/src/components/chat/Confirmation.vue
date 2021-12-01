<template>
    
  <div class="chat-channel-form chat-channel-form--popup">
    <div @click="closeModal()" class="close-cross">
      &times;
    </div>
    Do you really want to {{ action }} this {{ target }} ?
    <button class="button" type='submit' @click="confirm"> Confirm </button>
  </div>
  
</template>

<script>
import { ref, defineComponent, computed, onMounted } from "vue";

export default defineComponent({
  name: 'Confirmation',
  props: ['targetCm', 'action', 'target'],
  emits: ['close', 'confirm'],
  setup(props, context) {
    const confirm = () => {
      context.emit('confirm', props.targetCm, props.action);
    }
    const closeModal = () => {
      context.emit("close");
    };
    return { 
      confirm,
      closeModal
    }
    // endDate(cm) {
    //   const rawDate = new Date(Number(cm.mute));
    //   const locale = rawDate.toLocaleString("sv-SE");
    //   return locale.substring(0, 16);
    // },
    // toggleModal(){
    //     this.$parent.toggleModal(0);
    // }
  },
});
</script>

<style lang="scss">
  @import "../../../sass/main.scss";
</style>
