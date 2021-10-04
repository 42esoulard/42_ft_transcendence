
<template>
	<h1> Select a game to play </h1>
	<div v-for="game in games" :key="game.id">
    <router-link :to="{ name: 'PongGame', params: {id: game.id} }" > {{game.p1}} vs {{game.p2}} </router-link>
	</div>
</template>

<script>
export default {
	data() {
		return {
			games: [
				{id: 1, p1: "loup", p2: "pie"},
				{id: 2, p1: "chat", p2: "lotte"},
				{id: 3, p1: "merlu", p2: "merle"}
			]
		}
	}
}
</script>

<style>

</style>