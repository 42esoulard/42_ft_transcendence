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
        <button
          @click="toggleTab('banned')"
          :class="[
            'button',
            'button--selector',
            selectedTab === 'banned' ? 'button--selector--on' : ''
          ]"
        >
          banned
        </button>
        <!-- <button class='chat-admin-pannel__tab' @click="">Banned</button> -->
        <!-- <button class='chat-admin-pannel__tab' @click="selectedTab = 'muted'">Muted</button> -->
        <button
          @click="toggleTab('muted')"
          :class="[
            'button',
            'button--selector',
            selectedTab === 'muted' ? 'button--selector--on' : ''
          ]"
        >
          muted
        </button>
        <button
          @click="toggleTab('admins')"
          :class="[
            'button',
            'button--selector',
            selectedTab === 'admins' ? 'button--selector--on' : ''
          ]"
        >
          admins
        </button>
        <button
          @click="toggleTab('ownerOptions')"
          v-if="activeChannel.is_owner"
          :class="[
            'button',
            'button--selector',
            selectedTab === 'ownerOptions' ? 'button--selector--on' : ''
          ]"
        >
          ...
        </button>
      </div>
      <div>
        <div v-if="selectedTab !== 'ownerOptions'" class='chat-admin-pannel__users-list'>
          <li v-for="cm in selectedMembers" :key="cm.id" class='chat-admin-pannel__user'>
            <router-link class="link link--neutral" :to="{ name: 'UserProfile', params: {username: cm.member.username} }">
              {{ cm.member.username }}
            </router-link>
            <div v-if="(activeChannel.is_owner && activeChannel.id == cm.id) || (!activeChannel.is_owner && (cm.is_owner || cm.is_admin) && activeChannel.id != cm.id)" class="chat-channels__tag-container">
              <span v-if="cm.is_owner"><img class="fas fa-user-tie chat-channels__tag chat-channels__tag--owner" title="Channel Owner" /></span>
              <span v-if="cm.is_admin"><img class="fas fa-user-shield chat-channels__tag chat-channels__tag--admin" title="Channel Admin" /></span>
            </div>
            <div v-else-if="(activeChannel.is_owner && cm.is_admin) || (activeChannel.is_admin && activeChannel.id == cm.id)" class="chat-channels__tag-container">
              <span @click="toggleAdmin(cm)"><img class="fas fa-user-shield chat-channels__tag chat-channels__tag--admin-togglable" title="Remove from Admins" /></span>
            </div>
            <div v-if="!cm.is_admin">
              <span v-if="activeChannel.is_owner" @click="toggleAdmin(cm)"><img class="fas fa-user-shield chat-channels__tag chat-channels__tag--greyed" title="Promote to Admin" /></span>
              <span v-if="cm.mute" @click="toggleModal('unmute', cm)"><img class="fas fa-comment-slash chat-channels__tag chat-channels__tag--mute" title="Unmute user" /></span>
              <span v-else @click="toggleModal('muted', cm)"><img class="fas fa-comment-slash chat-channels__tag chat-channels__tag--greyed" title="Mute user" /></span>
              <span v-if="cm.ban" @click="toggleModal('unban', cm)"><img class="fas fa-skull-crossbones chat-channels__tag chat-channels__tag--ban" title="Unban user" /></span>
              <span v-else @click="toggleModal('banned', cm)"><img class="fas fa-skull-crossbones chat-channels__tag chat-channels__tag--greyed" title="Ban user" /></span>
            </div>
          </li>
        </div>
        <div v-else>
          <form class="chat-channel-form__form" @submit.prevent='submitInputs()'>
            <label class="chat-channel-form__subtitle" for='password'>New Channel Password (leave empty to for no password):</label>
            <input class="chat-channel-form__input" type="text" name='password' id='password' placeholder="Password" minlength="8" maxlength="20" v-model="channelPassword" @input="checkPassword()">
            <label class="chat-channel-form__subtitle" for='passwordConfirmation'>New Password confirmation:</label>
            <input class="chat-channel-form__input" type="text" name='passwordConfirmation' id='passwordConfirmation' v-model="channelPasswordConf" @input="checkPasswordConf()">

            <button class="button button--create-chan" type='submit'>Submit</button>
          </form>
          <button class="button button--delete-chan" type='submit' @click="deleteChannel()">Delete Channel</button>
        </div>
      </div>
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
import { useStore } from '@/store';
import Modal from "@/components/Modal.vue";
import MuteBanTimer from "@/components/chat/MuteBanTimer.vue";
import { User } from 'sdk/typescript-axios-client-generated';

