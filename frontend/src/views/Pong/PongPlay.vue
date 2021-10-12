
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
import { useStore } from 'vuex'

export default {
	setup() {
		const socket = ref(clientSocket)
		const queuing = ref(false)

		const store = useStore()

		const JoinQueue = () => {
			queuing.value = true
			// socket.value.emit('joinGame', {userId: 2})
			socket.value.emit('joinGame', {userId: store.state.user.id})
	// 		// pour l'instant on rentre l'id à la main, pour pouvoir tester plusieurs id differents
	// 		// a utiliser une fois que la route sera protegee
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