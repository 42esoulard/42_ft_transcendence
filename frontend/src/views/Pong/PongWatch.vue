<template>
  <h2 class="header__title">Select the game you want to watch</h2>
  <div v-if="games.length">
    <div v-for="game in games" :key="game.id">
      <div v-if="game.users.length == 1">
        <button class="button" v-on:click="WatchGame(game.id)">
          game #{{ game.id }} : {{ game.users[0].user.username }} vs
          {{ game.users[0].user.username }}
        </button>
      </div>
      <div v-else>
        <button class="button" v-on:click="WatchGame(game.id)">
          game #{{ game.id }} : {{ game.users[0].user.username }} vs
          {{ game.users[1].user.username }}
        </button>
      </div>
    </div>
  </div>
  <div v-else>
    <h2>No available games to watch</h2>
  </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, ref } from 'vue'
import { pongSocket } from '@/App.vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { usePongApi } from "@/plugins/api.plugin";
import { Game } from "sdk/typescript-axios-client-generated";

export default defineComponent({
	setup()
	{
		const games = ref<Game[]>([])
		const api = usePongApi()

		onMounted(() => {
			api.
				getOnGoingGames()
				.then((res: any) => games.value = res.data)
				.catch((err) => console.log(err))
		})

		const WatchGame = ((id: number) => {
			pongSocket.emit('watchGame', id.toString())
		})

		const router = useRouter()
		pongSocket.on('GoToGame', (id, player1UserName, player2UserName, gameMode) => {
			router.push({ name: 'PongGameWatch', params: {room: id, player1UserName, player2UserName, authorized: 'ok', gameMode, userType: 'spectator'}})
		})

		pongSocket.on('newGame', (game: Game) => {
			console.log('new game received ' + game.id)
			games.value.push(game)
		})

		pongSocket.on('endGame', (game: Game) => {
			console.log('game ended ' + game.id)
			games.value = games.value.filter(elem => elem.id != game.id)
		})

		onBeforeRouteLeave(() => {
			pongSocket.off('endGame')
			pongSocket.off('newGame')
			pongSocket.off('GoToGame')
		})

		return { games, WatchGame }
	},

})
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>
