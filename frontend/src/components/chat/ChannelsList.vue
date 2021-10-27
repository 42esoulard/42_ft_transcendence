<template>
  <div class="channels-list-container">
    <button class="create-btn" @click="toggleChannelForm()">Create Channel</button>
    <div>
      <div class='title'>Joined channels</div>
      <ul class='channels-list'>
        <li v-for="(cm) in joinedChannels" :key="cm.channel.name"> 
          <button class='channel-btn' @click="switchChannel(cm)"> # {{ cm.channel.name }} 
            <div>
              <img v-if="cm.is_owner" class="upload-icon fas fa-user-tie owner-tag" title="Channel Owner'"/>
              <img v-if="cm.is_admin" class="upload-icon fas fa-user-shield admin-tag" title="Channel Admin"/>
            </div>
          </button>
        </li>
      </ul>
    </div>

    <div>
      <div class='title'>More channels</div>
      <ul class='channels-list'>
        <li v-for="(chan) in availableChannels" :key="chan.name"> 
          <button class='channel-btn' @click="joinChannel(chan)"> # {{ chan.name }} </button>
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
    joinChannel(chan){
        this.$parent.joinChannel(chan);
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

<style>
.channels-list-container {
  padding-top:30px;
  padding-bottom:30px;
  background-color: rgba(12, 12, 12, 0.651);
  color: gainsboro;
  height: 100%;
  min-width: 140px;
  overflow-x:auto;
}
.title {
  background-color:black;
  padding: 20px;
  white-space: nowrap;
  text-align: center;
  text-decoration-line:overline underline;
  /* font-size: 1.1em; */
  font-weight: bold;
}
.create-btn {
  white-space: nowrap;
  width: 100%;
  padding: 20px;
  background-color:rgba(0, 0, 0, 0.609);
  color: gainsboro;
  border-style:double;
}
.create-btn:hover {
  width: 100%;
  background-color:rgba(218, 218, 218, 0.384);
  color: rgb(0, 0, 0);
  transition: 150ms;
}

.channels-list {
  list-style-type: none;
  padding: 0;
}
.channel-btn {
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
}

</style>