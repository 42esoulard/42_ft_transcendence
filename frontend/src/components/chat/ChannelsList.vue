<template>
  <div class="chat-channels">
    <button class="chat-channels__create" @click="toggleChannelForm()">Create Channel</button>
    <div>
      <div class='chat-channels__title'>Joined channels</div>
      <ul class='chat-channels__list'>
        <li v-for="(cm) in joinedChannels" :key="cm.channel.name"> 
          <button class='chat-channels__item' @click="switchChannel(cm)">
            <div class='chat-channels__name'># {{ cm.channel.name }}</div>
            <div>
              <span v-if="cm.is_owner"><img class="fas fa-user-tie chat-channels__tag chat-channels__tag--owner" title="Channel Owner'"/></span>
              <span v-if="cm.is_admin"><img class="fas fa-user-shield chat-channels__tag chat-channels__tag--admin" title="Channel Admin"/></span>
            </div>
          </button>
        </li>
      </ul>
    </div>

    <div>
      <div class='chat-channels__title'>More channels</div>
      <ul class='chat-channels__list'>
        <li v-for="(chan) in availableChannels" :key="chan.name"> 
          <button class='chat-channels__item' @click="previewChannel(chan)"> # {{ chan.name }} </button>
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
    },
    previewChannel(chan){
        this.$parent.previewChannel(chan);
    },
    toggleChannelForm(){
        this.$parent.toggleChannelForm();
    }
  },
  // setup(props) {
  //   // console.log("in list avail", availableChannels)
  // }
});

</script>

<style lang="scss">
  @import "../../../sass/main.scss";
</style>