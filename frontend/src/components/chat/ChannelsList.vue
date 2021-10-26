<template>
    <div>
      <h2>Joined channels</h2>
      <ul>
        <li v-for="(cm) in joinedChannels" :key="cm.channel.name"> {{ cm.channel.name }} </li>
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
import { ChannelMember } from "@/types/ChannelMember"
 
export default defineComponent({
  name: 'ChannelsList',
  props: [ 'joinedChannels',
        'availableChannels'],
});

</script>

<style>

</style>