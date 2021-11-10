<template>
  <transition name="toast">
    <Toast v-if="toastMessage" :message="toastMessage" />
  </transition>
  <!-- <h1>Chat Room</h1> -->
    <div class="chat">
      <ChannelsList :joinedChannels="joinedChannels" :availableChannels="availableChannels" :channelSettings="channelSettings" />
        <!-- <div>
          <p v-for="(user, i) in info" :key="i">
            {{ user.username }} {{ user.action }}
          </p>
        </div> -->
  
        <ChannelSettings @close-settings="channelSettings = false" v-if="channelSettings" :activeChannel="activeChannel" />
        <div v-else class="chat-box">
            <div v-if="activeChannel" class='chat-header'>
              <div class="chat-header__channel-name" :title="activeChannel.channel.name">{{ activeChannel.channel.name }}</div>
              <div>
                <span v-if="activeChannel.channel.type === 'private'"><img class="fas fa-eye-slash chat-channels__tag chat-channels__tag--private" title="This community is private" /></span>
                <span v-if="activeChannel.channel.password"><img class="fas fa-lock chat-channels__tag chat-channels__tag--locked" title="This channel is password-protected" /></span>
              </div>
              <div v-if="activeChannel.is_admin || activeChannel.is_owner" class="chat-channels__tag-container">
                <span v-if="activeChannel.is_owner"><img class="fas fa-user-tie chat-channels__tag chat-channels__tag--owner" title="Channel Owner" /></span>
                <span v-if="activeChannel.is_admin"><img class="fas fa-user-shield chat-channels__tag chat-channels__tag--admin" title="Channel Admin" /></span>
                <span @click="channelSettings = true"><img class="fas fa-lg fa-cogs chat-channels__tag chat-channels__tag--settings" title="Channel Settings"  /></span>
              </div>
              <span v-if="isMember && activeChannel.id !== 1" @click="leaveChannel()" ><img class="fas fa-lg fa-sign-out-alt chat-channels__tag chat-channels__tag--leave" title="Leave Channel" /></span>
            </div>

          <div v-if="isMember || (activeChannel && !activeChannel.channel.password)" class="chat-messages">
            <div>
              <ul class="chat-messages__list" id="messages">
                <!-- <small v-if="typing">{{ typing }} is typing</small> -->
                <li class="chat-messages__item" v-for="(message) in channelMessages" :key="message.id">
                    <div class="chat-messages__author-container">
                      <div class='chat-messages__author'>{{ message.author.username }}</div>
                      <div class="chat-user__card">
                          <!-- <div class="chat-user__username"> {{ message.author.username }} </div>
                          <div class="chat-user__login"> {{ message.author.forty_two_login }} </div>
                          <img class="chat-user__avatar" :src="message.author.avatar"> -->
                          <button class="button" title="Profile" >
                            <router-link class="link link--neutral" :to="{ name: 'UserProfile', params: {username: message.author.username} }">
                            <i class="fas fa-user-circle" /></router-link>
                          </button>
                          <button class="button link link--neutral" title="DM" @click="directMessage(message.author)"><i class="fas fa-envelope" /></button>
                          <button class="button" title="Challenge"><i class="fas fa-table-tennis" /></button>
                          <button class="button" title="Block"><i class="fas fa-ban" /></button>
                          <button v-if="activeChannel && activeChannel.is_admin" class="button" title="Admin Actions"><i class="fas fa-cog" /></button>
                      </div>
                    </div>
                    <div>: </div>
                    <div class="chat-messages__content">{{ message.content }}</div>
                </li>
                
              </ul>
            </div>
          </div>
          <div v-if="!isMember && activeChannel && activeChannel.channel.password" class="chat-channels__locked-msg">
            <div @mouseover="hoveringLock = true" @mouseout="hoveringLock = false">
              <span v-if="!hoveringLock"><img class="fa fa-lock fa-10x chat-channels__lock-img" title="This channel is password-protected" /></span>
              <span v-else @click="applyForMembership(activeChannel.channel)"><img class="fa fa-unlock fa-10x chat-channels__lock-img chat-channels__lock-img--unlocked" title="This channel is password-protected" /></span>
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
                <div v-else @mouseover="hoveringLock = true" @mouseout="hoveringLock = false">
                  <div v-if="hoveringLock">
                  <button v-if="activeChannel" class="chat-box__input chat-box__input--blued" @click="applyForMembership(activeChannel.channel)">
                    <div>Join the channel to send messages</div>
                  </button>
                  </div>
                  <div v-else>
                  <button v-if="activeChannel" class="chat-box__input chat-box__input--greyed" @click="applyForMembership(activeChannel.channel)">
                    <div>Join the channel to send messages</div>
                  </button>
                  </div>

                </div>
              </div>
            </form>
          </div>        
        </div>
    </div>

    <teleport to="#modals">
      <transition name="fade--error">
        <div v-if="newChannelForm || passwordPrompt" class="backdrop"></div>
      </transition>
      <transition-group name="zoomin">
        <Modal v-if="newChannelForm" @close="toggleModal(0)">
          <template v-slot:new-channel-form>
            <NewChannelForm @close="toggleModal(0)" />
          </template>
        </Modal>
        <Modal v-if="passwordPrompt && activeChannel" @close="toggleModal(1)">
          <template v-slot:locked-channel-form>
            <LockedChannelForm :channel="activeChannel.channel" @close="toggleModal(1)" @join-channel="joinChannel" />
          </template>
        </Modal>
        <!-- <Modal v-if="settingsModal && activeChannel" @close="toggleModal(2)">
          <template v-slot:settings-modal>
            <SettingsModal :channelMembers="activeChannel.channel.channel_members" @close="toggleModal(2)" />
          </template>
        </Modal> -->
      </transition-group>
    </teleport>  
