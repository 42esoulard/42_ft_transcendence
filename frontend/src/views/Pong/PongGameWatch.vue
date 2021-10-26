<template>
	<p> Watching Game # {{ room }} </p>
	<h1> {{ player1UserName }} --- vs --- {{ player2UserName }} </h1>
	<canvas ref="game" style="border: 3px solid black"> </canvas>

	<div v-if="gameIsOver">
		<h1> {{ winningPlayer }} won ! </h1>
	</div>
</template>

<script>
import { clientSocket } from '../../App.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import getDraw from '../../composables/draw'

export default {
	setup() {
		
		const route = useRoute()
		const room =  ref(route.params.id)
		const player1UserName = ref(route.params.player1UserName)
		const player2UserName = ref(route.params.player2UserName)

		const { 
			context, game, 
			ballPosition, playerPositions, score, 
			windowWidth, onResize, setInitalCanvasSize, 
			draw } = getDraw()

		// lifecycle hooks
		onMounted(() => {
			window.addEventListener("resize", onResize)
			console.log('mounted')
			context.value = game.value.getContext("2d")
			setInitalCanvasSize()
		})

		onBeforeRouteLeave(() => {
			socket.value.emit('leaveGame', room.value)
			socket.value.removeEventListener('position')
			window.removeEventListener("resize", onResize)
			console.log('leaving')
		})

		onUnmounted(() => {
			console.log('unmounted')
		})


		// socket event listeners
		const socket = ref(clientSocket)
		socket.value.on("position", (newBallPosition, newPlayerPositions) => {
			ballPosition.value.x = newBallPosition.x * windowWidth.value
			ballPosition.value.y = newBallPosition.y * windowWidth.value
			playerPositions.value.player1 = newPlayerPositions.player1 * windowWidth.value
			playerPositions.value.player2 = newPlayerPositions.player2 * windowWidth.value
			draw()
		})
	
		socket.value.on("score", new_score => {
			score.value = new_score
			draw()
		})
		
		const winningPlayer = ref(null)
		const gameIsOver = ref(false)
		socket.value.on("gameOver", (player1Won) => {
			gameIsOver.value = true
			if (player1Won)
				winningPlayer.value = player1UserName
			else
				winningPlayer.value = player2UserName
		})
		


		return { score, room, player1UserName, player2UserName, gameIsOver, winningPlayer, game }

	},

}
</script>