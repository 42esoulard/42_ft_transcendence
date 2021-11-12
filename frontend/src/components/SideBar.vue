<template>
  <transition name="fade--log">
    <div v-if="user">
      <div class="sidebar">
        <SideBarLink to="/" icon="fas fa-home">home</SideBarLink>
        <SideBarLink :to="userProfile" icon="fas fa-user-circle">profile</SideBarLink>
        <SideBarLink to="/chat" icon="fas fa-comments">chat</SideBarLink>
        <SideBarLink to="" icon="fas fa-trophy">ladder</SideBarLink>
        <SideBarLink to="/users" icon="fas fa-users">users</SideBarLink>
        <SideBarLink to="/pong" icon="fas fa-table-tennis">play</SideBarLink>
        <SideBarLink to="/pong/watch" icon="fas fa-play-circle">live</SideBarLink>
        <SideBarLink to="/adduser" icon="fas fa-toolbox">add</SideBarLink>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
  import { computed } from "vue";
  import SideBarLink from './SideBarLink.vue';
  import { useStore } from "@/store";

export default {
  props: {},
  components: { SideBarLink },
  setup() {
    const store = useStore();
    const userProfile = computed(() => {
      if (store.state.user.id != 0) return `/profile/${store.state.user.username}`;
      else return `/profile/`;
    });
    return {
      user: computed(() => store.state.user),
      userProfile
    };
  }
};
</script>

<style lang="scss">
@import "../../sass/main.scss";
</style>
