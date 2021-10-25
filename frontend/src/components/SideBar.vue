<template>
  <transition name="fade--log">
    <div class="sidebar" v-if="user">
      <SideBarLink to="/" icon="fas fa-home">home</SidebarLink>
      <SideBarLink to="/profile" icon="fas fa-user-circle">profile</SidebarLink>
      <SideBarLink to="/chat" icon="fas fa-comments">chat</SidebarLink>
      <SideBarLink to="" icon="fas fa-trophy">ladder</SidebarLink>
      <SideBarLink to="/users" icon="fas fa-users">users</SidebarLink>
      <SideBarLink to="/pong" icon="fas fa-table-tennis">play</SidebarLink>
      <SideBarLink to="/pong/watch" icon="fas fa-play-circle">live</SidebarLink>
      <SideBarLink to="/adduser" icon="fas fa-toolbox">add User</SidebarLink>
      <SideBarLink to="/account" icon="fas fa-toolbox">account</SidebarLink>
    </div>
  </transition>
</template>

<script lang="ts">
  import { computed } from "vue";
  import SideBarLink from './SideBarLink.vue';
  import { useStore } from "vuex";

  export default {
    props: {},
    components: { SideBarLink },
    setup() {
      const store = useStore();
      return {
      user: computed(() => store.state.user),
    };
    }
  }
</script>

<style lang="scss">
  @import "../../sass/main.scss"
</style>
