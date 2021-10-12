
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
import { ref } from 'vue'
import { clientSocket } from '../../App.vue'

export default {
	setup() {
		const socket = ref(clientSocket)
		const queuing = ref(false)

		const JoinQueue = () => {
			queuing.value = true
			socket.value.emit('joinGame', {userId: 2})
	// 		// pour l'instant on rentre l'id à la main, pour pouvoir tester plusieurs id differents
	// 		// a utiliser une fois que la route sera protegee
	// 		//this.socket.emit('joinGame', {userId: this.$store.state.user.id});
		}
		return {socket, queuing, JoinQueue}
	},
	mounted() {
		this.socket.on('gameReadyToStart', (ids) => {
			this.$router.push({ name: 'PongGame', params: {id: ids}})
		})
	},

}
</script>

<style>

</style>