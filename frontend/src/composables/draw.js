
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
	const ballPosition = ref({x:0, y:0})
	const playerPositions = ref({player1:0, player2:0})
	const score = ref({player1: 0,player2: 0})
	const windowWidth = ref(window.innerWidth)
	
	const draw = () => {
		const canvasWidth = windowWidth.value / 2
		const canvasHeight = windowWidth.value / 3
		context.value.clearRect(0, 0, canvasWidth, canvasHeight)

		context.value.beginPath()

		// racquets
		context.value.rect(0, playerPositions.value.player1, RACQUET_WIDTH, windowWidth.value / 16)
		context.value.rect(canvasWidth - RACQUET_WIDTH, playerPositions.value.player2, RACQUET_WIDTH, windowWidth.value / 16)
		// ball
		context.value.arc(ballPosition.value.x, ballPosition.value.y, BALL_RADIUS, 0, Math.PI*2, false);
		

		context.value.fill()
		context.value.closePath()
		
		//scores
		context.value.font = "80px Arial";
		context.value.fillText(score.value.player1, canvasWidth / 4, canvasHeight / 5)
		context.value.fillText(score.value.player2, canvasWidth * 3 / 4, canvasHeight / 5)
		
		// net
		context.value.beginPath()
		context.value.lineWidth = NET_WIDTH
		context.value.setLineDash([NET_ELEM_LENGHT, NET_ELEM_GAP])
		context.value.moveTo(canvasWidth / 2, 0);
		context.value.lineTo(canvasWidth /2, canvasHeight);
		context.value.stroke()
	}

	return { context, ballPosition, playerPositions, score, windowWidth, draw}
}

export default getDraw