<template>
	<canvas ref="game" width="640" height="480" style="border: 1px solid black">
	</canvas>>
	<p>
		<button v-on:click="move('right')"> Rigth </button>
		<button v-on:click="move('left')"> Left </button>
		<button v-on:click="move('up')"> Up </button>
		<button v-on:click="move('down')"> Down </button>
	</p>
</template>

<script>
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000')
export default({
	name: 'Pong',
	data() {
		return {
			context: {},
			position: {
				x: 0,
				y: 0
			}
			}
		},
	mounted() {
		console.log('mounted')
		this.context = this.$refs.game.getContext("2d");
		// socket.emit('msgToServer', 'yooo')
		socket.on("position", data => {
			console.log('position received')
			this.position = data
			this.context.clearRect(0, 0, this.$refs.game.width, this.$refs.game.height)
			this.context.fillRect(this.position.x, this.position.y, 20, 20)
		})
	},
	methods: {
		move(direction) {
			socket.emit('move', direction)
		}
	}
})
</script>
