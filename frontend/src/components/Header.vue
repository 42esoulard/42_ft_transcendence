<template>
  <transition name="fade--log">
  <div class="header">
    <div></div>
    <router-link to="/" class="header-link">
      <h1 class="header__title">Space Pong</h1>
    </router-link>
    <div v-if="user" :key="user.id" class="header-bloc">
      <router-link to="/account" class="user-bloc">
        <img class="user-bloc__avatar" :src="user.avatar" alt="">
        <span class="user-bloc__username">{{ user.username }}</span>
      </router-link>
      <button @click="logOut" class="button button--log-out"><i class="user-bloc__icon fas fa-power-off" /></button>
    </div>
  </div>
  </transition>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useAuthApi } from "@/plugins/api.plugin";

export default defineComponent({
  name: "UserAccount",
  setup() {
    const store = useStore();
    const router = useRouter();
    const authApi = useAuthApi();

    const logOut = () => {
        authApi.logout({ withCredentials: true })
        .then((response) => {
          console.log(response);
          store.state.user = null;
          router.push('/login');
        })
        .catch((err: any) => console.log(err.message));
    };

    return {
      user: computed(() => store.state.user),
      logOut,
    };
  },
});
</script>

<style lang="scss">
  @import "../../sass/main.scss"
</style>
