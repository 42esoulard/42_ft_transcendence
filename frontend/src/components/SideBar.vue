<script lang="ts">
  import SideBarLink from './SideBarLink.vue'

  export default {
    props: {},
    components: { SideBarLink },
    setup() {
    }
  }
</script>

<template>
  <div class="sidebar">
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
</template>

<style lang="scss">
  @import "../../sass/main.scss"
</style>