export default defineComponent({
  name: 'ChannelSettings',
  props: ['activeChannel'],
  components: { Modal, MuteBanTimer },
  emits: ["close-settings", "update-channel", "update-channels-list"],
  setup(props, context) {
    const api = new ChatApi();
    const toggleTimer = ref('');
    const targetCm = ref();
    const selectedTab = ref('all');
    const allMembers = ref(computed(() => props.activeChannel.channel.channel_members
    .sort((a: ChannelMember, b: ChannelMember) => a.id - b.id )));
  
    let selectedMembers = computed(() => {
      const list = ref();
      if (selectedTab.value === 'banned') {
        list.value = allMembers.value.filter((cm: ChannelMember) => cm.ban)
      } else if (selectedTab.value === 'muted') {
        list.value = allMembers.value.filter((cm: ChannelMember) => cm.mute)
      } else if (selectedTab.value === 'admins') {
        list.value = allMembers.value.filter((cm: ChannelMember) => cm.is_admin)
      } else {
        list.value = allMembers.value;
      }
      return list.value;
    });

    const toggleTab = (tab: string) => {
      switch (tab) {
        case 'banned':
          if (selectedTab.value === 'banned') {
            selectedTab.value = 'all';
          } else {
            selectedTab.value = 'banned';
          }
          break;
        case 'muted':
          console.log("bef", tab, selectedTab.value);
          if (selectedTab.value === 'muted') {
            selectedTab.value = 'all';
          } else {
            selectedTab.value = 'muted';
          }
          console.log("aft", tab, selectedTab.value);
          break;
        case 'admins':
          console.log("bef", tab, selectedTab.value);
          if (selectedTab.value === 'admins') {
            selectedTab.value = 'all';
          } else {
            selectedTab.value = 'admins';
          }
          break;
        case 'ownerOptions':
          if (selectedTab.value === 'ownerOptions') {
            selectedTab.value = 'all';
          } else {
            selectedTab.value = 'ownerOptions';
          }
          break;
      }

    };


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

    const toggleAdmin = async (cm: ChannelMember) => {
      await api.toggleAdmin(cm.id)
      .then(() => {
        targetCm.value = cm;
        context.emit('update-channels-list');
        if (cm.id == props.activeChannel.id) {
          closeChannelSettings();
        }
      })
    }

    const deleteChannel = async () => {
      await api.deleteChannel(props.activeChannel.channel.id)
      .then(() => {
        // targetCm.value = cm;
        context.emit('update-channels-list');
        closeChannelSettings();
      })
    }

    

    // const channelName = ref('');
    // const channelType = ref('public');
    const channelPassword = ref('');
    const channelPasswordConf = ref('');
    // const user = useStore().state.user;
    const wasSubmitted = ref(false);

    // let validName = true;
    let validPassword = true;
    let validPasswordConf = true;

    // // const closeModal = () => {
    // //   context.emit("close");
    // // };

    // const checkName = () => {
    //   const nameInput =  <HTMLInputElement>document.querySelector('input[id=\'chanName\']')!;

    //   api.getChannelByName(channelName.value)
    //   .then(() => {
    //     nameInput.setCustomValidity("A channel named [" + channelName.value + "] already exists")
    //     validName = false;
    //   })
    //   .catch(() => {
    //     nameInput.setCustomValidity('');
    //     validName = true;
    //     console.log(channelName.value + "not found")
    //   })
    // }

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
      // checkName();
      checkPassword();
      checkPasswordConf();
      if (!validPassword || !validPasswordConf)
        return;

      wasSubmitted.value = true;
      const pwd = (channelPassword.value? channelPassword.value : 'null');
      const newChannel = api.updateChannelPassword(
        props.activeChannel.channel.id, pwd
      )
      .then((res) => {
        console.log("in updateChannel res", res)
        // socket.emit('createChannel', res.data)
        context.emit('update-channels-list');
        closeChannelSettings();
      })
      .catch((err) => console.log("Failed to update channel: ", err))
    }

    return {
      // channelName,
      // channelType,
      deleteChannel,
      channelPassword,
      channelPasswordConf,
      // checkName,
      checkPassword,
      checkPasswordConf,
      submitInputs,
      wasSubmitted,
      closeModal,

      selectedTab,
      selectedMembers,

      toggleTimer,
      toggleModal,
      closeChannelSettings,
      targetCm,
      toggleTab,
      toggleAdmin,
    }
  }
});
</script>

<style lang="scss">
  @import "../../../sass/main.scss";
</style>
