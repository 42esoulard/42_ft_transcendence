<template>
  <div class="profile" v-if="user">
    <div class="profile-left">
      <ProfileLeft :user="user"/>
    </div>
    <div class="profile-right">
      <Stats :user="user"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Stats from "../components/Stats.vue";
import ProfileLeft from "../components/ProfileLeft.vue";
import { User } from "@/types/User";
  import moment from "moment";
import { useRoute } from 'vue-router';
import { useUserApi } from "@/plugins/api.plugin";

export default defineComponent({
  name: "UserProfile",
  components: { Stats, ProfileLeft },
  setup() {
    const userApi = useUserApi();
    const route = useRoute();
    const userRef = ref();
    const username = route.params.username;

    onMounted(() => {
      userApi
        .getUserByUsername(username.toString())
        .then((res: any) => {
          userRef.value = res.data;
        })
        .catch((err: any) => console.log(err.message));
    });

    const formatedDate = computed(() => {
        return moment(userRef.value.created_at as Date).format(
          "MM-DD-YYYY"
        );
      });
    return { user: computed(() => userRef.value), formatedDate };
  },
});

</script>

<style lang="scss">
  @import "../../sass/main.scss";
</style>
