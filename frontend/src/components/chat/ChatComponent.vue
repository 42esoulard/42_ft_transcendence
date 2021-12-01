<template>
  <transition name="toast">
    <Toast v-if="toastMessage" :message="toastMessage" />
  </transition>
    <div class="chat">
      <ChannelsList :joinedChannels="joinedChannels" :availableChannels="availableChannels" :channelSettings="channelSettings" :activeChannel="activeChannel" />

        <ChannelSettings v-if="channelSettings"  
          @close-settings="channelSettings = false" 
          @update-channel="getMessagesUpdate(activeChannel.channel.id)" 
          @update-channels-list="updateChannelsList()" 
          @deleted-channel="deletedChannel()"
          @post-message="postMessage"
          :activeChannel="activeChannel" 
        />
        <div v-else class="chat-box">
            <div v-if="activeChannel" class='chat-header'>

              <div v-if="activeChannel.notification" class="chat-header__notif" title="Turn off notifications" @click="toggleNotification()"></div>
              <div v-else class="chat-header__notif chat-header__notif--off" title="Turn on notifications" @click="toggleNotification()"></div>

              <div class="chat-header__channel-name" :title="activeChannel.channel.name">{{ activeChannel.channel.name }}</div>
              <div>
                <span v-if="activeChannel.channel.type === 'private'"><img class="fas fa-eye-slash chat-channels__tag chat-channels__tag--private" title="This community is private" /></span>
                <span v-if="activeChannel.channel.password"><img class="fas fa-lock chat-channels__tag chat-channels__tag--locked" title="This channel is password-protected" /></span>
              </div>
              <div v-if="activeChannel.is_admin || activeChannel.is_owner || user.role == 'admin' || user.role == 'owner'" class="chat-channels__tag-container">
                <span v-if="activeChannel.is_owner"><img class="fas fa-user-tie chat-channels__tag chat-channels__tag--owner" title="Channel Owner" /></span>
                <span v-if="activeChannel.is_admin"><img class="fas fa-user-shield chat-channels__tag chat-channels__tag--admin" title="Channel Admin" /></span>
                <span @click="channelSettings = true"><img class="fas fa-lg fa-cogs chat-channels__tag chat-channels__tag--settings" title="Channel Settings"  /></span>
              </div>
              <span v-if="isMember && activeChannel.channel.name !== 'General'" @click="toggleConfirmationModal('leave', null)" ><img class="fas fa-lg fa-sign-out-alt chat-channels__tag chat-channels__tag--leave" title="Leave Channel" /></span>
            </div>

          <div v-if="isMember || (activeChannel && !activeChannel.channel.password) || user.role !== 'user'" class="chat-messages">
            <div>
              <ul class="chat-messages__list" id="messages">
                <li class="chat-messages__item" v-for="(message) in channelMessages" :key="message.id">
                    <div class="chat-messages__author-container">
                      <div class='chat-messages__author'>{{ message.author.username }}</div>
                      <div v-if="message.author.id !== activeChannel.member.id" class="chat-user__card">
                      
                          <button class="button" title="Profile" >
                            <router-link class="link link--neutral" :to="{ name: 'UserProfile', params: {username: message.author.username} }">
                            <i class="fas fa-user-circle" /></router-link>
                          </button>
                          <button class="button" title="DM" @click="directMessage(message.author)"><i class="fas fa-envelope link link--neutral" /></button>
                          <button class="button" title="Challenge"><i class="fas fa-table-tennis" /></button>
                          <button class="button" title="Block" @click="toggleConfirmationModal('block', message.author)"><i class="fas fa-ban" /></button>
                      </div>
                    </div>
                    <div>: </div>
                    <div class="chat-messages__content">{{ message.content }}</div>
                </li>
              </ul>
            </div>
          </div>
          <div v-if="!isMember && activeChannel && activeChannel.channel.password && user.role == 'user'" class="chat-channels__locked-msg">
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
                  maxlength=100000
                  placeholder="Enter message here"
                />
                <div v-else @mouseover="hoveringLock = true" @mouseout="hoveringLock = false">
                  <div v-if="hoveringLock">
                  <button v-if="activeChannel" 
                  class="chat-box__input chat-box__input--blued" 
                  @click="applyForMembership(activeChannel.channel)">
                    <div>Join the channel to send messages</div>
                  </button>
                  </div>
                  <div v-else>
                  <button v-if="activeChannel" 
                  class="chat-box__input chat-box__input--greyed" 
                  @click="applyForMembership(activeChannel.channel)">
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
        <div v-if="newChannelForm || passwordPrompt || toggleConfirmation" class="backdrop"></div>
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
        <Modal v-if="mutePopup && activeChannel" @close="toggleModal(3)">
          <template v-slot:mute-ban-popup>
            <MuteBanPopup :cm="activeChannel" @close="toggleModal(3)" />
          </template>
        </Modal>
        <Modal v-if="toggleConfirmation && activeChannel" @close="toggleModal(4)">
          <template v-slot:confirmation>
            <Confirmation :action="toggleConfirmation" :targetCm="activeChannel" :target='target' :targetUser='targetUser' @close="toggleModal(4)" @confirm="executeAction" />
          </template>
        </Modal>
      </transition-group>
    </teleport>
