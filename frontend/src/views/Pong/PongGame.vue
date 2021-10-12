<template>
	<h1> Game # {{ id }} </h1>
	<canvas ref="game" width="640" height="480" style="border: 1px solid black">
	</canvas>
	<p> user1 [{{ score.player1 }}]  |  user2 [{{ score.player2 }}] </p>
	<p> ball x {{ position.ball.x }} </p>
	<p> ball y {{ position.ball.y }} </p>
	<p> Use arrows (keyboard) to move </p>
	
</template>

<script>
import { clientSocket } from '../../App.vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

export default {
	data() {
		return {
			id: this.$route.params.id,
			// context: {},
		}
	},
	setup() {
		const position = ref({
			player1: 0,
			player2: 0,
			ball: {
				x: 0,
				y: 0
			},
		})

		const game = ref(null)

		const context = ref({})
		
		const route = useRoute()

		const score = ref({
			player1: 0,
			player2: 0
		})

		const socket = ref(clientSocket)
		const room =  ref(route.params.id)

		const draw = (data) => {
			position.value = data
			context.value.clearRect(0, 0, game.value.width, game.value.height)

			context.value.beginPath()
			context.value.rect(0, position.value.player1, 20, 80)
			context.value.rect(620, position.value.player2, 20, 80)
			context.value.arc(position.value.ball.x, position.value.ball.y, 10, 0, Math.PI*2, false);
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

		return { position, score, socket, room, draw, SendMoveMsg, onKeyDown, context, game }

	},
	created() {
		window.addEventListener("keydown", this.onKeyDown)
	},
	mounted() {
		console.log('mounted')
		this.context = this.$refs.game.getContext("2d");
		
		this.socket.on("position", (positions, score) => {
			console.log('position received')
			// if (this.room)
				this.draw(positions)
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