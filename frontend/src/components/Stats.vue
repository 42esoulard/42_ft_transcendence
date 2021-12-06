<template>
  <div class="stats">
    <div class="stats-info">
      <div class="stats-bloc">
        <span class="stats-bloc__number stats-bloc__number--win">
          {{ numberOfWin }}
        </span>
        <span class="stats-bloc__text">win</span>
      </div>
      <div class="stats-bloc">
        <span class="stats-bloc__number stats-bloc__number--loss">
          {{ numberOfGames - numberOfWin }}
        </span>
        <span class="stats-bloc__text">loss</span>
      </div>
      <div class="stats-bloc">
        <span class="stats-bloc__number stats-bloc__number--games">
          {{ numberOfGames }}
        </span>
        <span class="stats-bloc__text">games</span>
      </div>
      <div class="progress-bar">
        <div class="our-progress-bar__inside" :style="{ width: winRate }"></div>
        <div class="our-progress-bar__label">winrate: {{ winRate }}</div>
      </div>
    </div>
    <div class="list-div">
      <span class="list-div__title">Game History</span>
      <div class="list-div-panel">
        <table class="table table-borderless">
          <tbody class="table__body">
            <tr class="table-row" v-for="game in gameHistory" :key="game.id">
              <td class="table-cell">{{ historyObject(game).date }}</td>
              <td
                class="table-cell table-cell--win"
                v-if="historyObject(game).result == 'win'"
              >
                {{ historyObject(game).result }}
              </td>
              <td class="table-cell table-cell--loss" v-else>
                {{ historyObject(game).result }}
              </td>
              <td class="table-cell">vs</td>
              <td class="table-cell">
                <router-link
                  v-if="historyObject(game).opponent"
                  class="link link--neutral"
                  :to="{
                    name: 'UserProfile',
                    params: { username: historyObject(game).opponent },
                  }"
                >
                  {{ historyObject(game).opponent }}
                </router-link>
                <span v-else>[deleted]</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, computed, onMounted } from "vue";
import moment from "moment";
import { GameUser, Game } from "sdk/typescript-axios-client-generated";
import { useUserApi, usePongApi } from "@/plugins/api.plugin";
import { store } from "@/store";

export default defineComponent({
  name: "Stats",
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const userApi = useUserApi();
    const pongApi = usePongApi();
    const games = ref<GameUser[]>([]);
    const gameHistory = ref<Game[]>([]);
    const user = props.user;

    onMounted(() => {
      pongApi
        .getUserGameUser(user.id)
        .then((res: any) => {
          games.value = res.data;
          for (const gameUser of games.value) {
            gameHistory.value.push(gameUser.game);
          }
          gameHistory.value.reverse();
        })
        .catch((err: any) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    });

    const historyObject = function (game: Game) {
      const opponent =
        game.users[0].userId == user.id ? game.users[1] : game.users[0];
      const gameUser =
        game.users[0].userId == user.id ? game.users[0] : game.users[1];
      const result = gameUser.won === true ? "win" : "loss";
      return {
        date: moment(game.startedAt).format("MM-DD-YYYY"),
        result: result,
        opponent: opponent ? opponent.user.username : null,
      };
    };

    const numberOfGames = computed(() => games.value.length);

    const numberOfWin = computed(
      () => games.value.filter((game) => game.won == true).length
    );
    const numberOfLoss = computed(
      () =>
        games.value.length -
        games.value.filter((game) => game.won == true).length
    );

    const winRate = computed(() => {
      if (games.value.length == 0) return "0%";
      return (
        Math.round(
          (games.value.filter((game) => game.won == true).length * 100) /
            games.value.length
        ) + "%"
      );
    });

    return {
      games,
      numberOfGames,
      numberOfWin,
      numberOfLoss,
      winRate,
      gameHistory,
      historyObject,
    };
  },
});
</script>
