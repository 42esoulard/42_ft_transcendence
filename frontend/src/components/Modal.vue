<template>
  <div class="modal-container" @click.self="closeModal">
    <slot name="twofa"></slot>
    <slot name="update-user"></slot>
    <slot name="new-channel-form"></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUpdated, ref } from "vue";

export default defineComponent({
  name: "Modal",
  setup(props, context) {
    const closeModal = () => {
      context.emit("close");
    };

    return {
      closeModal
    };
  }
});
</script>