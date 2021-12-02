<template>

  <div class="chat-channel-form chat-channel-form--popup" v-if="computedTarget">
    <div @click="closeModal()" class="close-cross">
      &times;
    </div>
    Do you really want to {{ action }} {{ computedTarget }} ?
    <button class="[button button--third" type='submit' @click="confirm"> Confirm </button>
  </div>

  <div class="chat-channel-form chat-channel-form--popup" v-else>
    <div @click="closeModal()" class="close-cross">
      &times;
    </div>
    Error: {{ action }}
    <button class="[button button--fourth" type='submit' @click="confirm"> Ok </button>
  </div>

</template>

<script>
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: 'Confirm',
  props: ['action', 'target'],
  emits: ['close', 'confirm'],
  setup(props, context) {
    const confirm = () => {
      console.log("EMIT", props.action, props.target)
      context.emit("confirm", props.action, props.target);
    }
    const closeModal = () => {
      context.emit("close");
    };

    const computedTarget = computed(() => {
      if (!props.target)
        return null;
      if ("username" in props.target)
        return props.target.username
      else if ("name" in props.target)
        return props.target.name
    });

    return {
      confirm,
      closeModal,
      computedTarget,
    }
  },
});
</script>
