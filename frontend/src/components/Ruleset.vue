<template>
  <div class="pong-ruleset">
    <span class="pong-rule__text pong-rule__text--title">Ruleset</span>
    <hr />
    <div class="pong-rule">
      <i class="fas fa-gamepad pong-rule__icon" />
      <span class="pong-rule__text"
        >Move your paddle with the keyboard's arrow up and arrow down, or by
        clicking on the arrow buttons</span
      >
    </div>
    <hr />
    <div class="pong-rule pong-rule--right">
      <i class="fas fa-trophy pong-rule__icon" />
      <span class="pong-rule__text">Score 11 points to win the game</span>
    </div>
    <hr />
    <div class="pong-rule pong-rule">
      <i class="fas fa-meteor pong-rule__icon" />
      <span class="pong-rule__text"
        >Points are earned when your opponent fails to return the ball</span
      >
    </div>
    <hr />
    <div class="pong-rule pong-rule--right">
      <i class="fas fa-chart-line pong-rule__icon" />
      <span class="pong-rule__text"
        >Harder and harder! Each time the ball hits a paddle, it speeds up</span
      >
    </div>
    <hr />
    <div class="pong-rule pong-rule">
      <i class="fas fa-star pong-rule__icon" />
      <div class="pong-rule__text">
        In
        <span class="pong-rule__text--transcendence">transcendence mode</span>,
        you got 3 power-ups to enlarge your paddle with your spacebar
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";

export default defineComponent({
  name: "Ruleset",
  setup() {},
});
</script>
