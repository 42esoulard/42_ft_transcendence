<template>
  <!-- 
    - Name? [check it doesn't exist yet in db]
    - Type [radio buttons]: public? Private (newcomers must be invited by a member)?
    - If password-protected: [check regex OK, check password match]
      1) please enter a password for the room (a-zA-Z0-9/*-+_):
      2) please re-enter the password:
  -->
  <div class="chat-box">
    <div v-if="activeChannel" class='chat-header'>
      <div class="chat-header__channel-name" :title="activeChannel.channel.name" @click="closeChannelSettings()">{{ activeChannel.channel.name }}</div>
      <div>
        <span v-if="activeChannel.channel.type === 'private'"><img class="fas fa-eye-slash chat-channels__tag chat-channels__tag--private" title="This community is private" /></span>
        <span v-if="activeChannel.channel.password"><img class="fas fa-lock chat-channels__tag chat-channels__tag--locked" title="This channel is password-protected" /></span>
      </div>
      <div v-if="activeChannel.is_admin || activeChannel.is_owner" class="chat-channels__tag-container">
        <span v-if="activeChannel.is_owner"><img class="fas fa-user-tie chat-channels__tag chat-channels__tag--owner" title="Channel Owner" /></span>
        <span v-if="activeChannel.is_admin"><img class="fas fa-user-shield chat-channels__tag chat-channels__tag--admin" title="Channel Admin" /></span>
        <span @click="closeChannelSettings()"><img class="fas fa-lg fa-arrow-left chat-channels__tag chat-channels__tag--settings" title="Back to Channel"  /></span>
      </div>
      <span></span>

    </div>

    <div>

      <div class='chat-admin-pannel__tabs'>
        <button class='chat-admin-pannel__tab' @click="selectedTab = 'all'">Members</button>
        <button class='chat-admin-pannel__tab' @click="selectedTab = 'banned'">Banned</button>
        <button class='chat-admin-pannel__tab' @click="selectedTab = 'muted'">Muted</button>
        <button v-if="activeChannel.is_owner" class='chat-admin-pannel__tab' @click="selectedTab = 'owner'">Owner Pannel</button>
      </div>
      <div>
        <div v-if="selectedTab === 'all'" class='chat-admin-pannel__users-list'>
          <li v-for="cm in activeChannel.channel.channel_members" :key="cm.id" class='chat-admin-pannel__user'> 
            <router-link class="link link--neutral" :to="{ name: 'UserProfile', params: {username: cm.member.username} }">
              {{ cm.member.username }}
            </router-link>
            <div v-if="cm.is_admin || cm.is_owner" class="chat-channels__tag-container">
              <span v-if="cm.is_owner"><img class="fas fa-user-tie chat-channels__tag chat-channels__tag--owner" title="Channel Owner" /></span>
              <span v-if="cm.is_admin"><img class="fas fa-user-shield chat-channels__tag chat-channels__tag--admin" title="Channel Admin" /></span>
            </div>
            <div v-else>
              <span v-if="cm.mute" @click="toggleModal('unmute', cm)"><img class="fas fa-comment-slash chat-channels__tag chat-channels__tag--mute" title="Unmute user" /></span>
              <span v-else @click="toggleModal('muted', cm)"><img class="fas fa-comment-slash chat-channels__tag chat-channels__tag--greyed" title="Mute user" /></span>
              <span v-if="cm.ban" @click="toggleModal('unban', cm)"><img class="fas fa-skull-crossbones chat-channels__tag chat-channels__tag--ban" title="Unban user" /></span>
              <span v-else @click="toggleModal('banned', cm)"><img class="fas fa-skull-crossbones chat-channels__tag chat-channels__tag--greyed" title="Ban user" /></span>
            </div>
          </li>
        </div>
        <div v-if="selectedTab === 'muted'" class='chat-admin-pannel__users-list'>
          <li v-for="cm in mutedMembers" :key="cm.id" class='chat-admin-pannel__user'> 
            <router-link class="link link--neutral" :to="{ name: 'UserProfile', params: {username: cm.member.username} }">
              {{ cm.member.username }}
            </router-link>
          </li>
        </div>
        <div v-if="selectedTab === 'banned'" class='chat-admin-pannel__users-list'>
          <li v-for="cm in bannedMembers" :key="cm.id" class='chat-admin-pannel__user'> 
            <router-link class="link link--neutral" :to="{ name: 'UserProfile', params: {username: cm.member.username} }">
              {{ cm.member.username }}
            </router-link>
          </li>
        </div>
      </div>

    <!-- <form class="chat-channel-form__form" @submit.prevent='submitInputs()'>
      <div class="chat-channel-form__title">Creating a new channel</div>

      <label class="chat-channel-form__subtitle" for='name'>Channel name:*</label>
      <input class="chat-channel-form__input" required type="text" name='name' id='chanName' placeholder='My Cool Channel' minlength="1" maxlength="200" v-model="channelName" @input="checkName()">
      
      <div class="channelAccessContainer">
        <label class="chat-channel-form__subtitle">Channel access:*</label>
        <label class='chat-channel-form__radio-container'  title='A public channel is visible and accessible to any user' id='public'>
          <input type='radio' class='chat-channel-form__radio-unit' id='chanPublic' name='unit' value='public' v-model="channelType">Public
        </label>
        <label class='chat-channel-form__radio-container'  title='An invite-only channel is only accessible to members who have been invited to join by a channel member' id='Private (invite-only)'>
          <input type='radio' class='chat-channel-form__radio-unit' id='chanPrivate' name='unit' value='private' v-model="channelType">Private
        </label>
      </div>

      <label class="chat-channel-form__subtitle" for='password'>Channel password (optional):</label>
      <input class="chat-channel-form__input" type="text" name='password' id='password' placeholder="Password (optionnal)" minlength="8" maxlength="20" v-model="channelPassword" @input="checkPassword()">
      <label class="chat-channel-form__subtitle" for='passwordConfirmation'>Password confirmation:</label>
      <input class="chat-channel-form__input" type="text" name='passwordConfirmation' id='passwordConfirmation' v-model="channelPasswordConf" @input="checkPasswordConf()">

      <button class="button button--create-chan" :disabled="wasSubmitted" type='submit'>Submit</button>
    </form> -->
    </div>
  </div>
  <teleport to="#modals">
      <transition name="fade--error">
        <div v-if="toggleTimer" class="backdrop"></div>
      </transition>
      <transition-group name="zoomin">
        <Modal v-if="toggleTimer && activeChannel" @close="closeModal()">
          <template v-slot:mute-ban-timer>
            <MuteBanTimer :action="toggleTimer" :targetCm="targetCm" :activeChannel="activeChannel" @close="closeModal()" />
          </template>
        </Modal>
      </transition-group>
    </teleport> 
</template>

<script lang="ts">
import { ref, defineComponent, computed, onMounted } from "vue";
import { ChannelMember, ChatApi } from "@/../sdk/typescript-axios-client-generated";
import { socket } from "./ChatComponent.vue"
import { useStore } from 'vuex';
import Modal from "@/components/Modal.vue";
import MuteBanTimer from "@/components/chat/MuteBanTimer.vue";
import { User } from "@/types/User"; 
 
export default defineComponent({
  name: 'ChannelSettings',
  props: ['activeChannel'],
  components: { Modal, MuteBanTimer },
  emits: ["close-settings", "update-channel"],
  setup(props, context) {
    const api = new ChatApi();
    const toggleTimer = ref('');
    const targetCm = ref();
    const mutedMembers = ref(computed(() => props.activeChannel.channel.channel_members
    .filter(function(cm: ChannelMember) {
      return cm.mute;
    })));
    const bannedMembers = ref(computed(() => props.activeChannel.channel.channel_members
    .filter(function(cm: ChannelMember) {
      return cm.ban;
    })));


    const closeChannelSettings = () => {
      context.emit('close-settings')
    }

    const toggleModal = (action: string, cm: ChannelMember) => {
      toggleTimer.value = action; 
      targetCm.value = cm;
    }

    const closeModal = () => {
      toggleTimer.value = '';
      context.emit('update-channel');
    }

    const channelName = ref('');
    const channelType = ref('public');
    const channelPassword = ref('');
    const channelPasswordConf = ref('');
    const user = useStore().state.user;
    const wasSubmitted = ref(false);

    let validName = true;
    let validPassword = true;
    let validPasswordConf = true;

    // const closeModal = () => {
    //   context.emit("close");
    // };

    const checkName = () => {
      const nameInput =  <HTMLInputElement>document.querySelector('input[id=\'chanName\']')!;

      api.getChannelByName(channelName.value)
      .then(() => { 
        nameInput.setCustomValidity("A channel named [" + channelName.value + "] already exists")
        validName = false;
      })
      .catch(() => {
        nameInput.setCustomValidity('');
        validName = true;
        console.log(channelName.value + "not found")
      })
    }

    const checkPassword = () => {
      const passwordInput = <HTMLInputElement>document.querySelector('input#password')!;

      if (!/^[-_*-+/a-zA-Z0-9]*$/.test(channelPassword.value)) {
        passwordInput.setCustomValidity("Channel password must be 8-20 characters long and only contain letters, numbers, or the following symbols -_*-+/");
        validPassword = false;
      } else if (!validPassword) {
        passwordInput.setCustomValidity('');
        validPassword = true;
      }
      if (channelPasswordConf.value)
        checkPasswordConf();
    }

    const checkPasswordConf = () => {
      const passwordConfirmationInput = <HTMLInputElement>document.querySelector('input#passwordConfirmation')!;

      if (channelPasswordConf.value !== channelPassword.value) {
        passwordConfirmationInput.setCustomValidity("Password and password confirmation don't match");
        validPasswordConf = false;
      } else if (!validPasswordConf) {
        passwordConfirmationInput.setCustomValidity('');
        validPasswordConf = true;
      }
    }
  
    const submitInputs = () => {
      checkName();
      checkPassword();
      checkPasswordConf();
      if (!validPassword || !validPasswordConf)
        return;
    
      if (!validName)
        return;

      console.log(channelName.value, channelType.value, channelPassword.value)
      wasSubmitted.value = true;
      const newChannel = api.saveChannel({
        name: channelName.value,
        owner_id: user.id, 
        type: channelType.value,
        password: channelPassword.value
      })
      .then((res) => {
        console.log("in createChannel res", res)
        socket.emit('createChannel', res.data)
      })
      .catch((err) => console.log("Failed to create channel: ", err))
    }

    return {
      channelName,
      channelType,
      channelPassword,
      channelPasswordConf,
      checkName,
      checkPassword,
      checkPasswordConf,
      submitInputs,
      wasSubmitted,
      closeModal,
      selectedTab: ref('all'),

      toggleTimer,
      toggleModal,
      closeChannelSettings,
      targetCm,
      mutedMembers,
      bannedMembers,
    }
  }
});
</script>

<style lang="scss">
  @import "../../../sass/main.scss";
</style>