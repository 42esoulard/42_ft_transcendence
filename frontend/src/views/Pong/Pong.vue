
<template>
  <div v-if="!queuing">
    <h1 class="header__title">Click to play</h1>
		<select v-model="gameMode">
			<option disabled>Please select game mode</option>
			<option>classic</option>
			<option>transcendence</option>
		</select>
		<button class="button button--log-in" v-on:click="JoinQueue()"> Join Game </button>
  </div>

  <div v-else>
		<p> Waiting for opponent... </p>
  </div>
  
	<div v-if="alreadyInQueue" class="header__title">
		<p> You are already in queue ! You will be redirected to Homepage shortly... </p>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref } from 'vue'
import { pongSocket } from '@/App.vue'
import { useStore } from '@/store'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { gameMode } from '@/types/PongGame'

export default defineComponent ({
	setup() {
		const socket = ref(pongSocket)
		const queuing = ref(false)
		const gameMode = ref<gameMode>('transcendence')

		const store = useStore()
		const JoinQueue = () => {
			socket.value.emit('joinGame', {userId: store.state.user.id, userName: store.state.user.username, gameMode: gameMode.value})
		}

		socket.value.on('addedToQueue', () => {
			queuing.value = true
		})
		
		const alreadyInQueue = ref(false)
		socket.value.on('alreadyInQueue', () => {
			console.log('already in queue !')
			alreadyInQueue.value = true
			setTimeout(() => {
				router.push({name: 'Home'})
			}, 3000)
		})

		const router = useRouter()
		socket.value.on('gameReadyToStart', (id: string, player1UserName: string, player2UserName: string, gameMode: gameMode) => {
			router.push({ name: 'PongGame', params: {room: id, player1UserName, player2UserName, authorized: 'ok', gameMode, userType: 'player'} })
		})

		onBeforeRouteLeave(() => {
			if (queuing.value)
				socket.value.emit('leaveQueue')
		})

		return {queuing, JoinQueue, gameMode, alreadyInQueue}
	}

})
</script>

<style lang="scss">
@import "../../../sass/main.scss";

</style>