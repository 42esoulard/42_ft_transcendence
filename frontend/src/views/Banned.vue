<template>
  <div class="banned-div">
    <span class="banned__msg">You've been banned.</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, computed, onMounted } from "vue";
import { useStore } from "@/store";
import { useRouter } from "vue-router";
import { presenceSocket } from "@/App.vue";
import { useUserApi, useAuthApi } from "@/plugins/api.plugin";
import { User } from "sdk/typescript-axios-client-generated";

export default defineComponent({
  name: "Banned",
  setup() {
    return {};
  },
});
</script>

<style lang="scss">
@import "../../sass/main.scss";
</style>