</template>

<script lang="ts">
import { useStore } from '@/store';
import { defineComponent, reactive, ref, watch, computed } from "vue";
import { Info } from "@/types/Info";
import { ChatApi, User, Message, Channel, ChannelMember, RelationshipApi } from '@/../sdk/typescript-axios-client-generated';
import Modal from "@/components/Modal.vue";
import Toast from "@/components/Toast.vue";
import NewChannelForm from "@/components/chat/NewChannelForm.vue";
import LockedChannelForm from "@/components/chat/LockedChannelForm.vue";
import ChannelSettings from "@/components/chat/ChannelSettings.vue";
import ChannelsList from "@/components/chat/ChannelsList.vue";
import MuteBanPopup from "@/components/chat/MuteBanPopup.vue";
import Confirmation from "@/components/chat/Confirmation.vue";
import { chatSocket } from "@/App.vue";

export const ChatComponent = defineComponent({
  name: "ChatComponent",
  components: { NewChannelForm, LockedChannelForm, ChannelSettings, ChannelsList, MuteBanPopup, Modal, Toast, Confirmation },

  beforePageLeave() {
    chatSocket.emit("leave", 'a user');
  },
  beforeRouteLeave() {
    chatSocket.emit("leave", 'a user');
  },
  setup() {

    const api = new ChatApi();
    const relApi = new RelationshipApi();
    const store = useStore();
    const user = computed(() => store.state.user);

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
    const mutePopup = ref(false);
    const toggleConfirmation = ref('');
    const target = ref('');
    const targetUser = ref<User>()

    /*
    ** Default channel = id 1, "General". Automatically joined on connection, can't be left.
    */
    store.state.chatNotification = false;
    store.state.chatOn = true;

    const getDefaultChannel = async () => {
      await api.getDefaultChannel({ withCredentials: true })
      .then(async (chan) => {
        await joinChannel(chan.data)
        .then(async () => {
          await api.setNewMessage('false', chan.data.id, { withCredentials: true })
          .then((res) => { 
            updateChannelsList();
            activeChannel.value = res.data;
          })
          .catch((err) => console.log("Caught error:", err.response.data.message));
        })
        .catch((err) => console.log("Caught error:", err.response.data.message));
      })
      .catch((err) => console.log("Caught error:", err.response.data.message));
    }
    getDefaultChannel();

    /*
    ** Called upon connection or when channels list update is triggered,
    ** ie: a channel is created/deleted. Re-fetches all channel infos from API.
    */
    const updateChannelsList = async () => {
      mutePopup.value = false;
      passwordPrompt.value = false;
      await api.getUserChannels({ withCredentials: true })
      .then(async (res) => {
        joinedChannels.value = res.data;
        await api.getChannelMember(activeChannel.value!.channel.id, activeChannel.value!.member.id, { withCredentials: true })
        .then((res) => {
          activeChannel.value = res.data;
          if (!activeChannel.value.is_admin && user.value.role !== 'admin' && user.value.role !== 'owner')
            channelSettings.value = false;
          // console.log(res.data)
        })
        .catch(async (err) => {
          console.log("Caught error:", err.response.data.message);
          if (user.value.role !== 'admin' && user.value.role !== 'owner') {
            getDefaultChannel();
          } else {
            await api.getChannelPreview(activeChannel.value!.channel.id, { withCredentials: true })
            .then((res) => {
              activeChannel.value!.channel = res.data;
              channelMessages.value = res.data.messages;
              return res;
            })
            .catch((err) => console.log("Caught error:", err.response.data.message));
        
          }
        });
        await api.getAvailableChannels({ withCredentials: true })
        .then((res) => {
          availableChannels.value = res.data;
        })
        .catch((err) => console.log("Caught error:", err.response.data.message));
      })
      .catch((err) => console.log("Caught error:", err.response.data.message));
    }

    const getMessagesUpdate = async (channelId: number) => {
      if (activeChannel.value!.channel && activeChannel.value!.channel.id === channelId) {
        await api.getChannelById(channelId, { withCredentials: true })
        .then((res) => {
          activeChannel.value!.channel = res.data;
          channelMessages.value = res.data.messages;
          return res;
        })
        .catch((err) => console.log("Caught error:", err.response.data.message));
        }
    }

    const postMessage = async (message: string) => {
      newMessage.value = message;
      send();
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
      }, { withCredentials: true })
      .then(() => {
        getMessagesUpdate(newContent.channel.id);
        chatSocket.emit("chat-message", newContent, store.state.onlineUsers);
      })
      .catch(async (err: any) => {
        console.log("Caught error:", err.response.data.message)
        if (err.response.data.message == 'muted') {
          mutePopup.value = true;
        }
        return;
      });
    }

    /*
    ** For non-joined channels display
    */
    const previewChannel = async (channel: Channel) => {
      activeChannel.value = {
        id: 0,
        channel: channel,
        is_admin: false,
        is_owner: false,
        notification: false,
        new_message: false,
        member: user.value,
        ban: null,
        mute: null,
      }
      isMember.value = false;
      channelSettings.value = false;
      channelMessages.value = channel.messages;
      await api.getChannelPreview(channel.id, { withCredentials: true })
        .then((res) => {
          activeChannel.value!.channel = res.data;
          channelMessages.value = res.data.messages;
          return res;
        })
        .catch((err) => console.log("Caught error:", err.response.data.message));
        
    }

    const toggleNotification = async () => {
      await api.toggleNotification(activeChannel.value!.id, { withCredentials: true })
      .then((res) => { 
        updateChannelsList();
        activeChannel.value = res.data;
      })
      .catch((err) => console.log("Caught error:", err.response.data.message));
    }

    const applyForMembership = async (channel: Channel) => {
      if (channel.password) {
        passwordPrompt.value = true;
      } else {
        joinChannel(channel);
      }
    }

    chatSocket.on("join-channel", (chan: Channel) => {
      joinChannel(chan);
    });

    const joinChannel = async (channel: Channel) => {

      await api.joinChannel("self", channel.id, user.value.id, { withCredentials: true })
        .then((res)=> {
          updateChannelsList();
          activeChannel.value = res.data;
          isMember.value = true;
          getMessagesUpdate(res.data.channel.id);
          if (channel.id !== 1) {
            store.dispatch("setMessage", "You're now a member of channel [" + channel.name.substring(0, 15) + "]");
            newMessage.value = " has joined";
            send();
            chatSocket.emit('update-channels');
          }
          return res;
        })
        .catch((err) => console.log("Caught error:", err.response.data.message));
    }

    const deletedChannel = async () => {

      store.dispatch("setMessage", "Channel [" + activeChannel.value!.channel.name.substring(0, 15) + "] has been deleted");
      updateChannelsList();
      switchChannel(joinedChannels.value[0]);
      chatSocket.emit('update-channels')
    }

    const leaveChannel = async () => {
      toggleConfirmation.value = '';
      const name = activeChannel.value!.channel.name;
      newMessage.value = " has left";
      send();
      await api.leaveChannel("self", activeChannel.value!.id, { withCredentials: true })
      .then((res) => {
        store.dispatch("setMessage", "You're no longer a member of channel [" + name.substring(0, 15) + "]");
        updateChannelsList();
        switchChannel(joinedChannels.value[0]);
        chatSocket.emit('update-channels');
      })
      .catch((err) => console.log("Caught error:", err.response.data.message));
    }

    const directMessage = (recipient: User) => {

      const newChannel = api.saveChannel({
        name: user.value.username + ' to ' + recipient.username,
        owner_id: user.value.id,
        type: 'private',
        notification: true,
        password: '',
      }, { withCredentials: true })
      .then(async (cm) => {
        updateChannelsList();
        activeChannel.value = cm.data;
        isMember.value = true;
        getMessagesUpdate(cm.data.channel.id);
        store.dispatch("setMessage", "You're now a member of channel [" + cm.data.channel.name.substring(0, 15) + "]");
        await api.joinChannel("dm", cm.data.channel.id, recipient.id, { withCredentials: true })
        .then((res)=> {
          chatSocket.emit('update-channels', cm.data)
          chatSocket.emit('chat-action', 'added to', recipient.id, cm.data.channel.name);
          newMessage.value = res.data.member.username + " has been added";
          send();
          return res;
        })
        .catch((err) => console.log("Caught error:", err.response.data.message));
      })
      .catch((err) => console.log("Caught error:", err.response.data.message))
    }

    const block = async (user: User) => {
      if (store.state.user.id != 0) {
        await relApi
          .saveRelationship(
            {
              requesterId: store.state.user.id,
              adresseeId: user.id,
              nature: "blocked",
            },
            {
              withCredentials: true,
            }
          )
          .then((res: any) => window.location.reload())
          .catch((err: any) => console.log(err));
      }
    };

    const executeAction = (action: string, user: User) => {
      if (action == 'block') {
        block(user);
      } else if (action == 'leave') {
        leaveChannel();
      }
    }

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
          if (channelSettings.value == true) {
            updateChannelsList();
          }
          break;
        case 3:
          mutePopup.value = !mutePopup.value;
          break;
        case 4:
          toggleConfirmation.value = '';
          break;
      }
    }

    const toggleConfirmationModal = (action: string, user: User | null) => {
      target.value = 'channel';
      if (action == 'block') {
        target.value = 'user';
        if (user) {
          targetUser.value = user;
        }
      }
      toggleConfirmation.value = action;
    }

    const switchChannel =  async (cm: ChannelMember) => {
      channelSettings.value = false;
      activeChannel.value = cm;
      activeChannel.value.new_message = false;
      await api.setNewMessage('false', cm.channel.id, { withCredentials: true })
      .catch((err) => console.log("Caught error:", err.response.data.message));
      isMember.value = true;
      console.log("in switchChannel", cm)
      getMessagesUpdate(cm.channel.id);
    }

    chatSocket.on("chat-message-on", async (data: any) => {
      await relApi.getBlockedByUser(user.value.id)
        .then(async (blocked) => {
          if (blocked.data.map((blocked) => blocked.adresseeId).includes(data.author.id)) {
            return;
          }
          if (activeChannel.value!.channel && activeChannel.value!.channel.id === data.channel.id) {
            channelMessages.value.push(data);
          } else if (activeChannel.value!.channel) {
            await api.setNewMessage('true', data.channel.id, { withCredentials: true })
            .then((res) => { 
              store.state.chatNotification = true; 
              // console.log(res)
              updateChannelsList();
            })
          .catch((err) => console.log("Caught error:", err.response.data.message));
          }
      });
    });

    chatSocket.on('created-channel', async (cm: ChannelMember) => {
      await updateChannelsList()
      .then(() => {
        switchChannel(cm);
      })
      .catch((err) => console.log("Caught error:", err.response.data.message));
    })

    chatSocket.on('update-channels', () => {
      updateChannelsList();
    })

    window.onbeforeunload = () => {
      chatSocket.off('chat-message-on');
      chatSocket.off('created-channel');
      chatSocket.off('join-channel');
      chatSocket.off('update-channels');
    };

    return {
      chatSocket,

      send,
      newMessage,
      postMessage,
      channelMessages,
      getMessagesUpdate,
      typing,

      user,
      info,

      updateChannelsList,
      joinedChannels,
      deletedChannel,
      availableChannels,
      activeChannel,
      switchChannel,
      previewChannel,
      applyForMembership,
      joinChannel,
      leaveChannel,
      isMember,
      mutePopup,
      toggleConfirmation,
      toggleConfirmationModal,
      executeAction,

      newChannelForm,
      passwordPrompt,
      channelSettings,
      toggleModal,
      target, 
      targetUser,

      toggleNotification,
      toastMessage: computed(() => store.state.message),
      hoveringLock: ref(false),
      userInfo: ref(false),
      directMessage,
    };
  },
});

export default ChatComponent;
</script>

<style lang="scss">
  @import "../../../sass/main.scss";
</style>

