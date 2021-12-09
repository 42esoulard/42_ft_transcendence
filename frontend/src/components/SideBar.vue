<template>
  <transition name="fade--log">
    <div v-if="user && user.id != 0 && !user.banned">
      <div class="sidebar">
        <SideBarLink :to="userProfile" icon="fas fa-user-circle"
          >profile</SideBarLink
        >
        <SideBarLink to="/chat" icon="fas fa-comments">chat</SideBarLink>
        <SideBarLink to="/ladder" icon="fas fa-trophy">ladder</SideBarLink>
        <SideBarLink to="/users" icon="fas fa-users">users</SideBarLink>
        <SideBarLink to="/pong" icon="fas fa-table-tennis">play</SideBarLink>
        <SideBarLink to="/pong/watch" icon="fas fa-play-circle"
          >live</SideBarLink
        >
        <SideBarLink v-if="role != 'user'" to="/admin" icon="fas fa-crown"
          >admin</SideBarLink
        >
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { computed } from "vue";
import SideBarLink from "./SideBarLink.vue";
import { useStore } from "@/store";

export default {
  props: {},
  components: { SideBarLink },
  setup() {
    const store = useStore();
    const userProfile = computed(() => {
      if (store.state.user.id != 0)
        return `/profile/${store.state.user.username}`;
      else return `/profile/`;
    });
    return {
      user: computed(() => store.state.user),
      role: computed(() => store.state.user.role),
      userProfile,
    };
  },
};
</script>

<style lang="scss">
@import "../../sass/main.scss";
</style>
