<template>
	<h1 class="header__title"> {{ player1UserName }} --- vs --- {{ player2UserName }} </h1>
	<canvas ref="canvas"> </canvas>

	<div class="header__title" v-if="gameIsOver">
		<h1> {{ winningPlayer }} won ! </h1>
	</div>
</template>

<script lang="ts">
import { clientSocket } from '@/App.vue'
import { defineComponent, onMounted, PropType, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import getDraw from '@/composables/draw'
import { Coordinates, gameMode, PlayerPositions, PlayerScores } from '@/types/PongGame'

export default defineComponent({
	props: {
		gameMode: {type: String as () => gameMode, required: true},
		// ou {type: String as PropType<gameMode>}
		// cf https://frontendsociety.com/using-a-typescript-interfaces-and-types-as-a-prop-type-in-vuejs-508ab3f83480
		player1UserName: {type: String, required: true},
		player2UserName: {type: String, required: true},
		room: {type: String, required: true}
	},
	inheritAttrs: false, // we dont need it, and not setting it to false a warning: "extraneous non prop attributes (authorized) were passed to component but could not be automatically inherited..."
	
	setup(props) {
	
		const { context, canvas, ballPosition, playerPositions, racquetLenghtRatio, score, windowWidth, player1EnlargeRemaining, player2EnlargeRemaining, 
			onResize, initCanvas, draw } = getDraw(props.gameMode)

		// lifecycle hooks
		onMounted(() => {
			window.addEventListener("resize", onResize)
			console.log('mounted')
			if (canvas.value)
				context.value = canvas.value.getContext("2d")
			initCanvas()
		})

		onBeforeRouteLeave(() => {
			socket.value.off('position')
			window.removeEventListener("resize", onResize)
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

		socket.value.on('enlarge', (playerToEnlargeNumber: number) => {
			if (playerToEnlargeNumber === 1)
			{
				racquetLenghtRatio.value.player1 /= 2
				player1EnlargeRemaining.value--
			}
			else
			{
				racquetLenghtRatio.value.player2 /= 2
				player2EnlargeRemaining.value--
			}
		})
		
		socket.value.on('enlargeEnd', (playerToEnlargeNumber: number) => {
			if (playerToEnlargeNumber === 1)
				racquetLenghtRatio.value.player1 *= 2
			else
				racquetLenghtRatio.value.player2 *= 2
		})
		
		const gameHasStarted = ref(false)
		socket.value.on("gameStarting", () => {
			gameHasStarted.value = true
		})
		
		const winningPlayer = ref<string>('')
		const gameIsOver = ref(false)
		socket.value.on("gameOver", (player1Won: boolean) => {
			gameHasStarted.value = true
			gameIsOver.value = true
			if (player1Won)
				winningPlayer.value = props.player1UserName
			else
				winningPlayer.value = props.player2UserName
		})
		

		return { score, gameHasStarted, gameIsOver, winningPlayer, canvas }

	},

})
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>