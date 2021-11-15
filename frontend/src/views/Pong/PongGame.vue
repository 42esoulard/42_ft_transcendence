<template>
	<p> Game # {{ room }} </p>
	<p> Mode: {{ gameMode }} </p>
	<h1 class="header__title"> {{ player1UserName }} --- vs --- {{ player2UserName }} </h1>
	<canvas ref="canvas"> </canvas>

	<div class="header__title" v-if="!gameHasStarted">
		<h1> Get ready, game is about to start ! </h1>
	</div>

	<div class="header__title" v-if="gameIsOver">
		<h1> {{ winningPlayer }} won ! </h1>
	</div>
	<p v-if="!gameIsOver">
		<button class="button" v-on:click="SendMoveMsg('up')"> Up </button>
		<button class="button" v-on:click="SendMoveMsg('down')"> Down </button>
	</p>
</template>

<script lang="ts">
import { clientSocket } from '@/App.vue'
import { defineComponent, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import getDraw from '@/composables/draw'
import { Coordinates, PlayerPositions, PlayerScores } from '@/types/PongGame'

export default defineComponent({
	setup() {
		
		const route = useRoute()
		const room =  ref(route.params.id)
		const player1UserName = ref(route.params.player1UserName)
		const player2UserName = ref(route.params.player2UserName)
		const gameMode = ref(route.params.gameMode)

		const { context, canvas, ballPosition, playerPositions, score, windowWidth, 
			onResize, initCanvas, draw } = getDraw()

		// lifecycle hooks
		onMounted(() => {
			window.addEventListener("keydown", onKeyDown)
			window.addEventListener("resize", onResize)
			console.log('mounted')
			if (canvas.value)
				context.value = canvas.value.getContext("2d")
			initCanvas()
		})

		onBeforeRouteLeave(() => {
			socket.value.emit('leaveGame', room.value)
			socket.value.off('position')
			window.removeEventListener("resize", onResize)
			window.removeEventListener("keydown", onKeyDown)
			console.log('leaving')
		})


		// socket event listeners
		const socket = ref(clientSocket)
		socket.value.on("position", (newBallPosition: Coordinates, newPlayerPositions: PlayerPositions) => {
			ballPosition.value.x = newBallPosition.x * windowWidth.value
			ballPosition.value.y = newBallPosition.y * windowWidth.value
			playerPositions.value.player1 = newPlayerPositions.player1 * windowWidth.value
			playerPositions.value.player2 = newPlayerPositions.player2 * windowWidth.value
			draw()
		})
	
		socket.value.on("score", (newScore: PlayerScores) => {
			score.value = newScore
			draw()
		})
		
		const gameHasStarted = ref(false)
		socket.value.on("gameStarting", () => {
			gameHasStarted.value = true
		})
		
		const winningPlayer = ref<string | string[]>('')
		const gameIsOver = ref(false)
		socket.value.on("gameOver", (player1Won: boolean) => {
			window.removeEventListener("keydown", onKeyDown)
			gameHasStarted.value = true
			gameIsOver.value = true
			if (player1Won)
				winningPlayer.value = player1UserName.value
			else
				winningPlayer.value = player2UserName.value
		})
		

		// socket emit
		const SendMoveMsg = (direction: string) => {
			if (gameHasStarted.value)
				socket.value.emit('moveRacquet', {room: room.value, text: direction})
		}
		
		const onKeyDown = (event: KeyboardEvent) => {
			const codes = ['ArrowUp', 'ArrowDown'];
			if (!codes.includes(event.code))
				return;
			if (event.code === 'ArrowUp')
				SendMoveMsg('up')
			else if (event.code === 'ArrowDown')
				SendMoveMsg('down')
		}

		return { score, room, player1UserName, player2UserName, gameHasStarted, gameIsOver, winningPlayer, canvas, gameMode, SendMoveMsg }

	},

})
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>