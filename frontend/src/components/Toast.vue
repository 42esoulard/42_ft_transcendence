<template>
  <div class="toast-wrapper">
    <div class="toast-content">
      {{ message }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Toast",
  props: ["message"],
});
</script>
