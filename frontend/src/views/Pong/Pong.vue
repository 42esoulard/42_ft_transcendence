
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

	<div v-for="user in users" :key="user.id">
		<router-link :to="{name: 'SendChallenge', params: {challengeeId:user.id, challengeeName: user.username} }"> challenge {{user.username}} </router-link>
	</div>

</template>


<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { pongSocket } from '@/App.vue'
import { useStore } from '@/store'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { challengeMessage, gameMode } from '@/types/PongGame'
import { useUserApi } from "@/plugins/api.plugin";
import { User } from 'sdk/typescript-axios-client-generated'

export default defineComponent ({
	setup() {
		const socket = ref(pongSocket)
		const queuing = ref(false)
		const gameMode = ref<gameMode>('transcendence')
		const api = useUserApi()
		const users = ref<User[]>([])

		const store = useStore()
		const JoinQueue = () => {
			socket.value.emit('joinGame', {
				userId: store.state.user.id, 
				userName: store.state.user.username, 
				gameMode: gameMode.value})
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
		socket.value.on('gameReadyToStart', (room: string, player1UserName: string, player2UserName: string, gameMode: gameMode) => {
			router.push({ name: 'PongGame', 
			params: {
				room,
				player1UserName, 
				player2UserName,
				gameMode,
				authorized: 'ok',
				userType: 'player'
				} 
			})
		})

		onBeforeRouteLeave(() => {
			if (queuing.value)
				socket.value.emit('leaveQueue')
		})

		onMounted(() => {
			api.
				getUsers()
				.then((res: any) => users.value = res.data)
				.catch((err) => console.log(err))
		})

		const challenged = ref(false)
		const challengeMessage = ref<challengeMessage>()

		// socket.value.on('challengeCancelled', (challengerId: number) => {
		// 	if (challengeMessage && challengeMessage.value?.challengerId)
		// 	{
		// 		challenged.value = false
		// 		challengeMessage.value = undefined
		// 	}
		// 	if (challenging && challengerId === store.state.user.id)
		// 	{
		// 		challenging.value = false
		// 	}
		// })

		// socket.value.on('challengeDeclined', () => {
		// 	challengeStatus.value = 'challenge has been declined'
		// 	console.log('challenge has been declined')
		// })

		return {queuing, JoinQueue, gameMode, alreadyInQueue, users, challenged}
	}

})
</script>

<style lang="scss">
@import "../../../sass/main.scss";

</style>