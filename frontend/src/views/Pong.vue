<template>
	<canvas ref="game" width="640" height="480" style="border: 1px solid black">
	</canvas>
	<p>
		<button v-on:click="SendMoveMsg('right')"> Rigth </button>
		<button v-on:click="SendMoveMsg('left')"> Left </button>
		<button v-on:click="SendMoveMsg('up')"> Up </button>
		<button v-on:click="SendMoveMsg('down')"> Down </button>
	</p>
	<p> Use arrows (keyboard) or buttons to move </p>
	
	<p>
		<button v-on:click="JoinRoom('default')"> Join Game </button>
	</p>
</template>

<script>
import { io } from 'socket.io-client'

export default({
	name: 'Pong',
	data() {
		return {
			context: {},
			position: {
				x: 0,
				y: 0
			},
			socket: null,
			room: '',
			}
		},
	created() {
		this.socket = io('http://localhost:3000/pong')
		window.addEventListener("keydown", this.onKeyDown)
		
	},
	mounted() {
		console.log('mounted')
		this.context = this.$refs.game.getContext("2d");
		
		this.socket.on("position", data => {
			console.log('position received')
			this.position = data
			this.context.clearRect(0, 0, this.$refs.game.width, this.$refs.game.height)
			this.context.fillRect(this.position.x, this.position.y, 20, 20)
		})

		this.socket.on('joinedRoom', data => {
			this.room = data,
			alert("Youve joined the game !")
		})
		
		// this.username = prompt('Enter your username')
		
	},
	methods: {
		SendMoveMsg(direction) {
			this.socket.emit('move', {room: this.room, text: direction})
		},
		JoinRoom(roomName) {
			this.socket.emit('joinRoom', roomName)
		},
		onKeyDown(event) {
			const codes = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
			if (!codes.includes(event.code))
				return;
			if (event.code === 'ArrowUp')
				this.SendMoveMsg('up')
			else if (event.code === 'ArrowDown')
				this.SendMoveMsg('down')
			else if (event.code === 'ArrowLeft')
				this.SendMoveMsg('left')
			else if (event.code === 'ArrowRight')
				this.SendMoveMsg('right')
		}
	}
})
</script>
