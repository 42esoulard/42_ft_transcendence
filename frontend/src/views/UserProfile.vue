<template>
  <div
    :class="['profile', user.id === self ? 'profile--self' : '']"
    v-if="user"
  >
    <div class="profile-left">
      <ProfileLeft :user="user" />
    </div>
    <div class="profile-stats">
      <Stats :user="user" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, computed, onMounted } from "vue";
import { useStore } from "@/store";
import Stats from "../components/Stats.vue";
import ProfileLeft from "../components/ProfileLeft.vue";
import { User } from "sdk/typescript-axios-client-generated";
import moment from "moment";
import { useRoute, useRouter } from "vue-router";
import { useUserApi } from "@/plugins/api.plugin";

export default defineComponent({
  name: "UserProfile",
  components: { Stats, ProfileLeft },
  setup() {
    const userApi = useUserApi();
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const userRef = ref();
    const username = route.params.username;

    onMounted(() => {
      if (!username || !username.length) return;
      userApi
        .getUserByUsername(username.toString())
        .then((res: any) => {
          userRef.value = res.data;
        })
        .catch((err: any) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
          router.push("/notfound");
        });
    });

    const formatedDate = computed(() => {
      return moment(userRef.value.created_at as Date).format("MM-DD-YYYY");
    });

    return {
      user: computed(() => userRef.value),
      formatedDate,
      self: computed(() =>
        store.state.user.id != 0 ? store.state.user.id : 0
      ),
    };
  },
});
</script>

<style lang="scss">
@import "../../sass/main.scss";
</style>
