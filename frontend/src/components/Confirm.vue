<template>
  <div class="chat-channel-form chat-channel-form--popup">
    <div @click="closeModal()" class="close-cross">&times;</div>
    Do you really want to {{ action }} {{ computedTarget }} ?
    <button class="button button--third" type="submit" @click="confirm">
      Confirm
    </button>
  </div>
</template>

<script>
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "Confirm",
  props: ["action", "target"],
  emits: ["close", "confirm"],
  setup(props, context) {
    const confirm = () => {
      context.emit("confirm", props.action, props.target);
    };
    const closeModal = () => {
      context.emit("close");
    };

    const computedTarget = computed(() => {
      if (!props.target) return "your account";
      if ("username" in props.target) return props.target.username;
      return props.target.name;
    });

    return {
      confirm,
      closeModal,
      computedTarget,
    };
  },
});
</script>
