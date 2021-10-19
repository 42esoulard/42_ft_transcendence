<template>
	<p> Game # {{ room }} </p>
	<h1> {{ player1UserName }} [{{ score.player1 }}]  |  {{ player2UserName }} [{{ score.player2 }}] </h1>
	<canvas ref="game" width="640" height="480" style="border: 1px solid black"> </canvas>

	<div v-if="!gameHasStarted">
		<h1> Get ready, game is about to start ! </h1>
	</div>

	<div v-if="gameIsOver">
		<h1> {{ winningPlayer }} won ! </h1>
	</div>
</template>

<script>
import { clientSocket } from '../../App.vue'
import { onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import getDraw from '../../composables/draw'

export default {
	setup() {
		
		const route = useRoute()
		const room =  ref(route.params.id)
		const player1UserName = ref(route.params.player1UserName)
		const player2UserName = ref(route.params.player2UserName)

		const { context, game, ballPosition, playerPositions, draw } = getDraw()

		// lifecycle hooks
		onMounted(() => {
			console.log('mounted')
			context.value = game.value.getContext("2d")
		})

		onBeforeRouteLeave(() => {
			socket.value.emit('leaveGame', room.value)
			socket.value.removeEventListener('position')
			window.removeEventListener("keydown", onKeyDown)
			console.log('leaving')
		})


		// socket event listeners
		const socket = ref(clientSocket)
		socket.value.on("position", (NewballPosition, NewplayerPositions) => {
			ballPosition.value = NewballPosition
			playerPositions.value = NewplayerPositions
			draw()
		})
	
		const score = ref({player1: 0,player2: 0})
		socket.value.on("score", new_score => {
			score.value = new_score
		})
		
		const gameHasStarted = ref(false)
		socket.value.on("gameStarting", () => {
			gameHasStarted.value = true
			window.addEventListener("keydown", onKeyDown)
		})
		
		const winningPlayer = ref(null)
		const gameIsOver = ref(false)
		socket.value.on("gameOver", (player1Won) => {
			window.removeEventListener("keydown", onKeyDown)
			gameHasStarted.value = true
			gameIsOver.value = true
			if (player1Won)
				winningPlayer.value = player1UserName
			else
				winningPlayer.value = player2UserName
		})
		

		// socket emit
		const SendMoveMsg = (direction) => {
			socket.value.emit('moveRacquet', {room: room.value, text: direction})
		}
		
		const onKeyDown = (event) => {
			const codes = ['ArrowUp', 'ArrowDown'];
			if (!codes.includes(event.code))
				return;
			if (event.code === 'ArrowUp')
				SendMoveMsg('up')
			else if (event.code === 'ArrowDown')
				SendMoveMsg('down')
		}
		

		return { score, room, player1UserName, player2UserName, gameHasStarted, gameIsOver, winningPlayer, game }

	},

}
</script>