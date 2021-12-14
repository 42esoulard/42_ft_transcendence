<template>
  <transition name="fade--log">
    <div class="header">
      <div
        class="menu"
        v-if="(width < 950 || height < 600) && user.id != 0 && !user.banned"
      >
        <button @click="isActive = !isActive" class="menu-button">
          <i class="menu__icon fas fa-bars" />
        </button>
        <div class="menu-content" v-show="isActive">
          <SideBarLink
            class="menu__link"
            @click="isActive = !isActive"
            :to="userProfile"
            icon="fas fa-user-circle"
          >
            profile
          </SideBarLink>
          <SideBarLink
            class="menu__link"
            @click="isActive = !isActive"
            to="/chat"
            icon="fas fa-comments"
          >
            chat
          </SideBarLink>
          <SideBarLink
            class="menu__link"
            @click="isActive = !isActive"
            to="/ladder"
            icon="fas fa-trophy"
          >
            ladder
          </SideBarLink>
          <SideBarLink
            class="menu__link"
            @click="isActive = !isActive"
            to="/users"
            icon="fas fa-users"
          >
            users
          </SideBarLink>
          <SideBarLink
            class="menu__link"
            @click="isActive = !isActive"
            to="/pong"
            icon="fas fa-table-tennis"
          >
            play
          </SideBarLink>
          <SideBarLink
            class="menu__link"
            @click="isActive = !isActive"
            to="/pong/watch"
            icon="fas fa-play-circle"
          >
            live
          </SideBarLink>
          <SideBarLink
            v-if="user.role != 'user'"
            class="menu__link"
            @click="isActive = !isActive"
            to="/admin"
            icon="fas fa-crown"
          >
            admin
          </SideBarLink>
          <SideBarLink
            class="menu__link"
            @click="logOut"
            to="/log-out"
            icon="fas fa-power-off"
          >
            log out
          </SideBarLink>
        </div>
      </div>
      <div v-else></div>
      <router-link to="/" class="header-link">
        <h1 class="header__title">Transcendence</h1>
      </router-link>
      <div
        v-if="width >= 950 && user.id != 0 && !user.banned"
        class="header-bloc"
      >
        <router-link
          :to="{ name: 'UserProfile', params: { username: user.username } }"
          class="user-bloc"
        >
          <img class="user-bloc__avatar" :src="user.avatar" alt="" />
          <span class="user-bloc__username">{{ user.username }}</span>
        </router-link>
        <button @click="logOut" class="button button--log-out">
          <i class="user-bloc__icon fas fa-power-off" />
        </button>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { computed, defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import { useAuthApi } from "@/plugins/api.plugin";
import SideBarLink from "./SideBarLink.vue";
import { pongSocket, presenceSocket } from "@/App.vue";

export default defineComponent({
  name: "Admin",
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
    };

    onMounted(() => {
      window.addEventListener("resize", onResize);
    });

    const logOut = async () => {
      pongSocket.off("challengeDeclined");
      pongSocket.emit("cancelChallenge", store.state.user.username);
      authApi
        .logout({ withCredentials: true })
        .then((response) => {
          presenceSocket.emit("closeConnection", store.state.user);
          presenceSocket.emit("leftUser", store.state.user.id);
          store.commit("resetUser");
          router.push("/login");
        })
        .catch((err: any) => {
          store.commit("resetUser");
          router.push("/login");
        });
    };

    const userProfile = computed(() => {
      if (store.state.user.id) return `/profile/${store.state.user.username}`;
      else return `/profile/`;
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
@import "../../sass/main.scss";
</style>
