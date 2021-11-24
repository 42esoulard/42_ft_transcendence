<template>
	
	<div>
		You have been challenged by {{ challengerName }}
		<button v-on:click="accept()"> accept </button>
		<button v-on:click="refuse()"> refuse </button>
	</div>
	
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { pongSocket } from '@/App.vue'

export default defineComponent ({
	props: {
		challengerId: {type: String, required: true},
		challengerName: {type: String, required: true},
	},

	setup(props) {
		const accept = () => {
			console.log(props.challengerId)
			pongSocket.emit('challengeAccepted', Number(props.challengerId))
		}
		const refuse = () => {
			pongSocket.emit('challengeDeclined', Number(props.challengerId))
		}

		return {accept, refuse}
	}

})
</script>

<style>

</style>