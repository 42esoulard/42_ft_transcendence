<template>
	<p> Game # {{ room }} </p>
	<h1> {{ player1UserName }} --- vs --- {{ player2UserName }} </h1>
	<canvas ref="game" :width="windowWidth / 2" :height="windowWidth / 3" style="border: 3px solid black"> </canvas>

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
		const game = ref(null)

		const { context, ballPosition, playerPositions, draw, score, windowWidth, onResize } = getDraw()

		// lifecycle hooks
		onMounted(() => {
			window.addEventListener("keydown", onKeyDown)
			window.addEventListener("resize", onResize)
			console.log('mounted')
			context.value = game.value.getContext("2d")
		})

		onBeforeRouteLeave(() => {
			socket.value.emit('leaveGame', room.value)
			socket.value.removeEventListener('position')
			window.removeEventListener("resize", onResize)
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
	
		socket.value.on("score", new_score => {
			score.value = new_score
		})
		
		const gameHasStarted = ref(false)
		socket.value.on("gameStarting", () => {
			gameHasStarted.value = true
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
			if (gameHasStarted.value)
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

		

		return { score, room, player1UserName, player2UserName, gameHasStarted, gameIsOver, winningPlayer, game, windowWidth }

	},

}
</script>