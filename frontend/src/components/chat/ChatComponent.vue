<template>
  <transition name="toast">
    <Toast v-if="message" :message="message" />
  </transition>
  <h1>Chat Room</h1>
    <div class="chat">
      <ChannelsList :joinedChannels="joinedChannels" :availableChannels="availableChannels" />
        <!-- <div>
          <p v-for="(user, i) in info" :key="i">
            {{ user.username }} {{ user.action }}
          </p>
        </div> -->
        
        <div class="chat-box">
            <div v-if="activeChannel" class='chat-header'>
              <div class="chat-header__channel-name" :title="activeChannel.channel.name">{{ activeChannel.channel.name }}</div>
              <div>
                <span v-if="activeChannel.is_owner"><img class="fas fa-user-tie chat-channels__tag chat-channels__tag--owner" title="Channel Owner" /></span>
                <span v-if="activeChannel.is_admin"><img class="fas fa-user-shield chat-channels__tag chat-channels__tag--admin" title="Channel Admin" /></span>
              </div>
              <span class="chat-header__online">{{ connections }} online</span>
            </div>

            <!-- leave chan: ['fas', 'sign-out-alt'] -->

          <div class="chat-messages">
            <div>
              <ul class="chat-messages__list" id="messages">
                <small v-if="typing">{{ typing }} is typing</small>
                <li class="chat-messages__item" v-for="(message) in channelMessages" :key="message.id">
                    <div class="chat-messages__author">{{ message.author.username }}</div>
                    <div>: </div>
                    <div class="chat-messages__content">{{ message.content }}</div>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <form @submit.prevent="send">
              <div>
                <input
                  v-if="isMember"
                  type="text"
                  class="chat-box__input"
                  v-model="newMessage"
                  placeholder="Enter message here"
                />
                <div v-else>
                  <button v-if="activeChannel" class="chat-box__input chat-box__input--greyed" @click="joinChannel(activeChannel.channel)">
                    <div>Join the channel to send messages</div>
                  </button>
                </div>
              </div>
            </form>
          </div>        
        </div>
    </div>

    <teleport to="#modals">
      <transition name="fade--error">
        <div v-if="newChannelForm" class="backdrop"></div>
      </transition>
      <transition-group name="zoomin">
        <Modal v-if="newChannelForm" @close="toggleChannelForm()">
          <template v-slot:new-channel-form>
            <newChannelForm @close="toggleChannelForm()" />
          </template>
        </Modal>
      </transition-group>
    </teleport>  
</template>

<script lang="ts">
import { io } from "socket.io-client";
import { useStore } from 'vuex';
import { defineComponent, reactive, ref, watch, computed } from "vue";
import { DefaultApi } from "@/../sdk/typescript-axios-client-generated";
import { useUserApi } from "@/plugins/api.plugin";
import { Info } from "@/types/Info";
import { Message } from "@/types/Message";
import { Channel } from "@/types/Channel"
import { ChannelMember } from "@/types/ChannelMember"
import Modal from "@/components/Modal.vue";
import Toast from "@/components/Toast.vue";
import NewChannelForm from "@/components/chat/NewChannelForm.vue"
import ChannelsList from "@/components/chat/ChannelsList.vue"

export const socket = io("http://localhost:3000/chat");

