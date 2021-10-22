<template>
  <div class="profile" v-if="user">
    <div class="profile-left">
        <img :src="user.avatar" class="profile-left__avatar-img" alt= "">
        <span class="profile-left__name">{{ user.username }} </span>
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
          <span class="stats-bloc__number stats-bloc__number--win">{{ numberOfWin }}</span>
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
          <span class="stats-bloc__number stats-bloc__number--games">{{ numberOfGames }}</span>
          <span class="stats-bloc__text">games</span>
        </div>
        </div>
        <div class="progress-bar">
          <div class="our-progress-bar__inside" :style="{'width':winRate}"></div>
          <div class="our-progress-bar__label">winrate: {{ winRate }}</div>
        </div>
        <div class="game-history">
          <span class="game-history__title">Game History</span>
          <div class="game-history-panel">
            <ul class="game-history-panel__list">
             <li v-for="game in gameHistory" :key="game.id">
              {{ historyString(game) }}
             </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import moment from "moment";
import { useUserApi, usePongApi } from "@/plugins/api.plugin";
import { User } from "@/types/User";
import { GameUser } from "@/types/GameUser";
import { Game } from "@/types/Game";
import axios from "axios";
import { ContentSaveCog } from "mdue";

export default defineComponent({
  name: "UserProfile",
  setup() {
    const store = useStore();
    const userApi = useUserApi();
    const pongApi = usePongApi();
    const games = ref<GameUser[]>([]);
    const gameHistory = ref<Game[]>([]);

    const getUserGames = async () => {
      await axios
        .get(`http://localhost:3000/users/user-games/${store.state.user.id}`)
        .then((res: any) => {
          games.value = res.data.games;
          console.log(games.value);
        })
        .catch((err: any) => { console.log("not found")})
    }
    const getGameHistory = async() => {
      await getUserGames();
      for (const gameUser of games.value){
        await axios
          .get(`http://localhost:3000/pong/games/${gameUser.gameId}`)
          .then((res) => {
            console.log(res.data);
            gameHistory.value.push(res.data);
          })
          .catch(error_username => console.log(error_username));
      }
    };
    getGameHistory();
    const formatedDate = computed(() => {
      return moment(store.state.user.created_at as Date).format(
        "MM-DD-YYYY"
      );
    });

    const historyString = function (game: Game){
      const opponent = game.users[0].userId == store.state.user.id ? game.users[1] : game.users[0];
      const result = opponent.won === true ? "loss" : "win";
      return `${moment(game.startedAt).format("MM-DD-YYYY")}: ${result} vs ${opponent.user.username}`
    };
    const numberOfGames = computed(() => games.value.length);
    const numberOfWin = computed(() => games.value.filter(game => game.won == true).length);
    const winRate = computed(() => {
      return (Math.round(
        games.value.filter(game => game.won == true).length
        * 100 / games.value.length)
        + '%')
    });
    const user = computed(() => store.state.user);

    return { games, formatedDate, numberOfGames, numberOfWin, winRate, user, gameHistory, historyString };
  },
});

</script>

<style lang="scss">
  @import "../../sass/main.scss";
</style>
