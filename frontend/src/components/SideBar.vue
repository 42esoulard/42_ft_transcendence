<template>
  <transition name="fade--log">
    <div v-if="user">
        <div class="sidebar">
          <SideBarLink to="/" icon="fas fa-home">home</SidebarLink>
          <SideBarLink :to="userProfile" icon="fas fa-user-circle">profile</SidebarLink>
          <SideBarLink to="/chat" icon="fas fa-comments">chat</SidebarLink>
          <SideBarLink to="" icon="fas fa-trophy">ladder</SidebarLink>
          <SideBarLink to="/users" icon="fas fa-users">users</SidebarLink>
          <SideBarLink to="/pong" icon="fas fa-table-tennis">play</SidebarLink>
          <SideBarLink to="/pong/watch" icon="fas fa-play-circle">live</SidebarLink>
          <SideBarLink to="/adduser" icon="fas fa-toolbox">add</SidebarLink>
        </div>
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
      const userProfile = computed(() => {
        if (store.state.user)
          return (`/profile/${store.state.user.username}`);
        else
          return (`/profile/`);
      });
      return {
      user: computed(() => store.state.user),
      userProfile,
    };
    }
  }
</script>

<style lang="scss">
  @import "../../sass/main.scss"
</style>
