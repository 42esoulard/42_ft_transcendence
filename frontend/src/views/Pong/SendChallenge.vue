<template>

	<div>
		{{ challengeStatus }}
		<button v-on:click="cancelChallenge()"> cancel challenge </button>
	</div>

</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { pongSocket } from '@/App.vue'
import { useStore } from '@/store'
import { useRouter } from "vue-router";

export default defineComponent ({
	props: {
		challengeeId: {type: String, required: true},
		challengeeName: {type: String, required: true},
	},
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
			pongSocket.emit('cancelChallenge', store.state.user.id)
			router.push({name: 'Pong'})

		}
		
		pongSocket.on('challengeDeclined', () => {
			challengeStatus.value = 'challenge has been declined'
			console.log('challenge has been declined')
		})

		return { challengeStatus, cancelChallenge }
		
	}
})
</script>

<style>

</style>