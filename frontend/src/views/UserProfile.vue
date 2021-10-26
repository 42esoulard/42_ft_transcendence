<template>
  <div class="profile" v-if="user">
    <div class="profile-left">
        <img :src="user.avatar" class="profile-left__avatar-img" alt= "">
        <span class="profile-left__name">{{ user.username }} </span>
        <span class="profile-left__since">member since {{ formatedDate }}</span>
        <span class="profile-left__status"><i class="status status--online fas fa-circle" /> online</span>
        <div class="profile-left__social">
          <button class="button button--second"><i class="upload-icon fas fa-user-plus" /> add friend</button>
          <button class="button button--primary"><i class="upload-icon fas fa-envelope" /> send message</button>
          <button class="button button--third"><i class="upload-icon fas fa-table-tennis" /> invite game</button>
          <button class="button button--grey"><i class="upload-icon fas fa-ban" /> block</button>
        </div>
    </div>
    <div class="profile-main">
      <Stats />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Stats from "../components/Stats.vue";

export default defineComponent({
  name: "UserProfile",
  components: { Stats },
  setup() {
    const store = useStore();
    const user = computed(() => store.state.user);

    return { user };
  },
});

</script>

<style lang="scss">
  @import "../../sass/main.scss";
</style>
