
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

	<div v-for="user in users" :key="user.id" class="button">
		<router-link :to="{name: 'SendChallenge', params: {challengeeId:user.id, challengeeName: user.username, authorized: 'ok'} }"> challenge {{user.username}} </router-link>
	</div>

	<ReceiveChallenge />

</template>


<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { pongSocket } from '@/App.vue'
import { useStore } from '@/store'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { gameMode } from '@/types/PongGame'
import { useUserApi } from "@/plugins/api.plugin";
import { User } from 'sdk/typescript-axios-client-generated'
import ReceiveChallenge from './ReceiveChallenge.vue'

export default defineComponent ({
	components: { ReceiveChallenge },
	setup() {
		const queuing = ref(false)
		const gameMode = ref<gameMode>('transcendence')
		const api = useUserApi()
		const users = ref<User[]>([])

		const store = useStore()
		const JoinQueue = () => {
			pongSocket.emit('joinGame', {
				userId: store.state.user.id, 
				userName: store.state.user.username, 
				gameMode: gameMode.value})
		}

		pongSocket.on('addedToQueue', () => {
			queuing.value = true
		})
		
		const alreadyInQueue = ref(false)
		pongSocket.on('alreadyInQueue', () => {
			console.log('already in queue !')
			alreadyInQueue.value = true
			setTimeout(() => {
				router.push({name: 'Home'})
			}, 3000)
		})

		const router = useRouter()

		onBeforeRouteLeave(() => {
			pongSocket.off('addedToQueue')
			pongSocket.off('alreadyInQueue')
			if (queuing.value)
				pongSocket.emit('leaveQueue')
		})

		onMounted(() => {
			api.
				getUsers()
				.then((res: any) => users.value = res.data)
				.catch((err) => console.log(err))
		})

		return {queuing, JoinQueue, gameMode, alreadyInQueue, users}
	}

})
</script>

<style lang="scss">
@import "../../../sass/main.scss";

</style>