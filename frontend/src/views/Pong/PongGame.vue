<template>
  <transition name="fade">
    <div class="pong-container">
      <div class="pong-buttons pong-buttons--top">
        <button
          @click="$router.push('/pong')"
          class="button button--log-in pong-btn"
          v-if="!gameIsOver"
        >
          <h1><i class="fas fa-door-open" /></h1>
          <h1>exit</h1>
        </button>

        <button
          @click="toggleAnimations"
          :class="[
            'button',
            'button--log-in',
            animations ? 'button--third' : '',
            'pong-btn',
          ]"
        >
          <h1><i class="fas fa-meteor" /></h1>
          <h1 v-if="animations">on</h1>
          <h1 v-else>off</h1>
        </button>
      </div>
      <h2 class="pong-score" v-if="!gameIsOver">
        {{ player1UserName }} vs {{ player2UserName }}
      </h2>
      <div class="stars" v-if="animations">
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
      </div>
      <canvas v-if="!gameIsOver" ref="canvas" />
      <div v-if="!gameIsOver && userType === 'player'" class="pong-buttons">
        <button class="button" v-on:click="SendMoveMsg('up')">
          <i class="fas fa-arrow-up" />
        </button>
        <button class="button" v-on:click="SendMoveMsg('down')">
          <i class="fas fa-arrow-down" />
        </button>
      </div>
      <div v-if="gameIsOver" class="pong-result">
        <h2 class="pong-score">{{ winningPlayer }} won !</h2>
        <button
          class="button button--log-in pong-btn"
          @click="$router.push('/pong')"
        >
          <h1><i class="fas fa-door-open" /></h1>
          <h1>exit</h1>
        </button>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { pongSocket } from "@/App.vue";
import { defineComponent, onMounted, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import getDraw from "@/composables/draw";
import {
  Coordinates,
  gameMode,
  PlayerPositions,
  PlayerScores,
  userType,
} from "@/types/PongGame";

export default defineComponent({
  props: {
    gameMode: { type: String as () => gameMode, required: true },
    userType: { type: String as () => userType, required: true },
    player1UserName: { type: String, required: true },
    player2UserName: { type: String, required: true },
    room: { type: String, required: true },
  },
  inheritAttrs: false,

  setup(props) {
    const {
      context,
      canvas,
      ballPosition,
      playerPositions,
      racquetLenghtRatio,
      score,
      windowWidth,
      player1EnlargeRemaining,
      player2EnlargeRemaining,
      onResize,
      initCanvas,
      draw,
    } = getDraw(props.gameMode);
    const animations = ref(false);

    // lifecycle hooks
    onMounted(() => {
      if (props.userType === "player") {
        window.addEventListener("keydown", preventScroll, false);
        window.addEventListener("keydown", onKeyDown);
      }
      window.addEventListener("resize", onResize);
      if (canvas.value) context.value = canvas.value.getContext("2d");
      initCanvas();
    });

    onBeforeRouteLeave(() => {
      if (props.userType === "player") {
        pongSocket.emit("leaveGame", props.room);
        window.removeEventListener("keydown", onKeyDown);
        // remove event listener, else it will be registered as many times as we entered the component
        window.removeEventListener("keydown", preventScroll);
      }
      if (props.userType === "spectator")
        pongSocket.emit("stopWatching", props.room);

      pongSocket.off("position");
      pongSocket.off("score");
      pongSocket.off("enlarge");
      pongSocket.off("enlargeEnd");
      pongSocket.off("gameStarting");
      pongSocket.off("gameOver");
      window.removeEventListener("resize", onResize);
    });

    // socket event listeners
    pongSocket.on(
      "position",
      (newBallPosition: Coordinates, newPlayerPositions: PlayerPositions) => {
        ballPosition.value.x = newBallPosition.x * windowWidth.value;
        ballPosition.value.y = newBallPosition.y * windowWidth.value;
        playerPositions.value.player1 =
          newPlayerPositions.player1 * windowWidth.value;
        playerPositions.value.player2 =
          newPlayerPositions.player2 * windowWidth.value;
        draw();
      }
    );

    pongSocket.on("score", (newScore: PlayerScores) => {
      score.value = newScore;
      draw();
    });

    pongSocket.on("enlarge", (playerToEnlargeNumber: number) => {
      if (playerToEnlargeNumber === 1) {
        racquetLenghtRatio.value.player1 /= 2;
        player1EnlargeRemaining.value--;
      } else {
        racquetLenghtRatio.value.player2 /= 2;
        player2EnlargeRemaining.value--;
      }
    });

    pongSocket.on("enlargeEnd", (playerToEnlargeNumber: number) => {
      if (playerToEnlargeNumber === 1) racquetLenghtRatio.value.player1 *= 2;
      else racquetLenghtRatio.value.player2 *= 2;
    });

    const gameHasStarted = ref(false);
    pongSocket.on("gameStarting", () => {
      gameHasStarted.value = true;
    });

    const winningPlayer = ref<string>("");
    const gameIsOver = ref(false);
    pongSocket.on("gameOver", (player1Won: boolean) => {
      if (props.userType === "player") {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keydown", preventScroll);
      }
      gameHasStarted.value = true;
      gameIsOver.value = true;
      if (player1Won) winningPlayer.value = props.player1UserName;
      else winningPlayer.value = props.player2UserName;
    });

    // socket emit
    const SendMoveMsg = (direction: string) => {
      if (gameHasStarted.value)
        pongSocket.emit("moveRacquet", { room: props.room, text: direction });
    };

    const EnlargeRacquet = () => {
      if (gameHasStarted.value) pongSocket.emit("enlargeRacquet", props.room);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const codes = ["ArrowUp", "ArrowDown"];
      if (props.gameMode === "transcendence") codes.push("Space");
      if (!codes.includes(event.code)) return;
      if (event.code === "ArrowUp") SendMoveMsg("up");
      else if (event.code === "ArrowDown") SendMoveMsg("down");
      else if (event.code === "Space") EnlargeRacquet();
    };

    const preventScroll = (event: KeyboardEvent) => {
      if (
        ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
          event.code
        ) > -1
      ) {
        event.preventDefault();
      }
    };

    const toggleAnimations = () => {
      animations.value = !animations.value;
    };

    return {
      score,
      gameHasStarted,
      gameIsOver,
      winningPlayer,
      canvas,
      SendMoveMsg,
      animations,
      toggleAnimations,
    };
  },
});
</script>
