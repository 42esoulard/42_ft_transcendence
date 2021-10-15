<template>
	<h1> Game # {{ room }} </h1>
	<canvas ref="game" width="640" height="480" style="border: 1px solid black">
	</canvas>
	<p> {{ player1UserName }} [{{ score.player1 }}]  |  {{ player2UserName }} [{{ score.player2 }}] </p>
	
</template>

<script>
import { clientSocket } from '../../App.vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

export default {
	setup() {
		const ballPosition = ref({x:0, y:0})
		const playerPositions = ref({player1:0, player2:0})

		const game = ref(null)

		const context = ref({})
		
		const route = useRoute()

		const score = ref({player1: 0,player2: 0})

		const socket = ref(clientSocket)
		const room =  ref(route.params.id)
		const player1UserName = ref(route.params.player1UserName)
		const player2UserName = ref(route.params.player2UserName)

		const draw = () => {
			context.value.clearRect(0, 0, game.value.width, game.value.height)

			context.value.beginPath()
			context.value.rect(0, playerPositions.value.player1, 20, 80)
			context.value.rect(620, playerPositions.value.player2, 20, 80)
			context.value.arc(ballPosition.value.x, ballPosition.value.y, 10, 0, Math.PI*2, false);
			context.value.fill()
			context.value.closePath()
		}
		
		const SendMoveMsg = (direction) => {
			if (room.value)
			{
				console.log(room.value)
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


		return { ballPosition, playerPositions, score, socket, room, draw, SendMoveMsg, onKeyDown, context, game, player1UserName, player2UserName }

	},
	created() {
		window.addEventListener("keydown", this.onKeyDown)
	},
	mounted() {
		console.log('mounted')
		this.context = this.$refs.game.getContext("2d");
		
		this.socket.on("position", (ballPosition, playerPositions, score) => {
		this.ballPosition = ballPosition
		this.playerPositions = playerPositions
		this.draw()
		this.score = score
		})
	},
	beforeRouteLeave()
	{
		this.socket.emit('leaveGame', this.room)
		this.socket.removeEventListener('position')
		window.removeEventListener("keydown", this.onKeyDown)
		console.log('leaving')
	},

}
</script>