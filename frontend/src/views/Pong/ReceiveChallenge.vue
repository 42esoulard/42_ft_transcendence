<template>
	
	<div class="header__title">
		You have been challenged by {{ challengerName }}
	</div>
	<div>
		<button class="button" v-on:click="accept()"> accept </button>
		<button class="button" v-on:click="refuse()"> refuse </button>
	</div>
	
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { pongSocket } from '@/App.vue'
import { useRouter } from "vue-router";

export default defineComponent ({
	props: {
		challengerId: {type: String, required: true},
		challengerName: {type: String, required: true},
	},
	inheritAttrs: false, // we dont need it, and not setting it to false a warning: "extraneous non prop attributes (authorized) were passed to component but could not be automatically inherited..."

	setup(props) {
		const router = useRouter()
		
		const accept = () => {
			console.log(props.challengerId)
			pongSocket.emit('challengeAccepted', Number(props.challengerId))
		}
		const refuse = () => {
			pongSocket.emit('challengeDeclined', Number(props.challengerId))
			router.push({name: 'Pong'})
		}
		
		pongSocket.on('challengeCancelled', (challengerId: number) => {
			// if (challengeMessage && challengeMessage.value?.challengerId)
			// {
			// 	challenged.value = false
			// 	challengeMessage.value = undefined
			// }
			// if (challenging && challengerId === store.state.user.id)
			// {
			// 	challenging.value = false
			// }
		})

		return {accept, refuse}
	}

})
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>
