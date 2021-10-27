<template>
	<h1> Select the game you want to watch </h1>
	<div v-for="game in games" :key="game.id">
		<button v-on:click="WatchGame(game.id)"> game #{{ game.id }} : {{ game.users[0].user.username }} vs {{ game.users[1].user.username }} </button>
	</div>
</template>

<script>

import { ref } from 'vue'
import { clientSocket } from '../../App.vue'
import { useRouter } from 'vue-router'
import { useDefaultApi } from "@/plugins/api.plugin";

export default {
	setup()
	{
		const games = ref([])
		const socket = ref(clientSocket)
		const api = useDefaultApi()
		
		const WatchGame = (id) => {
			// console.log('WatchGame emited, id: ' + id)
			socket.value.emit('watchGame', id.toString())
		}
		
		const router = useRouter()
		socket.value.on('GoToGame', (id, player1UserName, player2UserName) => {
			// console.log('goToGame')
			router.push({ name: 'PongGameWatch', params: {id, player1UserName, player2UserName, authorized:true}})
		})

		return { games, WatchGame, api }
	},
	
	async mounted()
	{
			const res = await this.api.getOnGoingGames()
			this.games = res.data

			// filtering games where user is playing againt itself (which should not happen in production): causes problem as game.users[1] doesnt exist
			this.games = this.games.filter((game) => game.users.length > 1)
	}
}
</script>

<style>

</style>