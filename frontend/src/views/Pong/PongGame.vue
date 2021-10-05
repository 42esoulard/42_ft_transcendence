<template>
	<h1> Game # {{ id }} </h1>
	<p>
		<button v-on:click="JoinRoom('default')"> Join Game </button>
	</p>
	<canvas ref="game" width="640" height="480" style="border: 1px solid black">
	</canvas>
	<p> ball x {{ position.ball.x }} </p>
	<p> ball y {{ position.ball.y }} </p>
	<p> Use arrows (keyboard) to move </p>
	
</template>

<script>
import { io } from 'socket.io-client'
import clientSocket from '../../App.vue'
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
			room: '',
			playing: false
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
			if (this.playing)
				this.draw(data)
		})

		this.socket.on('joinedRoom', data => {
			this.room = data
			this.playing = true
			// alert("Youve joined the game !")
		})
		this.socket.on('roomIsFull', () => {
			alert("Sorry, room is full")
		})
		this.socket.on('opponentJoinedRoom', () => {
			alert("Opponent has joined the game !")
		})
		this.socket.on('opponentLeftRoom', () => {
			alert("Opponent has left the game !!")
		})
	},
	
	beforeRouteLeave()
	{
		if (this.room)
		{
			alert('Leaving the game')
			this.socket.emit('leaveRoom', this.room)
			this.playing = false
			console.log('leaving')
		}
	},

	methods: {
		draw(data)
		{
			console.log('position received')
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
				this.socket.emit('move', {room: this.room, text: direction})
		},
		JoinRoom(roomName) {
			this.socket.emit('joinRoom', roomName)
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