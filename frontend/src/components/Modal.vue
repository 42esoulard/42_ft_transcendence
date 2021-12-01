<template>
  <div class="modal-container" @click.self="closeModal">
    <slot name="twofa"></slot>
    <slot name="edit-user"></slot>
    <slot name="new-channel-form"></slot>
    <slot name="locked-channel-form"></slot>
    <slot name="settings-modal"></slot>
    <slot name="mute-ban-timer"></slot>
    <slot name="mute-ban-popup"></slot>
    <slot name="confirmation"></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Modal",
  setup(props, context) {
    const closeModal = () => {
      context.emit("close");
    };

    return {
      closeModal,
    };
  },
});
</script>
