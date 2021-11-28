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
    to: { type: String, requited: true },
    icon: { type: String, required: true },
  },
  setup(props: any) {
    const route = useRoute();
    const isActive = computed(() => route.path === props.to);
    // const hasChallenges = computed(
    //   () =>
    //     store.state.onlineUsers.length > 1 &&
    //     props.to === "/pong" && // test à faire sur le tableau de challenges
    //     !isActive.value
    // );
    // const hasLives = computed(
    //   () =>
    //     store.state.inGameUsers.length > 0 &&
    //     props.to === "/pong/watch" &&
    //     !isActive.value
    // );
    const hasNotification = computed(
      () =>
        ((store.state.inGameUsers.length > 0 && props.to === "/pong/watch") ||
          (store.state.onlineUsers.length > 1 && props.to === "/pong")) && // test à faire sur le tableau de challenges
        !isActive.value
    );

    // console.log("inGameUsers", store.state.inGameUsers);
    // console.log("hasLives", hasLives.value);

    return {
      isActive,
      hasNotification,
      // hasChallenges,
      // hasLives,
      // challenges: computed(() => store.state.onlineUsers.length),
      // liveGames: computed(() => store.state.inGameUsers.length / 2),
    };
  },
};
</script>
