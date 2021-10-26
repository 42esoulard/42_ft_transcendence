<template>
  <h1>Chat Room</h1>
  <div class="container">
    <div class="col-lg-6 offset-lg-3">
      <div>
        <p v-for="(user, i) in info" :key="i">
          {{ user.username }} {{ user.action }}
        </p>
      </div>
      
      <ChannelsList :joinedChannels="joinedChannels" :availableChannels="availableChannels" />

      <h2>{{ user.username }}</h2>
      <div class="card bg-info">

        <div class="card-header text-white">
          <h4>
            <select class="selectRoom">
              <option v-for="(cm) in joinedChannels" :key="cm.channel.name" class="optionRoom" @click="switchRoom(cm)" :id="cm.channel.name" >{{ cm.channel.name }}</option>
            </select>
            <button class="createBtn" @click="newChannelForm = true">Create Channel</button>

            <button v-if="!isMemberOfActiveRoom()" class="joinBtn" @click="toggleRoomMembership()">Join room</button>
            <button v-else class="joinBtn" @click="toggleRoomMembership()">Leave room</button>
            <span class="float-right">{{ connections }} online</span>
          </h4>
        </div>

        <div class="messages-wrapper">
        <div>
        <ul class="list-group list-group-flush text-left messages" id="messages">
          <small v-if="typing" class="text-white">{{ typing }} is typing</small>
          <li class="list-group-item" v-for="(message) in channelMessages" :key="message.id">
            <span class="message">
              <div class="message-author">{{ message.author.username }}</div>: {{ message.content }}
            </span>
          </li>
        </ul>
        </div>
        </div>

        <div class="card-body">
          <form @submit.prevent="send">
            <div class="form-group">
              <input
                v-if="isMemberOfActiveRoom()"
                type="text"
                class="form-control"
                v-model="newMessage"
                placeholder="Enter message here"
              />
              <div v-else>
                <div class="form-control greyed-input">Join the room to send messages</div>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
    <div z-index="-1" v-if="newChannelForm" class="greyed-background" @click="newChannelForm = false"></div>
    <NewChannelForm z-index="-1" v-if="newChannelForm" :socket="socket" />

  </div>
  
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch, computed } from "vue";
import { io } from "socket.io-client";
import { Message } from "@/types/Message";
import { Channel } from "@/types/Channel"
import { ChannelMember } from "@/types/ChannelMember"
import NewChannelForm from "@/components/chat/NewChannelForm.vue"
import ChannelsList from "@/components/chat/ChannelsList.vue"
import { Info } from "@/types/Info";
import {  DefaultApi } from "@/../sdk/typescript-axios-client-generated";
import { useStore } from 'vuex';
import { useUserApi } from "@/plugins/api.plugin";

export const socket = io("http://localhost:3000/chat");

