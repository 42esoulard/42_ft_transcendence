
<template>
  <div v-if="!queuing">
    <h1 class="header__title">Click to play</h1>
		<button class="button button--log-in" v-on:click="JoinQueue()"> Join Game </button>
  </div>

  <div v-else>
		<p> Waiting for opponent... </p>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref } from 'vue'
import { clientSocket } from '@/App.vue'
import { useStore } from 'vuex'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

export default defineComponent ({
	setup() {
		const socket = ref(clientSocket)
		const queuing = ref(false)

		const store = useStore()
		const JoinQueue = () => {
			queuing.value = true
			socket.value.emit('joinGame', {userId: store.state.user.id, userName: store.state.user.username})
		}

		const router = useRouter()
		socket.value.on('gameReadyToStart', (id, player1UserName, player2UserName) => {
			router.push({ name: 'PongGame', params: {id, player1UserName, player2UserName, authorized: 'ok'}})
		})

		onBeforeRouteLeave(() => {
			if (queuing.value)
				socket.value.emit('leaveQueue')
		})

		return {queuing, JoinQueue}
	}

})
</script>

<style lang="scss">
@import "../../../sass/main.scss";

</style>