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

/* .channels-list-container {
  padding-top:30px;
  padding-bottom:30px;
  background-color: rgba(12, 12, 12, 0.651);
  color: gainsboro;
  height: 100%;
  min-width: 140px;
  overflow-x:auto;
} */
/* .title {
  background-color:black;
  padding: 20px;
  white-space: nowrap;
  text-align: center;
  text-decoration-line:overline underline;
  //font-size: 1.1em; 
  font-weight: bold;
} 
/* .create-btn {
  white-space: nowrap;
  width: 100%;
  padding: 20px;
  background-color:rgba(0, 0, 0, 0.609);
  color: gainsboro;
  border-style:double;
} */
/* .create-btn:hover {
  width: 100%;
  background-color:rgba(218, 218, 218, 0.384);
  color: rgb(0, 0, 0);
  transition: 150ms;
} */

/* .channels-list {
  list-style-type: none;
  padding: 0;
} */
/* .channel-btn {
  width: 100%;
  background-color:rgba(0, 0, 0, 0.609);
  color: gainsboro;
  border-style: none;
  padding: 5px 10px;
  text-align: left;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.channel-btn:hover, .channel-btn:focus {
  width: 100%;
  background-color:rgba(218, 218, 218, 0.384);
  color: rgb(0, 0, 0);
  border-style: none;
  transition: 150ms;
} */

</style>