export const ChatComponent = defineComponent({
  name: "ChatComponent",
  components: { NewChannelForm, ChannelsList },
  
  beforePageLeave() {
    this.socket.emit("leave", 'a user');
  },
  beforeRouteLeave() {
    this.socket.emit("leave", 'a user');
  },

  setup() {

    const api = new DefaultApi();
    const userApi = useUserApi();
    const user = computed(() => useStore().state.user);
    const firstTimeConnect = computed(() => useStore().state.firstTimeConnect);

    const newMessage = ref("");
    const messageId = ref(0);

    const allMessages: {
        [key: number]: Array<Message>,
      } = {};
    const channelMessages = ref<Message[]>([]);
    
    const activeChannel = ref<ChannelMember>();
    const getDefaultChannel = async () => {
      await api.getChannelById(1)
      .then(async () => {
        await api.joinChannel(1, user.value.id)
        .then((res)=> {
          console.log(res)
          updateChannelsList();
          activeChannel.value = res.data;
          console.log("ACTIVECHANNEL", activeChannel)
          getMessagesUpdate(res.data.channel);
          return res;
        })
      })
    }
    getDefaultChannel();

    
    let newChannelForm = ref(false);

    const typing = ref("");
    const info = reactive<Info[]>([]);

    const connections = ref(1);

    /* INITIALIZE FROM DB + UPDATE (on logout? on fixed interval? on fixed nb of messages?):
        - channels:
          1) public joined channels
          2) private joined channels
          3) public non joined channels (aka available channels)
        - messages
    */

    let joinedChannels = ref<ChannelMember[]>([]);
    let availableChannels = ref<ChannelMember[]>([]);
    const allChannels = ref<ChannelMember[]>([]);

    const updateChannelsList = async () => {
      await api.getUserChannels(user.value.id)
      .then((res) => {
        joinedChannels.value = res.data;
        console.log("in  channels list", joinedChannels.value)
      })
      .catch((err) => { console.log("not found")})
    }
    updateChannelsList();


    const getMessagesUpdate = async (channel: Channel) => {
      await api.getChannelById(channel.id)
      .then((res) => {
        if (activeChannel.value!.channel.id === channel.id) {
          activeChannel.value!.channel = res.data
          channelMessages.value = res.data.messages;
        }
        return res;
      })
      
    }

    const isMemberOfActiveRoom = async () => {
      // await api.getChannelMember(1, 1) //REPLACE WITH GET CHANNEL ID, GET USER ID
      // .then(() => {

      // })
      return true;
    }

    const toggleRoomMembership = () => {
      // create/delete a channel-member entry in db
    }

  

    const selectActiveChannel = () => {
      console.log("IN SELECT ACITVE CHAN", activeChannel)
      const selectedRoom = document.getElementById(activeChannel.value!.channel.name)!;
      selectedRoom.setAttribute("selected", "true");
      // FIND A CLEANER SOLUTION TO WAIT FOR DOM ELEM TO BE CREATED
    }

    const switchRoom = async (info: ChannelMember) => {
        
      activeChannel.value = info;
      console.log("in switchroom", activeChannel)

      selectActiveChannel();
      getMessagesUpdate(activeChannel.value.channel);
    }

    window.onbeforeunload = () => {
      socket.emit("leave", user.value.username);
    };

    socket.on("chat-message", (data: any) => {
      console.log("RECEIVED CHAT MESSAGE, data:", data)
      getMessagesUpdate(data.channel);
    });

    socket.on("typing", (user: string) => {
      typing.value = user;
    });

    socket.on("stopTyping", () => {
      typing.value = "";
    });

    socket.on('createdRoom', async (cm: ChannelMember) => {
      newChannelForm.value = false;
      await updateChannelsList()
      .then(() => {
        switchRoom(cm);
      })
    })

    socket.on('addRoom', (info: Channel) => {
      updateChannelsList();
    })

    socket.on("join", (username: string, connectionsNb: number) => {
      info.push({
        username: username,
        action: "joined",
      });

      //updating connection nb for newcomer
      socket.emit("get-connections")

      setTimeout(() => {
        info.length = 0;
      }, 5000);
    });

    socket.on("leave", (user: string) => {
      info.push({
        username: user,
        action: "left",
      });

      setTimeout(() => {
        info.length = 0;
      }, 5000);
    });

    socket.on("connections", (data: number) => {
      connections.value = data;
    });

    watch(newMessage, (newMessage) => {
      newMessage
        ? socket.emit("typing", user.value.username)
        : socket.emit("stopTyping");
    });

    const send = async () => {
      
      if (!newMessage.value)
        return;
      const newContent = {
        content: newMessage.value,
        author: user.value.username,
        author_id: user.value.id,
        channel: activeChannel.value!.channel,
        channel_id: activeChannel.value!.channel.id,
        id: messageId.value,
        created_at: Date.now().toString(),
      }

      newMessage.value = "";
      messageId.value++;

      await api.saveMessage({
          channel_id: newContent.channel_id,
          author_id: newContent.author_id, 
          content: newContent.content,
      })
      .then(() => { 
        getMessagesUpdate(newContent.channel); 
        socket.emit("chat-message", newContent); 
      })
      .catch((err: any) => console.log(err.message));
    }

    const addUser = () => {
      socket.emit("join", user.value.username);
    }

    return {
      socket,
      
      send,
      newMessage,
      channelMessages,
      getMessagesUpdate,
      typing,

      addUser,
      user,
      info,
      connections,

      joinedChannels,
      availableChannels,
      allChannels,
      activeChannel,
      switchRoom,
      newChannelForm,
      toggleRoomMembership,
      isMemberOfActiveRoom,
    };
  },
});

export default ChatComponent;
</script>

<style>

.message {
  color: black;
}
.message-author {
  width: 6em;
  display: inline-block;
  overflow:scroll;
  padding: 0;
  margin: 0;
  text-align: center;
}
.messages-wrapper {
  height: 300px;
  overflow-x:auto; 
  display:flex; 
  flex-direction:column-reverse;
}
/* .messages {
  overflow-y: scroll;
} */
.selectRoom {
  padding-top: 5px;
  border-radius: 10px;
  font-size: 20px;
}
.joinBtn, .createBtn {
  font-size: 18px;
  margin-left:10px;
}

.optionRoom.active {
  color:aliceblue;
  background: blue;  
}

.greyed-input {
  background-color: gray;
  font-style: italic;
}

.greyed-background {
  background-color: rgba(138, 138, 138, 0.424);
  position: absolute;
  width: 100%;
  height: 100%;
  top:0;
  left:0;
}
</style>