</template>

<script lang="ts">
import { io } from "socket.io-client";
import { useStore } from 'vuex';
import { defineComponent, reactive, ref, watch, computed } from "vue";
import { ChatApi, User } from "@/../sdk/typescript-axios-client-generated";
import { useUserApi } from "@/plugins/api.plugin";
import { Info } from "@/types/Info";
import { Message } from "@/types/Message";
import { Channel } from "@/types/Channel"
import { ChannelMember } from "@/types/ChannelMember"
import Modal from "@/components/Modal.vue";
import Toast from "@/components/Toast.vue";
import NewChannelForm from "@/components/chat/NewChannelForm.vue";
import LockedChannelForm from "@/components/chat/LockedChannelForm.vue";
import ChannelSettings from "@/components/chat/ChannelSettings.vue";
import ChannelsList from "@/components/chat/ChannelsList.vue";

/*
** socket is defined here to be able to import it from other chat related components
*/ 
export const socket = io("http://localhost:3000/chat");

export const ChatComponent = defineComponent({
  name: "ChatComponent",
  components: { NewChannelForm, LockedChannelForm, ChannelSettings, ChannelsList, Modal, Toast },
  
  beforePageLeave() {
    this.socket.emit("leave", 'a user');
  },
  beforeRouteLeave() {
    this.socket.emit("leave", 'a user');
  },
  setup() {

    const api = new ChatApi();
    const userApi = useUserApi();
    const store = useStore();
    const user = computed(() => store.state.user);
    const firstTimeConnect = computed(() => store.state.firstTimeConnect);
    const connections = ref(1);

    const newMessage = ref("");
    const messageId = ref(0);
    const typing = ref("");
    const info = reactive<Info[]>([]);

    const channelMessages = ref<Message[]>([]);
    const activeChannel = ref<ChannelMember>();
    const joinedChannels = ref<ChannelMember[]>([]);
    const availableChannels = ref<Channel[]>([]);
    const newChannelForm = ref(false);
    const passwordPrompt = ref(false);
    const channelSettings = ref(false);
    const isMember = ref(false);

    /*
    ** Default channel = id 1, "General". Automatically joined on connection, can't be left.
    */
    const getDefaultChannel = async () => {
      await api.getChannelById(1)
      .then(async (chan) => {
        return await joinChannel(chan.data);
      })
      .catch((err) => console.log(err));
    }
    getDefaultChannel();

    /*
    ** Called upon connection or when channels list update is triggered,
    ** ie: a channel is created/deleted. Re-fetches all channel infos from API.
    */
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

    /*
    ** When the currently viewed channel gets a new message (either sent or received).
    ** All channel info is refetched from the API to get the whole message info and 
    ** updated related infos (channel, user..)
    */
    const getMessagesUpdate = async (channelId: number) => {
      console.log("in get messages channel", channelId)
      if (activeChannel.value!.channel && activeChannel.value!.channel.id === channelId) {
        await api.getChannelById(channelId)
        .then((res) => {
          activeChannel.value!.channel = res.data;
          channelMessages.value = res.data.messages;
          console.log("in get messages:", channelMessages.value);
          return res;
        })
        .catch((err) => console.log(err));
        }
    }

    const send = async () => {
      
      if (!newMessage.value)
        return;
      const newContent = {
        content: newMessage.value,
        author: user.value,
        channel: activeChannel.value!.channel,
        id: messageId.value,
        created_at: Date.now().toString(),
      }

      newMessage.value = "";
      messageId.value++;

      await api.saveMessage({
          channel_id: newContent.channel.id,
          author_id: newContent.author.id, 
          content: newContent.content,
      })
      .then(() => { 
        getMessagesUpdate(newContent.channel.id); 
        socket.emit("chat-message", newContent); 
      })
      .catch((err: any) => console.log(err.message));
    }

    /*
    ** For non-joined channels display
    */
    const previewChannel = (channel: Channel) => {
      activeChannel.value = {
        id: 0,
        channel: channel,
        is_admin: false,
        is_owner: false,
        member: user.value,
        ban: null,
        mute: null,
      }
      isMember.value = false;
      channelMessages.value = channel.messages;
    }

    const applyForMembership = async (channel: Channel) => {
      if (channel.password) {
        passwordPrompt.value = true;
      } else {
        joinChannel(channel);
      }
    }

    socket.on("join-channel", (chan: Channel) => {
      console.log("IN JOIN CHANNEL")
      joinChannel(chan);
    });

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
            store.dispatch("setMessage", "You're now a member of channel [" + channel.name.substring(0, 15) + "]");
          return res;
        })
        .catch((err) => console.log(err));
    }

    const leaveChannel = async () => {

      const name = activeChannel.value!.channel.name;
      await api.leaveChannel(activeChannel.value!.id)
      .then((res) => {
        store.dispatch("setMessage", "You're no longer a member of channel [" + name.substring(0, 15) + "]");
        updateChannelsList();
        switchChannel(joinedChannels.value[0]);
      })
      .catch((err) => console.log(err));
    }

    // const sendInvite = (channel: Channel, recipient: User) => {

    // }

    // const directMessage = (recipient: User) => {
    //   const newChannel = api.saveChannel({
    //     name: user.value.login + ' to ' + recipient.forty_two_login,
    //     owner_id: user.value.id, 
    //     type: 'private',
    //     password: '',
    //   })
    //   .then((res) => {
    //     console.log("in createChannel res", res)
    //     socket.emit('createChannel', res.data)
    //   })
    //   .catch((err) => console.log("Failed to create channel: ", err))
    // }

    const toggleModal = (idx: number) => {
      switch(idx) {
        case 0:
          newChannelForm.value = !newChannelForm.value;
          break;
        case 1:
          passwordPrompt.value = !passwordPrompt.value;
          break;
        case 2:
          channelSettings.value = !channelSettings.value;
          break;
      }
      console.log("channelSettings", channelSettings)
    }

    // const toggleAdminSettings = async () => {
    //   const channelMembers = await api.getChannelMembers(activeChannel.value!.channel.id);
    //   settingsModal.value = true;
    // }

    const switchChannel =  (cm: ChannelMember) => {
      channelSettings.value = false;
      activeChannel.value = cm;
      isMember.value = true;
      console.log("in switchChannel", cm)
      getMessagesUpdate(cm.channel.id);
    }

    socket.on("chat-message", (data: any) => {
      console.log("RECEIVED CHAT MESSAGE, data:", data)
      if (activeChannel.value!.channel && activeChannel.value!.channel.id === data.channel.id) {
        channelMessages.value.push(data);
        console.log("in get messages:", channelMessages.value);
    }
      // getMessagesUpdate(data.channel);
    });

    socket.on("typing", (user: string) => {
      typing.value = user;
    });

    socket.on("stopTyping", () => {
      typing.value = "";
    });

    socket.on('createdChannel', async (cm: ChannelMember) => {
      toggleModal(0);
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

    window.onbeforeunload = () => {
      socket.emit("leave", user.value.username);
    };

    return {
      socket,
      
      send,
      newMessage,
      channelMessages,
      getMessagesUpdate,
      typing,

      user,
      info,
      connections,

      joinedChannels,
      availableChannels,
      activeChannel,
      switchChannel,
      previewChannel,
      applyForMembership,
      joinChannel,
      leaveChannel,
      isMember,

      newChannelForm,
      passwordPrompt,
      channelSettings,
      // toggleAdminSettings,
      toggleModal,

      toastMessage: computed(() => store.state.message),
      hoveringLock: ref(false),
      userInfo: ref(false),
    };
  },
});

export default ChatComponent;
</script>

<style lang="scss">
  @import "../../../sass/main.scss";
</style>

