
import { Coordinates, gameMode, PlayerPositions, PlayerScores } from '@/types/PongGame'
import { ref } from 'vue'

var CANVAS_WIDTH_RATIO = process.env.VUE_APP_CANVAS_WIDTH
var CANVAS_HEIGHT_RATIO = process.env.VUE_APP_CANVAS_HEIGHT
var BALL_RATIO = process.env.VUE_APP_BALL_RADIUS
var RACQUET_LENGTH_RATIO = process.env.VUE_APP_RACQUET_LENGTH
var RACQUET_WIDTH_RATIO = process.env.VUE_APP_RACQUET_WIDTH

var SCORE_RATIO = 16
var NET_ELEM_LENGHT_RATIO = 32
var NET_ELEM_GAP_RATIO = 200
var NET_WIDTH_RATIO = 400

const getDraw = (mode: gameMode) => {

	// returned variables

	const windowWidth = ref(window.innerWidth)
	const context = ref<CanvasRenderingContext2D | null>(null)
	const canvas = ref<HTMLCanvasElement | null>(null)
	const ballPosition = ref<Coordinates>({x:0, y:0})
	const playerPositions = ref<PlayerPositions>({player1:0, player2:0})
	const score = ref<PlayerScores>({player1: 0,player2: 0})
	
	// helper variables

	let canvasWidth = windowWidth.value / CANVAS_WIDTH_RATIO
	let canvasHeight = windowWidth.value / CANVAS_HEIGHT_RATIO
	

	// returned functions

	const draw = () => {
		if (context.value)
			context.value.clearRect(0, 0, canvasWidth, canvasHeight)
		drawBackground()
		drawRacquets()
		drawBall()
		drawScore()
		drawNet()
	}
	
	const onResize = () => {
		windowWidth.value = window.innerWidth
		
		canvasWidth = windowWidth.value / CANVAS_WIDTH_RATIO
		canvasHeight = windowWidth.value / CANVAS_HEIGHT_RATIO
		if (canvas.value)
		{
			canvas.value.width = canvasWidth
			canvas.value.height = canvasHeight
		}
		drawBackground()
	}

	const initCanvas = () => {
		if (canvas.value)
		{
			canvas.value.width = windowWidth.value / CANVAS_WIDTH_RATIO
			canvas.value.height = windowWidth.value / CANVAS_HEIGHT_RATIO
			canvas.value.style.border = "1px solid white"
			drawBackground()
		}
	}

	// helper functions

	const drawBackground = () => {
		if (context.value)
		{
			context.value.beginPath()
			context.value.fillStyle = "black"
			context.value.rect(0, 0, canvasWidth, canvasHeight)
			context.value.fill()
			context.value.closePath()
		}
	}
	
	const drawRacquets = () => {
		if (context.value)
		{
			context.value.fillStyle = 'white'
			context.value.beginPath()
			const racquetLenght = windowWidth.value / RACQUET_LENGTH_RATIO
			const racquetWidth = windowWidth.value / RACQUET_WIDTH_RATIO
			context.value.rect(0, playerPositions.value.player1, racquetWidth, racquetLenght)
			context.value.rect(canvasWidth - racquetWidth, playerPositions.value.player2, racquetWidth, racquetLenght)
			context.value.fill()
			context.value.closePath()
		}
	}

	const drawBall = () => {
		if (context.value)
		{
			console.log(mode)
			if (mode == 'transcendence')
				context.value.fillStyle = 'red'
			else
				context.value.fillStyle = 'white'
			context.value.beginPath()
			context.value.arc(ballPosition.value.x, ballPosition.value.y, windowWidth.value / BALL_RATIO, 0, Math.PI*2, false);
			context.value.fill()
			context.value.closePath()
		}
	}
	
	const drawNet = () => {
		if (context.value)
		{
			context.value.beginPath()
			context.value.strokeStyle = 'white'
			context.value.lineWidth = windowWidth.value / NET_WIDTH_RATIO
			context.value.setLineDash([windowWidth.value / NET_ELEM_LENGHT_RATIO, windowWidth.value / NET_ELEM_GAP_RATIO])
			context.value.moveTo(canvasWidth / 2, 0);
			context.value.lineTo(canvasWidth /2, canvasHeight);
			context.value.stroke()
			context.value.closePath()
		}
	}
	
	const drawScore = () => {
		if (context.value)
		{
			context.value.fillStyle = 'white'
			var font_size = windowWidth.value / SCORE_RATIO
			context.value.font = `${font_size}px Arial`;
			context.value.fillText(score.value.player1.toString(), canvasWidth / 4, canvasHeight / 5)
			context.value.fillText(score.value.player2.toString(), canvasWidth * 3 / 4, canvasHeight / 5)
		}
	}


	return { context, ballPosition, playerPositions, score, windowWidth, canvas, draw, onResize, initCanvas}
}

export default getDraw