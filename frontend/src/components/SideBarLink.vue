<template>
    <router-link :to="to" class="sidebar-link" :class="{ active: isActive }">
      <i class="sidebar-link__icon" :class="icon" />
      <slot />
    </router-link>
</template>

<script lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  props: {
    to: { type: String, requited: true},
    icon: { type: String, required: true }
  },
  setup(props: any) {
    const route = useRoute()
    const isActive = computed(() => route.path === props.to)
    return { isActive }
  }
}
</script>
