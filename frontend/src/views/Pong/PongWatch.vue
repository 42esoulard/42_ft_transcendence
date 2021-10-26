<template>
	<h1> Select the game you want to watch </h1>
	<div v-for="game in games" :key="game.id">
		<button v-on:click="WatchGame(game.id)"> {{ game.id }} </button>
	</div>
</template>

<script>

import { ref } from 'vue'
import { clientSocket } from '../../App.vue'
import { useRouter } from 'vue-router'

export default {
	setup()
	{
		const games = ref([])
		const socket = ref(clientSocket)
		
		const WatchGame = (id) => {
			console.log('WatchGame emited, id: ' + id)
			socket.value.emit('watchGame', id.toString())
		}
		
		const router = useRouter()
		socket.value.on('GoToGame', (id, player1UserName, player2UserName) => {
			console.log('goToGame')
			router.push({ name: 'PongGameWatch', params: {id, player1UserName, player2UserName}})
		})

		return { games, WatchGame }
	},
	
	async mounted()
	{
			const res = await fetch('http://localhost:3000/pong')
			const json = await res.json()
			this.games = json

	}
}
</script>

<style>

</style>