<template>

  <div class="chat-channel-form chat-channel-form--popup">
    <div @click="closeModal()" class="close-cross">
      &times;
    </div>
    Do you really want to {{ action }} {{ target.username }} ?
    <button class="button button--third" type='submit' @click="confirm"> Confirm </button>
  </div>

</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: 'Confirm',
  props: ['action', 'target'],
  emits: ['close', 'confirm'],
  setup(props, context) {
    const confirm = () => {
      context.emit("confirm", props.action, props.target);
    }
    const closeModal = () => {
      context.emit("close");
    };
    return {
      confirm,
      closeModal
    }
  },
});
</script>
