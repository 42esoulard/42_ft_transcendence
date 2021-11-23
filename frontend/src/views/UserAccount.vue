<template>
  <div class="user-account" v-if="user.id != 0"></div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import { useAuthApi } from "@/plugins/api.plugin";
import { useStore } from "@/store";
import InitTwoFactor from "@/components/InitTwoFactor.vue";
import EditUser from "@/components/EditUser.vue";
import Modal from "@/components/Modal.vue";
import { io } from "socket.io-client";

export default defineComponent({
  name: "UserAccount",
  components: {},
  setup() {
    const store = useStore();

    return {
      user: computed(() => store.state.user),
    };
  },
});
</script>

<style scoped></style>
