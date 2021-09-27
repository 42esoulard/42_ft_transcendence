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
            My Chat App
            <span class="float-right">{{ connections }} connections</span>
          </h4>
        </div>
        <ul class="list-group list-group-flush text-right">
          <small v-if="typing" class="text-white">{{ typing }} is typing</small>
          <li class="list-group-item" v-for="(message, i) in messages" :key="i">
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
                type="text"
                class="form-control"
                v-model="newMessage"
                placeholder="Enter message here"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from "vue";
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

    // Doesn't work --> should send an event while browser is closed
    window.onbeforeunload = () => {
      console.log("onbeforeunload");
      socket.emit("leave", username.value);
    };

    socket.on("chat-message", (data: any) => {
      messages.push({
        message: data.message,
        type: 1,
        user: data.user,
      });
    });

    socket.on("typing", (user: string) => {
      typing.value = user;
    });

    socket.on("stopTyping", () => {
      typing.value = "";
    });

    socket.on("join", (user: string) => {
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
      messages.push({
        message: newMessage.value,
        type: 0,
        user: "Me",
      });

      socket.emit("chat-message", {
        message: newMessage.value,
        user: username.value,
      });
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
    };
  },
});
</script>

<style>
#messages {
  height: 300px;
  overflow-y: scroll;
}
</style>
