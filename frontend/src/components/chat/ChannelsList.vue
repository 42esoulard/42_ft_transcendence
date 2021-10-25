<template>
    <div>
      <h2>Joined channels</h2>
      <ul>
        <li v-for="(chan) in joinedChannels" :key="chan"> {{ chan.name }} </li>
      </ul>
    </div>

    <div>
      <h2>More channels you could join...</h2>
      <ul>
        <li v-for="(chan) in availableChannels" :key="chan"> {{ chan.name }} </li>
      </ul>
    </div>
</template>

<script>
import { ref, defineComponent, computed, onMounted } from "vue";
// import { Socket, io } from "socket.io-client"
// import { DefaultApi } from "@/../sdk/typescript-axios-client-generated";
// import { socket } from "./ChatComponent.vue"
// import { useStore } from 'vuex'
import { Channel } from "@/types/Channel"
 
export default defineComponent({
  name: 'ChannelsList',
  props: [ joinedChannels, availableChannels],
  // setup(props) {
  //   return {
  //     joinedChannels,
  //     availableChannels
  //   }
  // }
});

</script>

<style>

</style>