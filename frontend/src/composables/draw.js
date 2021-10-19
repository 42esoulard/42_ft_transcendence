
import { ref } from 'vue'

const getDraw = () => {

	const context = ref({})
	const game = ref(null)
	const ballPosition = ref({x:0, y:0})
	const playerPositions = ref({player1:0, player2:0})
	
	const draw = () => {
		context.value.clearRect(0, 0, game.value.width, game.value.height)

		context.value.beginPath()
		context.value.rect(0, playerPositions.value.player1, 20, 80)
		context.value.rect(620, playerPositions.value.player2, 20, 80)
		context.value.arc(ballPosition.value.x, ballPosition.value.y, 10, 0, Math.PI*2, false);
		context.value.fill()
		context.value.closePath()
	}

	return { context, game, ballPosition, playerPositions, draw}
}

export default getDraw