<template>
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
    <div class="list-div">
      <span class="list-div__title">Game History</span>
      <div class="list-div-panel">
        <ul class="list-div-panel__list">
        <li v-for="game in gameHistory" :key="game.id">
          {{ historyString(game) }}
        </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, inject, ref, computed, onMounted } from "vue";
  import moment from "moment";
  import { GameUser } from "@/types/GameUser";
  import { Game } from "@/types/Game";
  import axios from "axios";
  import { useUserApi } from "@/plugins/api.plugin";

  export default defineComponent({
    name: "Stats",
    props: {
      user: {
        type: Object,
        required: true,
      }
    },
    setup(props) {
      const userApi = useUserApi();
      const games = ref<GameUser[]>([]);
      const gameHistory = ref<Game[]>([]);
      const user = props.user;

      onMounted(() => {
        userApi
          .getUserGames(user.id)
          .then((res: any) => {
            console.log(res.data);
            games.value = res.data.games;
            for (const gameUser of games.value){
              gameHistory.value.push(gameUser.game);
            }
          })
          .catch((err: any) => { console.log("not found")})
      });


      const historyString = function (game: Game){
        const opponent = game.users[0].userId == user.id ? game.users[1] : game.users[0];
        const result = opponent.won === true ? "loss" : "win";
        return `${moment(game.startedAt).format("MM-DD-YYYY")}: ${result} vs ${opponent.user.username}`
      };
      const numberOfGames = computed(() => games.value.length);
      const numberOfWin = computed(() => games.value.filter(game => game.won == true).length);
      const winRate = computed(() => {
        if (games.value.length == 0)
          return ('0%');
        return (Math.round(
          games.value.filter(game => game.won == true).length
          * 100 / games.value.length)
          + '%')
      });

      return { games, numberOfGames, numberOfWin, winRate, gameHistory, historyString }
    }
  })
</script>
