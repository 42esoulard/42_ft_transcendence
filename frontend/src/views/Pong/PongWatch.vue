<template>
  <div class="users-main users-main--watch">
    <div class="users-div">
      <div class="users users--ladder">
        <div class="users__title">Ongoing games</div>
        <div class="users-list users-list--watch">
          <tr v-for="game in games" :key="game.id" class="users-list__elt">
            <div class="pong-watch__td">
              <td>
                <span class="link link--user-list">
                  {{ game.users[0].user.username }} vs
                  {{ game.users[1].user.username }}
                </span>
              </td>
              <td>
                <button
                  class="button button--third button--invitation"
                  v-on:click="WatchGame(game.id)"
                >
                  <i class="fas fa-eye" /> watch
                </button>
              </td>
            </div>
          </tr>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { pongSocket } from "@/App.vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { usePongApi } from "@/plugins/api.plugin";
import { Game } from "sdk/typescript-axios-client-generated";
import { store } from "@/store";

export default defineComponent({
  setup() {
    const games = ref<Game[]>([]);
    const api = usePongApi();

    onMounted(() => {
      api
        .getOnGoingGames()
        .then((res: any) => (games.value = res.data))
        .catch((err) =>
          store.dispatch("setErrorMessage", err.response.data.message)
        );
    });

    const WatchGame = (id: number) => {
      pongSocket.emit("watchGame", id.toString());
    };

    const router = useRouter();
    pongSocket.on(
      "GoToGame",
      (id, player1UserName, player2UserName, gameMode) => {
        router.push({
          name: "PongGameWatch",
          params: {
            room: id,
            player1UserName,
            player2UserName,
            authorized: "ok",
            gameMode,
            userType: "spectator",
          },
        });
      }
    );

    pongSocket.on("newGame", (game: Game) => {
      console.log("new game received " + game.id);
      games.value.push(game);
    });

    pongSocket.on("endGame", (game: Game) => {
      console.log("game ended " + game.id);
      games.value = games.value.filter((elem) => elem.id != game.id);
    });

    onBeforeRouteLeave(() => {
      pongSocket.off("endGame");
      pongSocket.off("newGame");
      pongSocket.off("GoToGame");
    });

    return { games, WatchGame };
  },
});
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>
