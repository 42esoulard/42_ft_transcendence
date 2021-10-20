<template>
    <div class="update-user-grid tac br15">
      <div @click="closeModal()" class="close-cross">
        &times;
      </div>
      <h2>Update your informations</h2>
      <h3>Content to add</h3>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UpdateUser",
  setup(props, context) {
    const closeModal = () => {
      context.emit("close");
    };

    return {
      closeModal,
    };
  }
});
</script>
