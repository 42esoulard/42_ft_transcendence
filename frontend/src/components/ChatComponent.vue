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
        <div v-if="newChannelForm" class="greyed-background" @click="newChannelForm = false"></div>

        <div class="card-header text-white">
          <h4>
            <select class="selectRoom">
              <option v-for="(value, room) in rooms" :key="room" class="optionRoom" @click="activeRoom = room" :id="room" >{{ room }}</option>
              <option class="optionRoom" @click="newChannelForm = true">+</option>
            </select>
            <button v-if="!isMemberOfActiveRoom()" class="joinBtn" @click="toggleRoomMembership()">Join room</button>
            <button v-else class="joinBtn" @click="toggleRoomMembership()">Leave room</button>
            <span class="float-right">{{ connections }} online</span>
          </h4>
        </div>

        <NewChannelForm v-if="newChannelForm" />

        <ul class="list-group list-group-flush text-right">
          <small v-if="typing" class="text-white">{{ typing }} is typing</small>
          <li class="list-group-item" v-for="(message, i) in roomMessages()" :key="i">
            <span :class="{ 'float-left': message.type === 1 }">
              {{ message.message }}
              <small>:{{ message.user }}</small>
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
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUpdated, reactive, ref, watch } from "vue";
import { io } from "socket.io-client";
import { Message } from "@/types/Message";
import NewChannelForm from "@/components/NewChannelForm.vue"
import { Info } from "@/types/Info";
import { DefaultApi } from "@/../sdk/typescript-axios-client-generated";

export default defineComponent({
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
    const socket = io("http://localhost:3000/chat");
    const newMessage = ref("");
    const messages = reactive<Message[]>([]);
    const typing = ref("");
    const username = ref("");
    const ready = ref(false);
    const info = reactive<Info[]>([]);
    const connections = ref(1);
    const activeRoom = ref("general");
    const responseData = ref(null);
    let newChannelForm = ref(false);

    /* INITIALIZE FROM DB + UPDATE (on logout? on fixed interval? on fixed nb of messages?):
        - rooms
        - messages
    */

    const rooms: { [key: string]: boolean } = reactive({
      "general": true,
      "random": false,
      "catPics": false
    })

    const roomMessages = () => {
      return messages.filter(msg => msg.room === activeRoom.value)
    }

    const isMemberOfActiveRoom = () => {

      return rooms[activeRoom.value];
    }

    const toggleRoomMembership = () => {

      if (isMemberOfActiveRoom()) {
        socket.emit('leaveRoom', activeRoom);
      } else {
        socket.emit('joinRoom', activeRoom);
      }
      rooms[activeRoom.value] = !rooms[activeRoom.value];
    }

    const selectActiveRoom = () => {

      setTimeout(() => { const selectedRoom = document.getElementById(activeRoom.value)!;
      selectedRoom.setAttribute("selected", "true");}, 0);
      //FIND A CLEANER SOLUTION TO WAIT FOR DOM ELEM TO BE CREATED
    }

    const switchRoom = (newRoom: string) => {
      activeRoom.value = newRoom;
      selectActiveRoom();
    }

    const createRoom = () => {
      console.log("in create room")
      /* add form component here:

        - Name? [check it doesn't exist yet in db]
        - Type [radio buttons]: public? Private (newcomers must be invited by a member)?
        password-protected (newcomers can join provided they know the room password)?
        - If password-protected: [check regex OK, check password match]
          1) please enter a password for the room (a-zA-Z0-9/*-+_):
          2) please re-enter the password:
          
      */
      newChannelForm.value = true;
      console.log(newChannelForm);
    }

    window.onbeforeunload = () => {
      socket.emit("leave", username.value);
    };

    socket.on("chat-message", (data: any) => {
      
      messages.push({
        message: data.message,
        type: 1,
        user: data.user,
        room: data.room
      });
    });

    socket.on("typing", (user: string) => {
      typing.value = user;
    });

    socket.on("stopTyping", () => {
      typing.value = "";
    });

    socket.on('createdRoom', (newRoom: string) => {
      newChannelForm.value = false;

      rooms[newRoom] = true;
      activeRoom.value = newRoom;
      messages.push({
          message: `${username.value} has created the [${newRoom}] channel`,
          type: 0,
          user: username.value,
          room: activeRoom.value
        });

        socket.emit("chat-message", {
          user: username.value,
          message: `${username.value} has created the [${newRoom}] channel`,
          room: activeRoom.value
        })
      selectActiveRoom();
      // console.log('CREATEDROOM ', newRoom)
    })

    socket.on('addRoom', (newRoom: string) => {
      rooms[newRoom] = false;
      // console.log('addedROOM ', newRoom)
    })

    socket.on("join", (user: string, connectionsNb: number) => {
      activeRoom.value = 'general';
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
      //check if user is member of active room
      if (isMemberOfActiveRoom()) {
      
        messages.push({
          message: newMessage.value,
          type: 0,
          user: "Me",
          room: activeRoom.value
        });

        socket.emit("chat-message", {
          user: username.value,
          message: newMessage.value,
          room: activeRoom.value
        })
      } else {
        alert('You must join the room to send messages!')
      }

      await api.saveMessage({
          channelId: 1234, // GET CHANNEL ID
          authorId: 1234, // GET LOGGED IN USER ID
          content: newMessage.value,
      })
      .then((res: any) => (responseData.value = res.data))
      .catch((err: any) => console.log(err.message));
      
      newMessage.value = "";
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
      messages,
      typing,
      username,
      ready,
      info,
      connections,

      rooms,
      activeRoom,
      switchRoom,
      newChannelForm,
      toggleRoomMembership,
      isMemberOfActiveRoom,
      createRoom,
      roomMessages,
    };
  },
});
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
.joinBtn {
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
}
</style>
