<template>
  <h1>Chat Room</h1>
  <div class="container">
    <div class="col-lg-6 offset-lg-3">
      <div>
        <p v-for="(user, i) in info" :key="i">
          {{ user.username }} {{ user.action }}
        </p>
      </div>

      <!-- <div v-if="!ready">
        <h4>Enter your username</h4>
        <form @submit.prevent="addUser">
          <div class="form-group row">
            <input
              type="text"
              class="form-control col-9"
              v-model="username"
              placeholder="Enter username here"
            />
            <input
              type="submit"
              value="Join"
              class="btn btn-sm btn-info ml-1"
            />
          </div>
        </form>
      </div> -->
      
      <!-- <h2 v-else>{{ username }}</h2> -->
      <!-- <ChannelsList :joinedChannels="joinedChannels" :availableChannels="availableChannels" /> -->

      <h2>{{ user.username }}</h2>
      <div class="card bg-info">

        <div class="card-header text-white">
          <h4>
            <select class="selectRoom">
              <option v-for="(chan) in joinedChannels" :key="chan.name" class="optionRoom" @click="switchRoom(chan)" :id="chan.name" >{{ chan.name }}</option>
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
import NewChannelForm from "@/components/chat/NewChannelForm.vue"
import ChannelsList from "@/components/chat/ChannelsList.vue"
import { Info } from "@/types/Info";
import { DefaultApi } from "@/../sdk/typescript-axios-client-generated";
import { useStore } from 'vuex';
import { useUserApi } from "@/plugins/api.plugin";

export const socket = io("http://localhost:3000/chat");

