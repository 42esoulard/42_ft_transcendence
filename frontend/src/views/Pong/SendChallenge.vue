<template>

	<div>
		Challenging
	</div>

</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { pongSocket } from '@/App.vue'
import { useStore } from '@/store'

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

		const challenge = (id: number, name: string) => {
			// challenging.value = true
			// challengeStatus.value = 'challenge sent to ' + name + 'challenge request will automatically expire after 5 seconds'
			pongSocket.emit('challengeRequest', {
				challengerId: store.state.user.id, 
				challengerName: store.state.user.username, 
				challengeeId: id, 
				challengeeName: name,
				gameMode: 'transcendence'})
		}

		const cancelChallenge = () => {
			// challenging.value = false
			pongSocket.emit('cancelChallenge', store.state.user.id)
		}
		
		pongSocket.on('challengeDeclined', () => {
			// challengeStatus.value = 'challenge has been declined'
			console.log('challenge has been declined')
		})
		
	}
})
</script>

<style>

</style>