
import { ref } from 'vue'

var CANVAS_WIDTH_RATIO = 2
var CANVAS_HEIGHT_RATIO = 3
var BALL_RATIO = 150
var RACQUET_LENGTH_RATIO = 16
var RACQUET_WIDTH_RATIO = 100
var SCORE_RATIO = 16
var NET_ELEM_LENGHT_RATIO = 32
var NET_ELEM_GAP_RATIO = 200
var NET_WIDTH_RATIO = 400

const getDraw = () => {

	const context = ref({})
	const ballPosition = ref({x:0, y:0})
	const playerPositions = ref({player1:0, player2:0})
	const score = ref({player1: 0,player2: 0})
	const windowWidth = ref(window.innerWidth)
	
	const draw = () => {

		const canvasWidth = windowWidth.value / CANVAS_WIDTH_RATIO
		const canvasHeight = windowWidth.value / CANVAS_HEIGHT_RATIO
		context.value.clearRect(0, 0, canvasWidth, canvasHeight)

		context.value.beginPath()

		// racquets
		const racquetLenght = windowWidth.value / RACQUET_LENGTH_RATIO
		const racquetWidth = windowWidth.value / RACQUET_WIDTH_RATIO
		context.value.rect(0, playerPositions.value.player1, racquetWidth, racquetLenght)
		context.value.rect(canvasWidth - racquetWidth, playerPositions.value.player2, racquetWidth, racquetLenght)
		
		// ball
		context.value.arc(ballPosition.value.x, ballPosition.value.y, windowWidth.value / BALL_RATIO, 0, Math.PI*2, false);
		

		context.value.fill()
		context.value.closePath()
		
		//scores
		var font_size = windowWidth.value / SCORE_RATIO
		context.value.font = `${font_size}px Arial`;
		context.value.fillText(score.value.player1, canvasWidth / 4, canvasHeight / 5)
		context.value.fillText(score.value.player2, canvasWidth * 3 / 4, canvasHeight / 5)
		
		// net
		context.value.beginPath()
		context.value.lineWidth = windowWidth.value / NET_WIDTH_RATIO
		context.value.setLineDash([windowWidth.value / NET_ELEM_LENGHT_RATIO, windowWidth.value / NET_ELEM_GAP_RATIO])
		context.value.moveTo(canvasWidth / 2, 0);
		context.value.lineTo(canvasWidth /2, canvasHeight);
		context.value.stroke()
	}
	
	const onResize = () => {
		windowWidth.value = window.innerWidth
	}

	return { context, ballPosition, playerPositions, score, windowWidth, draw, onResize}
}

export default getDraw