export const ChatComponent = defineComponent({
  name: "ChatComponent",
  components: { NewChannelForm },
  
  beforePageLeave() {
    // console.log("beforePageLeave");
    this.socket.emit("leave", 'a user');
  },
  beforeRouteLeave() {
    // console.log("beforeRouteLeave");
    this.socket.emit("leave", 'a user');
  },

  setup() {

    const api = new DefaultApi();
    const userApi = useUserApi();
    const user = computed(() => useStore().state.user);

    const newMessage = ref("");
    const messageId = ref(0);

    const allMessages: {
        [key: number]: Array<Message>,
      } = {};
    const channelMessages = ref<Message[]>([]);
    
    const activeChannel = ref<Channel>();
    const getDefaultChannel = async (id: number) => {
      await api.getChannelById(1)
      .then((res) => {
        api.joinChannel(1, user.value.id)
        .then(()=> {
          updateChannelsList();
          // activeChannel.value = res.data;
          // getMessagesUpdate(res.data);
          return res;
        })
        
      })
    }
    getDefaultChannel(0);
    

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

    // let channels = api.getChannelsByMember(1) //API GET CURRENT USER ID
    let joinedChannels = ref<Channel[]>([]);
    let availableChannels = ref<Channel[]>([]);
    const allChannels = ref<Channel[]>([]);

    //This gets all channels (temporary before adding channel-members db table and fetching
    // joined + joinable (public) channels)
    const updateChannelsList = async () => {
      await api.getUserChannels(user.value.id)
      .then((res) => {
        // joinedChannels.value = res.data.channels;
        console.log("in  channels list", res.data)
      })
      .catch((err) => { console.log("not found")})
    }
    updateChannelsList();


    const getMessagesUpdate = async (channel: Channel) => {
      await api.getChannelById(channel.id)
      .then((res) => {
        if (activeChannel.value!.id === channel.id) {
          // activeChannel.value = res.data
          // channelMessages.value = res.data.messages
        }
        // console.log("in room messages", channelMessages.value)
        return res;
      })
      
      // if (!allMessages[channel.id]) {
      //   await api.getChannelMessages(channel.id)
      //   .then((res) => {
      //     allMessages[channel.id] = [];
      //     res.data.forEach(item => {
      //       console.log(item)
      //       console.log(item.channel_id)
      //       allMessages[channel.id].push({
      //         content: item.content,
      //         author_id: item.author_id,
      //         author: item.author_id.toString(), //TEMPORARY, MUST FETCH USERNAME STORE NAME
      //         channel_id: channel.id,
      //         channel: channel.name,
      //         id: item.id,
      //       })
      //       messageId.value = item.id + 1;
      //     })
      //   })
      // }
      // channelMessages.value = allMessages[activeChannel.value!.id];
      // var scroll = document.getElementById('messages')!;
      // scroll.scrollTop = scroll.scrollHeight;
      // scroll.animate({scrollTop: scroll.scrollHeight});
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
      setTimeout(() => { const selectedRoom = document.getElementById(activeChannel.value!.name)!;
      selectedRoom.setAttribute("selected", "true");}, 1000);
      // FIND A CLEANER SOLUTION TO WAIT FOR DOM ELEM TO BE CREATED
    }

    const switchRoom = (info: Channel) => {
      activeChannel.value = info;
      selectActiveChannel();
      getMessagesUpdate(activeChannel.value);
    }

    // const createRoom = () => {
    //   // activates form component: 
    //   // newChannelForm.value = true;
    //   // once form component is validated, it shuts and calls api to 
    //   // save the new channel and the new channel_member (with current user
    //   // as admin)
    // }

    window.onbeforeunload = () => {
      socket.emit("leave", user.value.username);
    };

    socket.on("chat-message", (data: any) => {
      console.log("RECEIVED CHAT MESSAGE, data:", data)
      getMessagesUpdate(data.channel);
      // console.log("in chat message: data", data)
      // if (!allMessages[data.channel_id])
      //   getMessagesUpdate({ name: data.channel, id: data.channel_id, type: ''});
      // // if (allMessages[data.channel_id])
      // allMessages[data.channel_id].push(data);
      // else {}
      // getMessagesUpdate();
    });

    socket.on("typing", (user: string) => {
      typing.value = user;
    });

    socket.on("stopTyping", () => {
      typing.value = "";
    });

    socket.on('createdRoom', async (info: Channel) => {
      newChannelForm.value = false;
      // await api.getChannels()
      // .then((res) => {
      //   allChannels.value = res.data;
      await updateChannelsList()
      .then(() => {
        switchRoom(info);
      })
        
        // newMessage.value = `${username.value} has created the [${info.name}] channel`;
        // send();
      // })
   
      // MUST ADD MESSAGE TO DB
    })

    socket.on('addRoom', (info: Channel) => {
      updateChannelsList();
    })

    socket.on("join", (username: string, connectionsNb: number) => {
      info.push({
        username: username,
        action: "joined",
      });
      // user.value = useStore().state.user;

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
      // console.log("in connections", data)
      connections.value = data;
    });

    watch(newMessage, (newMessage) => {
      newMessage
        ? socket.emit("typing", user.value.username)
        : socket.emit("stopTyping");
    });

    const send = async () => {
      
      // console.log('SENDING MSG: is member?', isMemberOfActiveRoom())
      // check if user is member of active room
      // if (isMemberOfActiveRoom()) {
      if (!newMessage.value)
        return;

      const newContent = {
        content: newMessage.value,
        author: user.value.username,
        author_id: user.value.id,
        channel: activeChannel.value!,
        channel_id: activeChannel.value!.id,
        id: messageId.value,
        created_at: Date.now().toString(),
      }

      // console.log(newContent)

      newMessage.value = "";
      messageId.value++;
      // console.log(activeChannel)
      

      // if (!allMessages[activeChannel.value!.id])
      //   allMessages[activeChannel.value!.id] = [];
      // allMessages[activeChannel.value!.id].push(newContent);
      // console.log("IN VUE ALLMESSAGES ", allMessages);
      // getMessagesUpdate(activeChannel.value!);

      // } else {
      //   alert('You must join the room to send messages!')
      // } 

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
      addUser,

      socket,
      
      send,
      newMessage,
      channelMessages,
      typing,
      user,
      info,
      connections,

      getMessagesUpdate,
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

