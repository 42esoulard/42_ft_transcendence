<template>
  <div class="banned-div">
      <span class="banned__msg">You've been banned. You can still delete your account.</span>
      <button class="button button--grey" @click="deleteAccount">Delete account</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, computed, onMounted } from "vue";
import { useStore } from "@/store";
import { useRouter } from "vue-router";
import { User } from "sdk/typescript-axios-client-generated";
import { useUserApi } from "@/plugins/api.plugin";

export default defineComponent({
  name: "Banned",
  setup() {
    const store = useStore();
    const userApi = useUserApi();
    const router = useRouter();

    const deleteAccount = async() => {
      if (store.state.user.id != 0) {
        await userApi
          .removeUser(store.state.user.id)
          .then((res: any) => router.push({ path: '/' }))
          .catch((err: any) => console.log(err));
      }
    };

  return {deleteAccount};
  },
});
</script>

<style lang="scss">
@import "../../sass/main.scss";
</style>
