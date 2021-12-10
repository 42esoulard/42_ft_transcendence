<template>
  <!--
    - Name? [check it doesn't exist yet in db]
    - Type [radio buttons]: public? Private (newcomers must be invited by a member)?
    - If password-protected: [check regex OK, check password match]
      1) please enter a password for the room (a-zA-Z0-9/*-+_):
      2) please re-enter the password:
  -->
  <div class="chat-box">
    <div v-if="activeChannel" class="chat-header">
      <div class="chat-header__return" @click="toggleChannelsList">
        <i class="fa fa-list fa-2x"></i>
      </div>
      <div
        class="chat-header__channel-name"
        :title="activeChannel.channel.name"
        @click="closeChannelSettings()"
      >
        {{ activeChannel.channel.name }}
      </div>
      <div>
        <span v-if="activeChannel.channel.type === 'private'"
          ><img
            class="fas fa-eye-slash chat-channels__tag chat-channels__tag--private"
            title="This community is private"
        /></span>
        <span v-if="activeChannel.channel.password"
          ><img
            class="fas fa-lock chat-channels__tag chat-channels__tag--locked"
            title="This channel is password-protected"
        /></span>
      </div>
      <div
        v-if="
          activeChannel.is_admin ||
          activeChannel.is_owner ||
          activeChannel.member.role == 'admin' ||
          activeChannel.member.role == 'owner'
        "
        class="chat-channels__tag-container"
      >
        <span v-if="activeChannel.is_owner"
          ><img
            class="fas fa-user-tie chat-channels__tag chat-channels__tag--owner"
            title="Channel Owner"
        /></span>
        <span v-if="activeChannel.is_admin"
          ><img
            class="fas fa-user-shield chat-channels__tag chat-channels__tag--admin"
            title="Channel Admin"
        /></span>
        <span @click="closeChannelSettings()"
          ><img
            class="fas fa-lg fa-arrow-left chat-channels__tag chat-channels__tag--settings"
            title="Back to Channel"
        /></span>
      </div>
      <span></span>
    </div>

    <div>
      <div class="chat-admin-pannel__tabs">
        <button
          @click="toggleTab('banned')"
          :class="[
            'button',
            'button--selector',
            selectedTab === 'banned' ? 'button--selector--on' : '',
          ]"
        >
          banned
        </button>
        <button
          @click="toggleTab('muted')"
          :class="[
            'button',
            'button--selector',
            selectedTab === 'muted' ? 'button--selector--on' : '',
          ]"
        >
          muted
        </button>
        <button
          @click="toggleTab('admins')"
          :class="[
            'button',
            'button--selector',
            selectedTab === 'admins' ? 'button--selector--on' : '',
          ]"
        >
          admins
        </button>
        <button
          @click="toggleTab('ownerOptions')"
          v-if="
            activeChannel.channel.name !== 'General' &&
            (activeChannel.is_owner ||
              user.role == 'admin' ||
              user.role == 'owner')
          "
          :class="[
            'button',
            'button--selector',
            selectedTab === 'ownerOptions' ? 'button--selector--on' : '',
          ]"
          title="Owner Pannel"
        >
          <img
            class="fas fa-user-tie chat-channels__tag chat-channels__tag--owner"
            title="Owner Pannel"
          />
        </button>
      </div>
      <div>
        <div
          v-if="selectedTab !== 'ownerOptions'"
          class="chat-admin-pannel__users-list"
        >
          <li
            v-for="cm in selectedMembers"
            :key="cm.id"
            class="chat-admin-pannel__user"
          >
            <router-link
              class="link link--neutral"
              :to="{
                name: 'UserProfile',
                params: { username: cm.member.username },
              }"
            >
              {{ cm.member.username }}
            </router-link>
            <div
              v-if="
                (activeChannel.is_owner && activeChannel.id == cm.id) ||
                (!activeChannel.is_owner &&
                  user.role == 'user' &&
                  (cm.is_owner || cm.is_admin) &&
                  activeChannel.id != cm.id) ||
                (activeChannel.is_owner && cm.is_owner)
              "
              class="chat-channels__tag-container"
            >
              <span v-if="cm.is_owner"
                ><img
                  class="fas fa-user-tie chat-channels__tag chat-channels__tag--owner"
                  title="Channel Owner"
              /></span>
              <span v-if="cm.is_admin"
                ><img
                  class="fas fa-user-shield chat-channels__tag chat-channels__tag--admin"
                  title="Channel Admin"
              /></span>
            </div>
            <div
              v-else-if="
                ((activeChannel.is_owner ||
                  user.role == 'owner' ||
                  user.role == 'admin') &&
                  cm.is_admin) ||
                (activeChannel.is_admin && activeChannel.id == cm.id)
              "
              class="chat-channels__tag-container"
            >
              <span @click="askConfirmation(cm, 'deadminize')"
                ><img
                  class="fas fa-user-shield chat-channels__tag chat-channels__tag--admin-togglable"
                  title="Remove from Admins"
              /></span>
            </div>
            <div v-if="!cm.is_admin">
              <span
                v-if="
                  activeChannel.is_owner ||
                  user.role == 'owner' ||
                  user.role == 'admin'
                "
                @click="askConfirmation(cm, 'adminize')"
                ><img
                  class="fas fa-user-shield chat-channels__tag chat-channels__tag--greyed"
                  title="Promote to Admin"
              /></span>
              <span v-if="cm.mute" @click="toggleModal('unmute', cm)"
                ><img
                  class="fas fa-comment-slash chat-channels__tag chat-channels__tag--mute"
                  title="Unmute user"
              /></span>
              <span v-else @click="toggleModal('muted', cm)"
                ><img
                  class="fas fa-comment-slash chat-channels__tag chat-channels__tag--greyed"
                  title="Mute user"
              /></span>
              <span v-if="cm.ban" @click="toggleModal('unban', cm)"
                ><img
                  class="fas fa-skull-crossbones chat-channels__tag chat-channels__tag--ban"
                  title="Unban user"
              /></span>
              <span v-else @click="toggleModal('banned', cm)"
                ><img
                  class="fas fa-skull-crossbones chat-channels__tag chat-channels__tag--greyed"
                  title="Ban user"
              /></span>
              <span @click="askConfirmation(cm, 'kick')"
                ><img
                  class="fas fa-user-times chat-channels__tag chat-channels__tag--greyed"
                  title="Kick user"
              /></span>
            </div>
          </li>
          <form
            v-if="selectedTab == 'all'"
            class="chat-channel-form__add-member"
            @submit.prevent="considerMember()"
          >
            <input
              class="chat-channel-form__input chat-channel-form__add-member-input"
              required
              type="text"
              name="name"
              id="usernameInput"
              placeholder="Enter the user's username"
              minlength="1"
              maxlength="200"
              v-model="username"
              @input="checkUsername()"
            />
            <button class="button button--create-chan" for="name">
              <i class="fa fa-user-plus"></i>
            </button>
          </form>
        </div>
        <div v-else class="chat-channel-form__form">
          <form
            class="chat-channel-form__form"
            @submit.prevent="submitInputs()"
          >
            <label class="chat-channel-form__subtitle" for="password"
              >New Channel Password (leave empty to for no password):</label
            >
            <input
              class="chat-channel-form__input"
              type="text"
              name="password"
              id="password"
              placeholder="Password"
              minlength="8"
              maxlength="20"
              v-model="channelPassword"
              @input="checkPassword()"
            />
            <label
              class="chat-channel-form__subtitle"
              for="passwordConfirmation"
              >New Password confirmation:</label
            >
            <input
              class="chat-channel-form__input"
              type="text"
              name="passwordConfirmation"
              id="passwordConfirmation"
              v-model="channelPasswordConf"
              @input="checkPasswordConf()"
            />

            <button class="button button--create-chan" type="submit">
              Submit
            </button>
          </form>
          <button
            class="button button--fourth"
            @click="askConfirmation(activeChannel, 'delete')"
          >
            Delete Channel
          </button>
        </div>
      </div>
    </div>
  </div>
  <teleport to="#modals">
    <transition name="fade--error">
      <div v-if="toggleTimer || toggleConfirmation" class="backdrop"></div>
    </transition>
    <transition-group name="zoomin">
      <Modal v-if="toggleTimer && activeChannel" @close="closeModal()">
        <template v-slot:mute-ban-timer>
          <MuteBanTimer
            :action="toggleTimer"
            :targetCm="targetCm"
            :activeChannel="activeChannel"
            @close="closeModal()"
            @update-mute-ban="updateMuteBan"
          />
        </template>
      </Modal>
      <Modal v-if="toggleConfirmation && activeChannel" @close="closeModal()">
        <template v-slot:confirmation>
          <Confirmation
            :action="toggleConfirmation"
            :targetCm="targetCm"
            :target="target"
            :activeChannel="activeChannel"
            @close="closeModal()"
            @confirm="executeAction"
          />
        </template>
      </Modal>
    </transition-group>
  </teleport>
</template>

<script lang="ts">
import { ref, defineComponent, computed } from "vue";
import {
  ChannelMember,
  ChatApi,
  UserApi,
} from "@/../sdk/typescript-axios-client-generated";
import { chatSocket } from "@/App.vue";
import { useStore } from "@/store";
import Modal from "@/components/Modal.vue";
import MuteBanTimer from "@/components/chat/MuteBanTimer.vue";
import Confirmation from "@/components/chat/Confirmation.vue";

export default defineComponent({
  name: "ChannelSettings",
  props: ["activeChannel"],
  components: { Modal, MuteBanTimer, Confirmation },
  emits: [
    "close-settings",
    "toggle-channels-list",
    "update-channel",
    "update-channels-list",
    "deleted-channel",
    "post-message",
  ],
  setup(props, context) {
    const api = new ChatApi();
    const userApi = new UserApi();
    const store = useStore();
    const user = computed(() => store.state.user);

    const toggleTimer = ref("");
    const toggleConfirmation = ref("");
    const target = ref("");
    const username = ref("");
    const targetCm = ref();
    const selectedTab = ref("all");
    const allMembers = ref(
      computed(() =>
        props.activeChannel.channel.channel_members.sort(
          (a: ChannelMember, b: ChannelMember) => a.id - b.id
        )
      )
    );

    const askConfirmation = (cm: ChannelMember, action: string) => {
      targetCm.value = cm;
      target.value = action == "delete" ? "channel" : "user";
      toggleConfirmation.value = action;
    };

    const executeAction = (cm: ChannelMember, action: string) => {
      toggleConfirmation.value = "";
      switch (action) {
        case "adminize":
          toggleAdmin(cm);
          break;
        case "deadminize":
          toggleAdmin(cm);
          break;
        case "kick":
          kickMember(cm);
          break;
        case "delete":
          deleteChannel();
          break;
        default:
          console.log("You can't do that!!!");
      }
    };

    let selectedMembers = computed(() => {
      const list = ref();
      if (selectedTab.value === "banned") {
        list.value = allMembers.value.filter((cm: ChannelMember) => cm.ban);
      } else if (selectedTab.value === "muted") {
        list.value = allMembers.value.filter((cm: ChannelMember) => cm.mute);
      } else if (selectedTab.value === "admins") {
        list.value = allMembers.value.filter(
          (cm: ChannelMember) => cm.is_admin
        );
      } else {
        list.value = allMembers.value;
      }
      return list.value;
    });

    const toggleTab = (tab: string) => {
      switch (tab) {
        case "banned":
          if (selectedTab.value === "banned") {
            selectedTab.value = "all";
          } else {
            selectedTab.value = "banned";
          }
          break;
        case "muted":
          if (selectedTab.value === "muted") {
            selectedTab.value = "all";
          } else {
            selectedTab.value = "muted";
          }
          break;
        case "admins":
          if (selectedTab.value === "admins") {
            selectedTab.value = "all";
          } else {
            selectedTab.value = "admins";
          }
          break;
        case "ownerOptions":
          if (selectedTab.value === "ownerOptions") {
            selectedTab.value = "all";
          } else {
            selectedTab.value = "ownerOptions";
          }
          break;
      }
    };

    const closeChannelSettings = () => {
      context.emit("close-settings");
    };

    const toggleChannelsList = () => {
      context.emit("toggle-channels-list");
    };

    const toggleModal = (action: string, cm: ChannelMember) => {
      toggleTimer.value = action;
      targetCm.value = cm;
    };

    const closeModal = () => {
      toggleTimer.value = "";
      toggleConfirmation.value = "";
    };

    const updateMuteBan = async (
      action: string,
      cmId: number,
      endDate: number
    ) => {
      await api
        .muteBanMember(action, cmId, endDate, { withCredentials: true })
        .then((res) => {
          if (!res) {
            return;
          }
          targetCm.value = res.data;
          context.emit("update-channels-list");

          if (action == "unmute") {
            action = "unmuted";
          } else if (action == "unban") {
            action = "unbanned";
          }
          chatSocket.emit(
            "chat-action",
            action + " from",
            res.data.member.id,
            res.data.channel.name
          );
          chatSocket.emit("update-channels");
          context.emit(
            "post-message",
            res.data.member.username +
              " has been " +
              action +
              " from this channel"
          );
          store.dispatch(
            "setMessage",
            res.data.member.username.substring(0, 15) +
              " has been " +
              action +
              " from [" +
              res.data.channel.name.substring(0, 15) +
              "]"
          );
          if (action === "muted") {
            setTimeout(() => {
              updateMuteBan("unmute", cmId, endDate);
            }, endDate - Date.now());
          } else if (action === "banned") {
            setTimeout(
              () => updateMuteBan("unban", cmId, endDate),
              endDate - Date.now()
            );
          }
          closeModal();
        })
        .catch((err) => {
          closeModal();
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    };

    const toggleAdmin = async (cm: ChannelMember) => {
      await api
        .toggleAdmin(cm.id, { withCredentials: true })
        .then((res) => {
          targetCm.value = cm;
          context.emit("update-channels-list");
          chatSocket.emit("update-channels");
          if (res.data.is_admin) {
            context.emit(
              "post-message",
              res.data.member.username + " is now an admin for this channel"
            );
            chatSocket.emit(
              "chat-action",
              "made an admin for",
              res.data.member.id,
              res.data.channel.name
            );
            store.dispatch(
              "setMessage",
              "[" +
                res.data.member.username.substring(0, 15) +
                "] is now an admin in channel [" +
                res.data.channel.name.substring(0, 15) +
                "]"
            );
          } else {
            context.emit(
              "post-message",
              res.data.member.username +
                " is no longer an admin for this channel"
            );
            chatSocket.emit(
              "chat-action",
              "removed admin privileges from",
              res.data.member.id,
              res.data.channel.name
            );
            store.dispatch(
              "setMessage",
              "[" +
                res.data.member.username.substring(0, 15) +
                "] is no longer an admin in channel [" +
                res.data.channel.name.substring(0, 15) +
                "]"
            );
          }
          if (cm.id == props.activeChannel.id) {
            closeChannelSettings();
          }
        })
        .catch((err) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    };

    const deleteChannel = async () => {
      const members = props.activeChannel.channel.channel_members.map(
        (cm: ChannelMember) => cm.member.id
      );
      const chanName = props.activeChannel.channel.name;
      await api
        .deleteChannel(props.activeChannel.channel.id, {
          withCredentials: true,
        })
        .then(() => {
          context.emit("deleted-channel");
          chatSocket.emit(
            "chat-action-del",
            "[" + chanName.substring(0, 15) + "] has been deleted.",
            members
          );
          closeChannelSettings();
        })
        .catch((err) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    };

    let usernames = <string[]>[];

    const getUserNames = () => {
      return userApi
        .getUsers({ withCredentials: true })
        .then((res) => {
          usernames = res.data.map((user) => user.username);
        })
        .catch((err) => {
          {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          }
        });
    };
    getUserNames();

    let validUsername = true;
    const checkUsername = () => {
      const usernameInput = <HTMLInputElement>(
        document.querySelector("input[id='usernameInput']")!
      );

      if (usernames.includes(username.value)) {
        usernameInput.setCustomValidity("");
        validUsername = true;
      } else {
        usernameInput.setCustomValidity("User doesn't exist");
        validUsername = false;
      }
      usernameInput.reportValidity();
    };

    const checkUsernameInDb = () => {
      const usernameInput = <HTMLInputElement>(
        document.querySelector("input[id='usernameInput']")!
      );

      return userApi
        .getUserByUsername(username.value, { withCredentials: true })
        .then((res) => {
          usernameInput.setCustomValidity("");
          validUsername = true;
          usernameInput.reportValidity();
          return res.data.id;
        })
        .catch(() => {
          usernameInput.setCustomValidity("User doesn't exist");
          validUsername = false;
          usernameInput.reportValidity();
          return -1;
        });
    };

    const addMember = async (userId: number) => {
      wasSubmitted.value = true;
      if (
        props.activeChannel.channel.channel_members
          .map((cm: ChannelMember) => cm.member.id)
          .includes(userId)
      ) {
        store.dispatch("setErrorMessage", "Already a member!");
        return;
      }
      const newMember = api
        .joinChannel("added", props.activeChannel.channel.id, userId, {
          withCredentials: true,
        })
        .then((res) => {
          chatSocket.emit("update-channels");
          context.emit("update-channels-list");
          chatSocket.emit(
            "chat-action",
            "added to",
            userId,
            props.activeChannel.channel.name
          );
          username.value = "";
          wasSubmitted.value = false;

          setTimeout(() => {
            context.emit(
              "post-message",
              res.data.member.username + " has been added"
            );
          }, 500);
        })
        .catch((err) => {
          {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          }
          wasSubmitted.value = false;
        });
    };

    const considerMember = async () => {
      await checkUsernameInDb().then((res) => {
        if (!validUsername) return;
        addMember(res);
      });
    };

    const kickMember = async (cm: ChannelMember) => {
      wasSubmitted.value = true;
      const exMemberName = cm.member.username;
      const exMemberId = cm.member.id;
      const newMember = api
        .leaveChannel("kick", cm.id, { withCredentials: true })
        .then((res) => {
          chatSocket.emit(
            "chat-action",
            "kicked from",
            exMemberId,
            props.activeChannel.channel.name
          );
          context.emit("update-channels-list");
          wasSubmitted.value = false;
          context.emit(
            "post-message",
            exMemberName + " has been kicked from this channel"
          );
          store.dispatch(
            "setMessage",
            "[" +
              exMemberName.substring(0, 15) +
              "] has been kicked from channel [" +
              props.activeChannel.channel.name.substring(0, 15) +
              "]"
          );
          chatSocket.emit("update-channels");
        })
        .catch((err) => {
          {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          }
          wasSubmitted.value = false;
        });
    };

    const channelPassword = ref("");
    const channelPasswordConf = ref("");
    const wasSubmitted = ref(false);

    let validPassword = true;
    let validPasswordConf = true;

    const checkPassword = () => {
      const passwordInput = <HTMLInputElement>(
        document.querySelector("input#password")!
      );

      if (!/^[-_*-+/a-zA-Z0-9]*$/.test(channelPassword.value)) {
        passwordInput.setCustomValidity(
          "Channel password must be 8-20 characters long and only contain letters, numbers, or the following symbols -_*-+/"
        );
        validPassword = false;
      } else if (!validPassword) {
        passwordInput.setCustomValidity("");
        validPassword = true;
      }
      if (channelPasswordConf.value) checkPasswordConf();
    };

    const checkPasswordConf = () => {
      const passwordConfirmationInput = <HTMLInputElement>(
        document.querySelector("input#passwordConfirmation")!
      );

      if (channelPasswordConf.value !== channelPassword.value) {
        passwordConfirmationInput.setCustomValidity(
          "Password and password confirmation don't match"
        );
        validPasswordConf = false;
      } else if (!validPasswordConf) {
        passwordConfirmationInput.setCustomValidity("");
        validPasswordConf = true;
      }
    };

    const submitInputs = () => {
      checkPassword();
      checkPasswordConf();
      if (!validPassword || !validPasswordConf) return;

      wasSubmitted.value = true;
      const pwd = channelPassword.value ? channelPassword.value : "null";
      const newChannel = api
        .updateChannelPassword(props.activeChannel.channel.id, pwd, {
          withCredentials: true,
        })
        .then((res) => {
          context.emit("update-channels-list");
          chatSocket.emit("update-channels");
          if (res.data.password) {
            context.emit("post-message", "Channel password has been modified");
            store.dispatch(
              "setMessage",
              "[" +
                res.data.name.substring(0, 15) +
                "]'s password has been edited"
            );
          } else {
            context.emit("post-message", "Channel is now password-free");
            store.dispatch(
              "setMessage",
              "[" +
                res.data.name.substring(0, 15) +
                "] is now a password free community"
            );
          }
          closeChannelSettings();
        })
        .catch((err) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    };

    return {
      deleteChannel,
      channelPassword,
      channelPasswordConf,
      checkPassword,
      checkPasswordConf,
      submitInputs,
      wasSubmitted,
      closeModal,

      selectedTab,
      selectedMembers,

      toggleTimer,
      toggleConfirmation,
      askConfirmation,
      executeAction,
      toggleModal,
      closeChannelSettings,
      targetCm,
      target,
      toggleTab,
      toggleAdmin,
      updateMuteBan,

      user,
      username,
      checkUsername,
      considerMember,
      kickMember,

      toggleChannelsList,
    };
  },
});
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>
