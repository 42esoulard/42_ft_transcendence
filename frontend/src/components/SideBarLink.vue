<template>
  <router-link :to="to" class="sidebar-link" :class="{ active: isActive }">
    <i class="sidebar-link__icon" :class="icon" />
    <div v-if="hasNotification" class="sidebar-link__notif"></div>
    <slot />
  </router-link>
</template>

<script lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { store } from "@/store";

export default {
  props: {
    to: { type: String, required: true },
    icon: { type: String, required: true },
  },
  setup(props: any) {
    const route = useRoute();
    const isActive = computed(() => route.path === props.to);
    const hasNotification = computed(
      () =>
        ((store.state.challengesReceived.length > 0 && props.to === "/pong") ||
          (store.state.chatNotification && props.to === "/chat") ||
          (store.state.toggleFriendship && props.to === "/users")) &&
        !isActive.value
    );

    return {
      isActive,
      hasNotification,
    };
  },
};
</script>
