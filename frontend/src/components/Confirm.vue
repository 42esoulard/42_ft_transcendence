<template>
  <div class="chat-channel-form chat-channel-form--popup">
    <div @click="closeModal()" class="close-cross">&times;</div>
    Do you really want to {{ action }} {{ computedTarget }} ?
    <button
      class="button button--third"
      type="submit"
      @click="confirm"
      :disabled="confirmed"
    >
      Confirm
    </button>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from "vue";

export default defineComponent({
  name: "Confirm",
  props: ["action", "target"],
  emits: ["close", "confirm"],
  setup(props, context) {
    const confirmed = ref(false);
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
      confirmed,
    };
  },
});
</script>
