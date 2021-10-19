<template>
	<p> Game # {{ room }} </p>
	<h1> {{ player1UserName }} [{{ score.player1 }}]  |  {{ player2UserName }} [{{ score.player2 }}] </h1>
	<canvas ref="game" width="640" height="480" style="border: 1px solid black">
	</canvas>

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

		const score = ref({player1: 0,player2: 0})

		const socket = ref(clientSocket)
		const room =  ref(route.params.id)
		const player1UserName = ref(route.params.player1UserName)
		const player2UserName = ref(route.params.player2UserName)

		const gameHasStarted = ref(false)
		const gameIsOver = ref(false)
		const winningPlayer = ref(null)

		const { context, game, ballPosition, playerPositions, draw } = getDraw()

		const SendMoveMsg = (direction) => {
			if (room.value)
			{
				// console.log(room.value)
				socket.value.emit('moveRacquet', {room: room.value, text: direction})
			}
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

		onMounted(() => {
			console.log('mounted')
			context.value = game.value.getContext("2d")
			window.addEventListener("keydown", onKeyDown)
		})

		onBeforeRouteLeave(() => {
			socket.value.emit('leaveGame', room.value)
			socket.value.removeEventListener('position')
			window.removeEventListener("keydown", onKeyDown)
			console.log('leaving')
		})
		
		socket.value.on("position", (NewballPosition, NewplayerPositions) => {
			ballPosition.value = NewballPosition
			playerPositions.value = NewplayerPositions
			draw()
		})
	
		socket.value.on("score", new_score => {
			score.value = new_score
		})
		
		socket.value.on("gameStarting", () => {
			gameHasStarted.value = true
		})
		
		socket.value.on("gameOver", (player1Won) => {
			gameHasStarted.value = true
			gameIsOver.value = true
			if (player1Won)
				winningPlayer.value = player1UserName
			else
				winningPlayer.value = player2UserName
		})
		


		return { ballPosition, playerPositions, score, socket, room, draw, context, game, player1UserName, player2UserName, gameHasStarted, gameIsOver, winningPlayer }

	},

}
</script>