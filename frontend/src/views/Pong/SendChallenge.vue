<template>

	<div class="header__title">
		{{ challengeStatus }}
	</div>
	<button class="button" v-on:click="cancelChallenge()"> cancel challenge </button>

</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { pongSocket } from '@/App.vue'
import { useStore } from '@/store'
import { onBeforeRouteLeave, useRouter } from "vue-router";

export default defineComponent ({
	props: {
		challengeeId: {type: String, required: true},
		challengeeName: {type: String, required: true},
	},
	inheritAttrs: false, // we dont need it, and not setting it to false a warning: "extraneous non prop attributes (authorized) were passed to component but could not be automatically inherited..."
	setup(props) {
		
		const store = useStore()	
		onMounted(() => {
			challenge(Number(props.challengeeId), props.challengeeName)
		})

		const challengeStatus = ref('')
		const challenge = (id: number, name: string) => {
			challengeStatus.value = 'challenge sent to ' + name
			pongSocket.emit('challengeRequest', {
				challengerId: store.state.user.id, 
				challengerName: store.state.user.username, 
				challengeeId: id, 
				challengeeName: name,
				gameMode: 'transcendence'})
		}

		const router = useRouter()
		const cancelChallenge = () => {
			pongSocket.emit('cancelChallenge', store.state.user.username)
			router.push({name: 'Pong'})

		}
		
		pongSocket.on('challengeDeclined', () => {
			console.log('declined')
			challengeStatus.value = 'challenge has been declined, you will be redirected in a few seconds'
			setTimeout(() => {
				router.push({name: 'Pong'})
			}, 2000)
		})

		onBeforeRouteLeave(() => {
			pongSocket.off('challengeDeclined')
			pongSocket.emit('cancelChallenge', store.state.user.username)
		})

		return { challengeStatus, cancelChallenge }
		
	}
})
</script>

<style lang="scss">
@import "../../../sass/main.scss";

</style>