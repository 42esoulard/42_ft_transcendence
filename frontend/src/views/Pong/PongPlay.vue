
<template>
	<h1 v-if="!queuing"> Click to play ! </h1>
	<p v-if="!queuing">
		<button v-on:click="JoinQueue()"> Join Game </button>
	</p>
	<div v-if="queuing"> 
		Waiting for opponent...
	</div>
</template>

<script>
import { io, Socket } from 'socket.io-client'


export default {
	data() {
		return {
			socket: null,
			queuing: false
		}
	},
	created() {
		this.socket =  io('http://localhost:3000/pong')
	},
	mounted() {
		// this.socket.on('opponentFound', (ids) => {
			// this.$router.push({ name: 'PongGame', params: {id: ids}})
		// })
	},
	methods: {
		JoinQueue() {
			// this.queuing = true,
			// this.socket.emit('lookingForOpponent')
			this.$router.push({ name: 'PongGame', params: {id: 'test'}})
		}
	}
}
</script>

<style>

</style>