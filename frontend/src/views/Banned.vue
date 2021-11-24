<template>
  <div class="banned-div">
    <span class="banned__msg"
      >You've been banned. You can still delete your account.</span
    >
    <button class="button button--grey" @click="deleteAccount">
      Delete account
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, computed, onMounted } from "vue";
import { useStore } from "@/store";
import { useRouter } from "vue-router";
import { presenceSocket } from "@/App.vue";
import { useUserApi, useAuthApi } from "@/plugins/api.plugin";

export default defineComponent({
  name: "Banned",
  setup() {
    const store = useStore();
    const userApi = useUserApi();
    const router = useRouter();
    const authApi = useAuthApi();

    const deleteAccount = async () => {
      if (store.state.user.id != 0) {
        if (confirm("Do you really want to delete?")) {
          logOut();
          await userApi
            .removeUser(store.state.user.id)
            .then((res: any) => {})
            .catch((err: any) => console.log(err));
        }
      }
    };

    const logOut = () => {
      authApi
        .logout({ withCredentials: true })
        .then((response) => {
          console.log(response);
          presenceSocket.emit("closeConnection", store.state.user);
          store.commit("resetUser"); //store.state.user = null;
          router.push("/login");
        })
        .catch((err: any) => console.log(err.message));
    };

    return { deleteAccount };
  },
});
</script>

<style lang="scss">
@import "../../sass/main.scss";
</style>
