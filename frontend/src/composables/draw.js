
import { ref } from 'vue'

var BALL_RADIUS = 10
var RACQUET_LENGTH = 80
var RACQUET_WIDTH = 20
var NET_ELEM_LENGHT = 40
var NET_ELEM_GAP = 10
var NET_WIDTH = 5
var HEIGHT_WIDTH_RATIO = 1.5

const getDraw = () => {

	const context = ref({})
	const game = ref(null)
	const ballPosition = ref({x:0, y:0})
	const playerPositions = ref({player1:0, player2:0})
	const score = ref({player1: 0,player2: 0})
	const windowWidth = ref(window.innerWidth)
	const canvasWidth = ref(windowWidth.value / 2)
	const canvasHeight = ref(canvasWidth.value / HEIGHT_WIDTH_RATIO)
	
	const draw = () => {
		context.value.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

		context.value.beginPath()

		// racquets
		context.value.rect(0, playerPositions.value.player1, RACQUET_WIDTH, RACQUET_LENGTH)
		context.value.rect(game.value.width - RACQUET_WIDTH, playerPositions.value.player2, RACQUET_WIDTH, RACQUET_LENGTH)
		// ball
		context.value.arc(ballPosition.value.x, ballPosition.value.y, BALL_RADIUS, 0, Math.PI*2, false);
		

		context.value.fill()
		context.value.closePath()
		
		//scores
		context.value.font = "80px Arial";
		context.value.fillText(score.value.player1, game.value.width / 4, game.value.height / 5)
		context.value.fillText(score.value.player2, game.value.width * 3 / 4, game.value.height / 5)
		
		// net
		context.value.beginPath()
		context.value.lineWidth = NET_WIDTH
		context.value.setLineDash([NET_ELEM_LENGHT, NET_ELEM_GAP])
		context.value.moveTo(game.value.width / 2, 0);
		context.value.lineTo(game.value.width /2, game.value.height);
		context.value.stroke()
	}

	return { context, game, ballPosition, playerPositions, score, canvasHeight, canvasWidth, draw}
}

export default getDraw