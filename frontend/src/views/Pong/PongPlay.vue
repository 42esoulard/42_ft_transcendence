
<template>
  <div v-if="!queuing">
    <h1>Click to play</h1>
		<button v-on:click="JoinQueue()"> Join Game </button>
  </div>

  <div v-else>
		<p> Waiting for opponent... </p>
  </div>
</template>


<script>
// import { io, Socket } from 'socket.io-client'
import { clientSocket } from '../../App.vue'

export default {
	data() {
		return {
			socket: null,
			queuing: false
		}
	},
	created() {
		this.socket = clientSocket
		// this.socket =  io('http://localhost:3000/pong')
	},
	mounted() {
		this.socket.on('gameReadyToStart', (ids) => {
			this.$router.push({ name: 'PongGame', params: {id: ids}})
		})
	},
	methods: {
		JoinQueue() {
			this.queuing = true,

			// a utiliser une fois que la route sera protegee
			//this.socket.emit('joinGame', {userId: this.$store.state.user.id});
			
			// pour l'instant on rentre l'id à la main, pour pouvoir tester plusieurs id differents
			this.socket.emit('joinGame', {userId: 3});
		}
	}
}
</script>

<style>

</style>