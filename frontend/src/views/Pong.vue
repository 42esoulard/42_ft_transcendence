<template>
	<canvas ref="game" width="640" height="480" style="border: 1px solid black">
	</canvas>
	<p>
		<button v-on:click="move('right')"> Rigth </button>
		<button v-on:click="move('left')"> Left </button>
		<button v-on:click="move('up')"> Up </button>
		<button v-on:click="move('down')"> Down </button>
	</p>
	<p> Use arrows (keyboard) or buttons to move </p>
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
			socket: null
			}
		},
	created() {
		this.socket = io('http://localhost:3000')
		window.addEventListener("keydown", this.onKeyDown)
	},
	mounted() {
		console.log('mounted')
		this.context = this.$refs.game.getContext("2d");
		// socket.emit('msgToServer', 'yooo')
		this.socket.on("position", data => {
			console.log('position received')
			this.position = data
			this.context.clearRect(0, 0, this.$refs.game.width, this.$refs.game.height)
			this.context.fillRect(this.position.x, this.position.y, 20, 20)
		})
	},
	methods: {
		move(direction) {
			this.socket.emit('move', direction)
		},
		onKeyDown(event) {
			const codes = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
			if (!codes.includes(event.code))
				return;
			if (event.code === 'ArrowUp')
				this.move('up')
			else if (event.code === 'ArrowDown')
				this.move('down')
			else if (event.code === 'ArrowLeft')
				this.move('left')
			else if (event.code === 'ArrowRight')
				this.move('right')
		}
	}
})
</script>
