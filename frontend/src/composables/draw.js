
import { ref } from 'vue'

var BALL_RADIUS = 10
var RACQUET_LENGTH = 80
var RACQUET_WIDTH = 20

const getDraw = () => {

	const context = ref({})
	const game = ref(null)
	const ballPosition = ref({x:0, y:0})
	const playerPositions = ref({player1:0, player2:0})
	const score = ref({player1: 0,player2: 0})
	
	const draw = () => {
		context.value.clearRect(0, 0, game.value.width, game.value.height)

		context.value.beginPath()

		context.value.rect(0, playerPositions.value.player1, RACQUET_WIDTH, RACQUET_LENGTH)
		context.value.rect(game.value.width - RACQUET_WIDTH, playerPositions.value.player2, RACQUET_WIDTH, RACQUET_LENGTH)
		context.value.arc(ballPosition.value.x, ballPosition.value.y, BALL_RADIUS, 0, Math.PI*2, false);
		context.value.font = "80px Arial";
		context.value.fillText(score.value.player1, game.value.width / 4, game.value.height / 5)
		context.value.fillText(score.value.player2, game.value.width * 3 / 4, game.value.height / 5)
		
		context.value.fill()
		context.value.closePath()
	}

	return { context, game, ballPosition, playerPositions, score, draw}
}

export default getDraw