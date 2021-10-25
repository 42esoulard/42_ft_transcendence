<template>
  <div class="profile" v-if="user">
    <div class="profile-left">
        <img :src="user.avatar" class="profile-left__avatar-img" alt= "">
        <span class="profile-left__name">{{ user.username }}</span>
        <span class="profile-left__since">member since {{ formatedDate }}</span>
        <span class="profile-left__status"><i class="status status--online fas fa-circle" /> online</span>
        <div class="profile-left__social">
          <button class="button button--add"><i class="upload-icon fas fa-user-plus" /> add friend</button>
          <button class="button button--msg"><i class="upload-icon fas fa-envelope" /> send message</button>
          <button class="button button--invite"><i class="upload-icon fas fa-table-tennis" /> invite game</button>
          <button class="button button--block"><i class="upload-icon fas fa-ban" /> block</button>
        </div>
    </div>
    <div class="profile-main">
      <div class="stats">
        <div class="stats-bloc-border">
        <div class="stats-bloc">
          <span class="stats-bloc__number stats-bloc__number--win">164</span>
          <span class="stats-bloc__text">win</span>
        </div>
        </div>
        <div class="stats-bloc-border">
        <div class="stats-bloc">
          <span class="stats-bloc__number stats-bloc__number--rank">#4</span>
          <span class="stats-bloc__text">rank</span>
        </div>
        </div>
        <div class="stats-bloc-border">
        <div class="stats-bloc">
          <span class="stats-bloc__number stats-bloc__number--games">200</span>
          <span class="stats-bloc__text">games</span>
        </div>
        </div>
        <div class="progress-bar">
          <div class="our-progress-bar__inside" style="width: 82%"></div>
          <div class="our-progress-bar__label">winrate: 82%</div>
        </div>
        <div class="game-history">
          <span class="game-history__title">Game History</span>
          <div class=game-history-panel>
            history
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, computed } from "vue";
import { useStore } from "vuex";
import moment from "moment";

export default defineComponent({
  name: "UserProfile",
  setup() {
    const store = useStore();

    const formatedDate = computed(() => {
      return moment(store.state.user.created_at as Date).format(
        "MM-DD-YYYY"
      );
    });

    console.log("COUCOU");
    console.log("GAMES", store.state.user.games);
    console.log("GAMESTATS", store.state.user.gameStats);

    return { formatedDate, user: computed(() => store.state.user) };
  },
});

</script>

<style lang="scss">
  @import "../../sass/main.scss";
</style>
