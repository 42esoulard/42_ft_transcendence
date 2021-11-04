<template>
  <transition name="fade--log">
  <div class="header">
    <div class="menu" v-if="(width < 950 || height < 600) && user">
        <button @click="isActive = !isActive" class="menu-button"><i class="menu__icon fas fa-bars" /></button>
        <div class="menu-content" v-show="isActive">
          <SideBarLink class = "menu__link" @click="isActive = !isActive" to="/" icon="fas fa-home">home</SidebarLink>
          <SideBarLink class = "menu__link" @click="isActive = !isActive" :to="userProfile" icon="fas fa-user-circle">profile</SidebarLink>
          <SideBarLink class = "menu__link" @click="isActive = !isActive" to="/chat" icon="fas fa-comments">chat</SidebarLink>
          <SideBarLink class = "menu__link" @click="isActive = !isActive" to="" icon="fas fa-trophy">ladder</SidebarLink>
          <SideBarLink class = "menu__link" @click="isActive = !isActive" to="/users" icon="fas fa-users">users</SidebarLink>
          <SideBarLink class = "menu__link" @click="isActive = !isActive" to="/pong" icon="fas fa-table-tennis">play</SidebarLink>
          <SideBarLink class = "menu__link" @click="isActive = !isActive" to="/pong/watch" icon="fas fa-play-circle">live</SidebarLink>
          <SideBarLink class = "menu__link" @click="isActive = !isActive" to="/adduser" icon="fas fa-toolbox">add</SidebarLink>
          <SideBarLink class = "menu__link" @click="logOut" to="/log-out" icon="fas fa-power-off">log out</SidebarLink>
        </div>
      </div>
    <div v-else></div>
    <router-link to="/" class="header-link">
      <h1 class="header__title">Space Pong</h1>
    </router-link>
    <div v-if="width >= 950 && user" :key="user.id" class="header-bloc">
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
import { computed, defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useAuthApi } from "@/plugins/api.plugin";
import SideBarLink from './SideBarLink.vue';

export default defineComponent({
  name: "UserAccount",
  components: { SideBarLink },
  setup() {
    const store = useStore();
    const router = useRouter();
    const authApi = useAuthApi();
    const windowWidth = ref(window.innerWidth);
    const windowHeight = ref(window.innerHeight);
    const isActive = ref(false);

    const onResize = () => {
		  windowWidth.value = window.innerWidth;
		  windowHeight.value = window.innerHeight;
	  }

    onMounted(() => {
			window.addEventListener("resize", onResize);
    });

    const logOut = () => {
        authApi.logout({ withCredentials: true })
        .then((response) => {
          console.log(response);
          store.state.user = null;
          router.push('/login');
        })
        .catch((err: any) => console.log(err.message));
    };

    const userProfile = computed(() => {
        if (store.state.user)
          return (`/profile/${store.state.user.username}`);
        else
          return (`/profile/`);
      });

    return {
      user: computed(() => store.state.user),
      userProfile,
      logOut,
      width: computed(() => windowWidth.value),
      height: computed(() => windowHeight.value),
      isActive,
    };
  },
});
</script>

<style lang="scss">
  @import "../../sass/main.scss"
</style>
