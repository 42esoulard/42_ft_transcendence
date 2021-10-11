<template>
	<h1> Game # {{ id }} </h1>
	<canvas ref="game" width="640" height="480" style="border: 1px solid black">
	</canvas>
	<p> ball x {{ position.ball.x }} </p>
	<p> ball y {{ position.ball.y }} </p>
	<p> Use arrows (keyboard) to move </p>
	
</template>

<script>
import { io } from 'socket.io-client'
import { clientSocket } from '../../App.vue'
export default {
	data() {
		return {
			id: this.$route.params.id,
			context: {},
			position: {
				player1: 0,
				player2: 0,
				ball: {
					x: 0,
					y: 0
				},
			},
			socket: null,
			room: this.$route.params.id,
		}
	},
	created() {
		this.socket = clientSocket
		window.addEventListener("keydown", this.onKeyDown)
		
	},
	mounted() {
		console.log('mounted')
		this.context = this.$refs.game.getContext("2d");
		
		this.socket.on("position", data => {
			console.log('position received')
			if (this.room)
				this.draw(data)
		})

	},
	
	beforeRouteLeave()
	{
		this.socket.emit('leaveGame', this.room)
		this.socket.removeEventListener('position')
		window.removeEventListener("keydown", this.onKeyDown)
		console.log('leaving')
	},

	methods: {
		draw(data)
		{
			this.position = data
			this.context.clearRect(0, 0, this.$refs.game.width, this.$refs.game.height)

			this.context.beginPath()
			this.context.rect(0, this.position.player1, 20, 80)
			this.context.rect(620, this.position.player2, 20, 80)
			this.context.arc(this.position.ball.x, this.position.ball.y, 10, 0, Math.PI*2, false);
			this.context.fill()
			this.context.closePath()
		},
		SendMoveMsg(direction) {
			if (this.room)
			{
				console.log(this.room)
				this.socket.emit('moveRacquet', {room: this.room, text: direction})
			}
		},
		onKeyDown(event) {
			const codes = ['ArrowUp', 'ArrowDown'];
			if (!codes.includes(event.code))
				return;
			if (event.code === 'ArrowUp')
				this.SendMoveMsg('up')
			else if (event.code === 'ArrowDown')
				this.SendMoveMsg('down')
		}
	}
}
</script>