<template>

	<div v-for="challenger in challenges" :key="challenger">	
		<div class="header__title">
			You have been challenged by {{ challenger }}
		</div>
		<div>
			<button class="button" v-on:click="accept(challenger)"> accept </button>
			<button class="button" v-on:click="refuse(challenger)"> refuse </button>
		</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { pongSocket } from '@/App.vue'
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { store } from "@/store";

export default defineComponent ({
	props: {
		challengerName: {type: String, required: true},
	},
	inheritAttrs: false, // we dont need it, and not setting it to false a warning: "extraneous non prop attributes (authorized) were passed to component but could not be automatically inherited..."

	setup(props) {
		const router = useRouter()
		
		const accept = (challengerName: string) => {
			store.commit('removeChallenge', challengerName)
			pongSocket.emit('challengeAccepted', challengerName)
		}
		const refuse = (challengerName: string) => {
			store.commit('removeChallenge', challengerName)
			pongSocket.emit('challengeDeclined', challengerName)
		}
		
		pongSocket.on('challengeCancelled', (challengerName: string) => {
			store.commit('removeChallenge', challengerName)
		})

		onBeforeRouteLeave(() => {
			pongSocket.off('challengeCancelled')
		})

		return {accept, refuse,
      challenges: computed(() => store.state.challengesReceived),}
	}

})
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>