export const ChatComponent = defineComponent({
  name: "ChatComponent",
  components: { NewChannelForm, ChannelsList, Modal, Toast },
  
  beforePageLeave() {
    this.socket.emit("leave", 'a user');
  },
  beforeRouteLeave() {
    this.socket.emit("leave", 'a user');
  },

  setup() {

    const api = new DefaultApi();
    const userApi = useUserApi();
    const store = useStore();
    const user = computed(() => store.state.user);
    const firstTimeConnect = computed(() => store.state.firstTimeConnect);
    

    const newMessage = ref("");
    const messageId = ref(0);

    // const allMessages: {
    //     [key: number]: Array<Message>,
    //   } = {};
    const channelMessages = ref<Message[]>([]);
    
    const activeChannel = ref<ChannelMember>();
    const isMember = ref(false);

    const getDefaultChannel = async () => {
      await api.getChannelById(1)
      .then(async (chan) => {
        return await joinChannel(chan.data);
        // await api.joinChannel(1, user.value.id)
        // .then((res)=> {
        //   console.log(res)
        //   updateChannelsList();
        //   activeChannel.value = res.data;
        //   console.log("ACTIVECHANNEL", activeChannel)
        //   getMessagesUpdate(res.data.channel);
        //   return res;
        // })
      })
      .catch((err) => console.log(err));
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
    let availableChannels = ref<Channel[]>([]);
    const allChannels = ref<ChannelMember[]>([]);

    const updateChannelsList = async () => {
      await api.getUserChannels(user.value.id)
      .then(async (res) => {
        joinedChannels.value = res.data;
        console.log("in  channels list", joinedChannels.value)
        await api.getAvailableChannels(user.value.id)
        .then((res) => {
          availableChannels.value = res.data;
          console.log("avail", availableChannels.value);
        })
        .catch((err) => console.log(err));
      })
      .catch((err) => { console.log("not found")})
    }
    updateChannelsList();


    const getMessagesUpdate = async (channelId: number) => {
      console.log("in get messages channel", channelId)
      if (activeChannel.value!.channel && activeChannel.value!.channel.id === channelId) {
        await api.getChannelById(channelId)
        .then((res) => {
            console.log("bef bug")
            activeChannel.value!.channel = res.data;
            console.log("aft bug")
            channelMessages.value = res.data.messages;
      
          console.log("messages ok", activeChannel.value, channelMessages.value)
          return res;
        })
        .catch((err) => console.log(err));
        }
    }

    // const isMemberOfActiveChannel = async () => {
    //   // await api.getChannelMember(1, 1) //REPLACE WITH GET CHANNEL ID, GET USER ID
    //   // .then(() => {

    //   // })
    //   return true;
    // }

    const toggleChannelForm = () => {
      newChannelForm.value = !newChannelForm.value;
    }

    const previewChannel = (channel: Channel) => {
      activeChannel.value!.channel = channel;
      activeChannel.value!.is_admin = false;
      activeChannel.value!.is_owner = false;
      isMember.value = false;
      channelMessages.value = channel.messages;
    }

    const joinChannel = async (channel: Channel) => {
      await api.joinChannel(channel.id, user.value.id)
        .then((res)=> {
          console.log(res)
          updateChannelsList();
          activeChannel.value = res.data;
          isMember.value = true;
          console.log("ACTIVECHANNEL", activeChannel)
          getMessagesUpdate(res.data.channel.id);
          if (channel.id !== 1)
            store.dispatch("setMessage", "You joined channel [" + channel.name + "]");
          return res;
        })
        .catch((err) => console.log(err));
    }

  

    // const selectActiveChannel = () => {
    //   console.log("IN SELECT ACITVE CHAN", activeChannel)
    //   const selectedChannel = document.getElementById(activeChannel.value!.channel.name)!;
    //   selectedChannel.setAttribute("selected", "true");
    //   // FIND A CLEANER SOLUTION TO WAIT FOR DOM ELEM TO BE CREATED
    // }

    const switchChannel =  (cm: ChannelMember) => {
        
      activeChannel.value = cm;
      isMember.value = true;
      console.log("in switchChannel", cm.channel.id)

      // selectActiveChannel();
      getMessagesUpdate(cm.channel.id);
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

    socket.on('createdChannel', async (cm: ChannelMember) => {
      toggleChannelForm();
      await updateChannelsList()
      .then(() => {
        switchChannel(cm);
      })
      .catch((err) => console.log(err));
    })

    socket.on('addChannel', (info: Channel) => {
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
        getMessagesUpdate(newContent.channel.id); 
        socket.emit("chat-message", newContent); 
      })
      .catch((err: any) => console.log(err.message));
    }

    // const addUser = () => {
    //   socket.emit("join", user.value.username);
    // }

    return {
      socket,
      
      send,
      newMessage,
      channelMessages,
      getMessagesUpdate,
      typing,

      // addUser,
      user,
      info,
      connections,

      joinedChannels,
      availableChannels,
      activeChannel,
      switchChannel,
      previewChannel,
      joinChannel,
      toggleChannelForm,
      newChannelForm,
      isMember,
      // isMemberOfActiveChannel,

      message: computed(() => store.state.message),
    };
  },
});

export default ChatComponent;
</script>

<style lang="scss">
  @import "../../../sass/main.scss";
</style>

