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
              <option v-for="(value, room) in rooms" :key="room" class="optionRoom" @click="activeRoom = room" :id="room" >{{ room }}</option>
              <!-- <option class="optionRoom" @click="activeRoom = 'general'" :class="{ active: activeRoom === 'general'}" >General</option>
              <option class="optionRoom" @click="activeRoom = 'random'" :class="{ active: activeRoom === 'random'}">Random</option>
              <option class="optionRoom" @click="activeRoom = 'cat pics'" :class="{ active: activeRoom === 'cat pics'}">Cat Pics</option> -->
              <option class="optionRoom" @click="createRoom()">+</option>
              
              <!-- <button class="tab-btn" @click="activeRoom = 'general'" :class="{ active: activeRoom === 'general'}" >General</button>
              <button class="join-btn" @click="toggleRoomMembership()">+</button>
              <button class="tab-btn" @click="activeRoom = 'random'" :class="{ active: activeRoom === 'random'}">Random</button>
              <button class="join-btn" @click="toggleRoomMembership()">+</button>
              <button class="tab-btn" @click="activeRoom = 'cat pics'" :class="{ active: activeRoom === 'cat pics'}">Cat Pics</button>
              <button class="join-btn" @click="toggleRoomMembership()">+</button> -->
            </select>
            <button v-if="!isMemberOfActiveRoom()" class="joinBtn" @click="toggleRoomMembership()">Join room</button>
            <button v-else class="joinBtn" @click="toggleRoomMembership()">Leave room</button>
            <span class="float-right">{{ connections }} online</span>
          </h4>
        </div>
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
                <div class="form-control greyed">Join the room to send messages</div>
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
import { Info } from "@/types/Info";

const socket = io("http://localhost:3000");

export default defineComponent({
  name: "Chat",
  components: {},
  
  beforePageLeave() {
    console.log("beforePageLeave");
    socket.emit("leave", 'a user');
  },
  beforeRouteLeave() {
    console.log("beforeRouteLeave");
    socket.emit("leave", 'a user');
  },

  setup() {
    const newMessage = ref("");
    const messages = reactive<Message[]>([]);
    const typing = ref("");
    const username = ref("");
    const ready = ref(false);
    const info = reactive<Info[]>([]);
    const connections = ref(1);
    const activeRoom = ref("general");

    /* INITIALIZE FROM DB:
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
      // console.log('IN VUE ISACTIVEROOM: activeRoom', activeRoom, rooms[activeRoom.value])
      return rooms[activeRoom.value];
    }

    const toggleRoomMembership = () => {
      console.log('toggling room')
      if (isMemberOfActiveRoom()) {
        socket.emit('leaveRoom', activeRoom);
      } else {
        socket.emit('joinRoom', activeRoom);
      }
    }

    const selectActiveRoom = () => {
      console.log('IN SELECT ACTIVE', activeRoom.value)
      setTimeout(() => { const selectedRoom = document.getElementById(activeRoom.value)!;
      selectedRoom.setAttribute("selected", "true");}, 0);
      //FIND A CLEANER SOLUTION TO WAIT FOR DOM ELEM TO BE CREATED
    }

    const switchRoom = (newRoom: string) => {
      activeRoom.value = newRoom;
      selectActiveRoom();
      console.log('switchroom to', activeRoom)
    }

    const createRoom = () => {
      const newRoom = prompt("Name of the new channel:");
      console.log('CREATE ROOM ', newRoom)
      socket.emit('createRoom', {
        user: username.value, 
        room: newRoom });
    }

    window.onbeforeunload = () => {
      console.log("onbeforeunload");
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

    socket.on("joinedRoom", () => {
      rooms[activeRoom.value] = true;
      console.log('IN VUE JOINED ROOM: activeRoom', activeRoom, rooms[activeRoom.value])
    });

    socket.on("leftRoom", () => {
      rooms[activeRoom.value] = false;
    });

    socket.on('createdRoom', (newRoom: string) => {
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
      console.log('CREATEDROOM ', newRoom)
    })

    socket.on('addRoom', (newRoom: string) => {
      rooms[newRoom] = false;
      console.log('addedROOM ', newRoom)
    })

    socket.on("join", (user: string) => {
      activeRoom.value = 'general';
      info.push({
        username: user,
        action: "joined",
      });

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
        ? socket.emit("typing", username.value)
        : socket.emit("stopTyping");
    });

    const send = () => {
      
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
      newMessage.value = "";
    }

    const addUser = () => {
      ready.value = true;
      socket.emit("join", username.value);
    }

    return {
      addUser,
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
      toggleRoomMembership,
      isMemberOfActiveRoom,
      createRoom,
      roomMessages
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

.greyed {
  background-color: gray;
  font-style: italic;
}
</style>
