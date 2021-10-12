<template>
  <h1>Chat Room</h1>
  <div class="container">
    <div class="col-lg-6 offset-lg-3">
      <div v-if="ready">
        <p v-for="(user, i) in info" :key="i">
          {{ user.username }} {{ user.action }}
        </p>
      </div>

      <div v-if="!ready">
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
      </div>
      
      <h2 v-else>{{ username }}</h2>
      <div class="card bg-info" v-if="ready">

        <div class="card-header text-white">
          <h4>
            <select class="selectRoom">
              <option v-for="(chan) in allChannels" :key="chan.name" class="optionRoom" @click="switchRoom(chan)" :id="chan.name" >{{ chan.name }}</option>
            </select>
            <button class="createBtn" @click="newChannelForm = true">Create Channel</button>

            <button v-if="!isMemberOfActiveRoom()" class="joinBtn" @click="toggleRoomMembership()">Join room</button>
            <button v-else class="joinBtn" @click="toggleRoomMembership()">Leave room</button>
            <span class="float-right">{{ connections }} online</span>
          </h4>
        </div>

        <ul class="list-group list-group-flush text-right">
          <small v-if="typing" class="text-white">{{ typing }} is typing</small>
          <li class="list-group-item" v-for="(message) in channelMessages" :key="message.id">
            <span>
              {{ message.content }}
              <small>:{{ message.author }}</small>
            </span>
          </li>
        </ul>

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
import { computed, defineComponent, onMounted, onUpdated, reactive, ref, watch } from "vue";
import { io } from "socket.io-client";
import { Message } from "@/types/Message";
import { Channel } from "@/types/Channel"
import NewChannelForm from "@/components/NewChannelForm.vue"
import { Info } from "@/types/Info";
import { DefaultApi } from "@/../sdk/typescript-axios-client-generated";


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
    // const socket = ref(io("http://localhost:3000/chat"));
    const newMessage = ref("");
    const allMessages: {
        [key: number]: Array<Message>,
      } = {};
    const channelMessages = ref<Message[]>([]);
    const typing = ref("");
    const username = ref("");
    const ready = ref(false);
    const info = reactive<Info[]>([]);
    const connections = ref(1);
    const activeChannel = ref<Channel>({
      name: "General",
      type: "public",
      id: 1
    });
    const messageId = ref(0);
    const responseData = ref(null);
    let newChannelForm = ref(false);

    /* INITIALIZE FROM DB + UPDATE (on logout? on fixed interval? on fixed nb of messages?):
        - channels:
          1) public joined channels
          2) private joined channels
          3) public non joined channels (aka available channels)
        - messages
    */

    // let channels = api.getChannelsByMember(1) //API GET CURRENT USER ID
    let joinedChannels = reactive<Channel[]>([]);
    let availableChannels = reactive<Channel[]>([]);
    const allChannels = ref<Channel[]>([]);

    //This gets all channels (temporary before adding channel-members db table and fetching
    // joined + joinable (public) channels)
    const updateChannelsList = async () => {
      await api.getChannels()
      .then((res) => {
        console.log(res.data)
        allChannels.value = res.data;
      })
    }
    updateChannelsList();

    const roomMessages = async () => {
      if (!allMessages[activeChannel.value.id]) {
        await api.getChannelMessages(activeChannel.value.id)
        .then((res) => {
          allMessages[activeChannel.value.id] = [];
          res.data.forEach(item => {
            console.log(item)
            console.log(item.channel_id)
            allMessages[activeChannel.value.id].push({
              content: item.content,
              author_id: item.author_id,
              author: item.author_id.toString(), //TEMPORARY, MUST FETCH USERNAME STORE NAME
              channel_id: activeChannel.value.id,
              channel: activeChannel.value.name,
              id: item.id,
            })
            messageId.value = item.id + 1;
          })
        })
      }
      channelMessages.value = allMessages[activeChannel.value.id];
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
      setTimeout(() => { const selectedRoom = document.getElementById(activeChannel.value.name)!;
      selectedRoom.setAttribute("selected", "true");}, 1000);
      // FIND A CLEANER SOLUTION TO WAIT FOR DOM ELEM TO BE CREATED
    }

    const switchRoom = (info: Channel) => {
      activeChannel.value = info;
      selectActiveChannel();
      roomMessages();
    }

    const createRoom = () => {
      // activates form component: 
      newChannelForm.value = true;
      // once form component is validated, it shuts and calls api to 
      // save the new channel and the new channel_member (with current user
      // as admin)
    }

    window.onbeforeunload = () => {
      socket.emit("leave", username.value);
    };

    socket.on("chat-message", (data: any) => {

      if (allMessages[data.channel_id])
        allMessages[data.channel_id].push(data);
      roomMessages();
    });

    socket.on("typing", (user: string) => {
      typing.value = user;
    });

    socket.on("stopTyping", () => {
      typing.value = "";
    });

    socket.on('createdRoom', async (info: Channel) => {
      newChannelForm.value = false;
      await api.getChannels()
      .then((res) => {
        allChannels.value = res.data;
        switchRoom(info);
        // newMessage.value = `${username.value} has created the [${info.name}] channel`;
        // send();
      })
   
      // MUST ADD MESSAGE TO DB
    })

    socket.on('addRoom', (info: Channel) => {
      updateChannelsList();
    })

    socket.on("join", (user: string, connectionsNb: number) => {
      info.push({
        username: user,
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
      // console.log("in connections", data)
      connections.value = data;
    });

    watch(newMessage, (newMessage) => {
      newMessage
        ? socket.emit("typing", username.value)
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
        author: username.value,
        author_id: 1234,//get user id
        channel: activeChannel.value.name,
        channel_id: activeChannel.value.id,
        id: messageId.value,
      }

      newMessage.value = "";
      messageId.value++;

      if (!allMessages[activeChannel.value.id])
        allMessages[activeChannel.value.id] = [];
      allMessages[activeChannel.value.id].push(newContent);
      roomMessages();

      socket.emit("chat-message", newContent)
      // } else {
      //   alert('You must join the room to send messages!')
      // }

      await api.saveMessage({
          channel_id: newContent.channel_id,
          author_id: newContent.author_id, // GET LOGGED IN USER ID
          content: newContent.content,
      })
      .then((res: any) => (responseData.value = res.data))
      .catch((err: any) => console.log(err.message));
    }

    const addUser = () => {
      ready.value = true;
      socket.emit("join", username.value);
    }

    return {
      addUser,

      socket,
      
      send,
      newMessage,
      channelMessages,
      typing,
      username,
      ready,
      info,
      connections,

      roomMessages,
      joinedChannels,
      allChannels,
      activeChannel,
      switchRoom,
      newChannelForm,
      toggleRoomMembership,
      isMemberOfActiveRoom,
      createRoom
    };
  },
});

export default ChatComponent;
</script>

<style>
#messages {
  height: 300px;
  overflow-y: scroll;
}
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

