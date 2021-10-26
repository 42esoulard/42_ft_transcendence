
<template>
    <h1>Click to Watch</h1>
		<button v-on:click="WatchGame()"> Watch Game </button>

</template>


<script>
import { ref } from 'vue'
import { clientSocket } from '../../App.vue'
import { useRouter } from 'vue-router'

export default {
	setup() {
		const socket = ref(clientSocket)

		const WatchGame = () => {
			console.log('WatchGame emited')
			socket.value.emit('watchGame', "77") // enter id of game taking place
		}
		
		const router = useRouter()
		socket.value.on('GoToGame', (id, player1UserName, player2UserName) => {
			console.log('goToGame')
			router.push({ name: 'PongGameWatch', params: {id, player1UserName, player2UserName}})
		})

		return {WatchGame}
	}

}
</script>

<style>

</style>