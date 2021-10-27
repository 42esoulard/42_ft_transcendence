<template>
  <div class="channelsListContainer">
    <div>
      <div class='title'>Joined channels</div>
      <ul class='channelsList'>
        <li v-for="(cm) in joinedChannels" :key="cm.channel.name"> 
          <button class='button' @click="switchChannel(cm)"> {{ cm.channel.name }} </button>
        </li>
      </ul>
    </div>

    <div>
      <div class='title'>More channels</div>
      <ul class='channelsList'>
        <li v-for="(chan) in availableChannels" :key="chan.name"> 
          <button class='button'> {{ chan.name }} </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, defineComponent, computed, onMounted } from "vue";
import { ChannelMember } from "@/types/ChannelMember"
 
export default defineComponent({
  name: 'ChannelsList',
  props: [ 'joinedChannels',
        'availableChannels'],
  methods: {
    switchChannel(cm){
        this.$parent.switchChannel(cm);
    }
  },
  // setup(props) {
  //   // console.log("in list avail", availableChannels)
  // }
});

</script>

<style>
.channelsListContainer {
  background-color: rgba(12, 12, 12, 0.651);
  color: gainsboro;
  height: 100%;
  width: 20%;
  overflow-x:auto; 
}
.title {
  background-color:black;
  padding: 20px;
}
.channelsList {
  list-style-type: none;
  padding: 0;
}
</style>