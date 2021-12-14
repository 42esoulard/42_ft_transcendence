<template>
  <div class="profile-left-info">
    <div class="profile-left__avatar-div">
      <img
        v-if="user.id === self.id"
        :src="self.avatar"
        class="profile-left__avatar-img"
        alt=""
      />
      <img v-else :src="user.avatar" class="profile-left__avatar-img" alt="" />
    </div>
    <span class="profile-left__name">{{ user.username }} </span>
    <span class="profile-left__since">member since {{ formatedDate }}</span>
    <span
      v-if="userStatus(user) == 'online' && relationState(user) >= -1"
      class="profile-left__status"
      ><i class="status status--online fas fa-circle" /> online</span
    >
    <span
      v-else-if="userStatus(user) == 'offline' && relationState(user) >= -1"
      class="profile-left__status"
      ><i class="status status--offline fas fa-circle" /> offline</span
    >
    <span
      v-else-if="userStatus(user) == 'ingame' && relationState(user) >= -1"
      class="profile-left__status"
      ><i class="status status--in-game fas fa-circle" /> in game</span
    >
  </div>
  <div v-if="relationState(user) >= 0" class="profile-left__social">
    <button
      v-if="relationState(user) == 0"
      @click="addFriend(user)"
      class="button button--third"
    >
      <i class="upload-icon fas fa-user-plus" /> add friend
    </button>
    <button
      v-else-if="relationState(user) == 1"
      @click="removeFriend(user)"
      class="button button--third"
    >
      <i class="upload-icon fas fa-user-minus" /> remove friend
    </button>
    <button
      v-else-if="relationState(user) == 2"
      @click="acceptFriend(user)"
      class="button button--third"
    >
      <i class="upload-icon fas fa-user-plus" /> accept invitation
    </button>
    <button
      v-else-if="relationState(user) == 3"
      @click="removeFriend(user)"
      class="button button--third"
    >
      <i class="upload-icon fas fa-user-times" /> cancel invitation
    </button>
    <button
      v-if="user.id != self.id"
      @click="sendDM(user)"
      class="button button--primary"
    >
      <i class="upload-icon fas fa-envelope" /> send message
    </button>
    <button
      v-if="
        user.id != self.id &&
        userStatus(user) == 'online' &&
        userStatus(self) == 'online'
      "
      @click="challengeUser"
      class="button button--primary"
    >
      <i class="upload-icon fas fa-table-tennis" /> invite game
    </button>
    <button
      v-if="relationState(user) == 4"
      @click="unblock(user)"
      class="button button--grey"
    >
      <i class="upload-icon fas fa-ban" /> unblock
    </button>
    <button v-else @click="block(user)" class="button button--grey">
      <i class="upload-icon fas fa-ban" /> block
    </button>
  </div>
  <div v-else-if="user.id == self.id" class="profile-left__social">
    <button @click="toggleModal(2)" class="button button--primary">
      Edit profile info
    </button>
    <button
      v-if="!self.two_fa_enabled"
      class="button button--third"
      @click="toggleModal(1)"
    >
      Enable 2FA
    </button>
    <button v-else class="button button--third" @click="deactivateTwoFactor">
      Disable 2FA
    </button>
    <teleport to="#modals">
      <transition name="fade--error">
        <div v-if="showBackdrop" class="backdrop"></div>
      </transition>
      <transition name="zoomin">
        <Modal v-if="showModal" @close="toggleModal(1)">
          <template v-slot:twofa>
            <InitTwoFactor @close="toggleModal(1)" />
          </template>
        </Modal>
      </transition>
      <transition name="zoomin">
        <Modal v-if="showModal2" @close="toggleModal(2)">
          <!-- v-if instead v-show to reset avatar and errors in modal -->
          <template v-slot:edit-user>
            <EditUser @close="toggleModal(2)" />
          </template>
        </Modal>
      </transition>
    </teleport>
  </div>
  <div v-else-if="relationState(user) == -2" class="profile-left__blocked-msg">
    {{ user.username }} blocked you
  </div>
  <div v-else-if="relationState(user) == -3" class="profile-left__blocked-msg">
    {{ user.username }} has been banned
  </div>

  <teleport to="#modals">
    <transition name="fade--error">
      <div v-if="toggleConfirm" class="backdrop"></div>
    </transition>
    <transition-group name="zoomin">
      <Modal v-if="toggleConfirm" @close="toggleModal">
        <template v-slot:confirmation>
          <Confirm
            :action="toggleConfirm"
            :target="target"
            @close="toggleModalBis"
            @confirm="executeAction"
          />
        </template>
      </Modal>
    </transition-group>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, PropType } from "vue";
import moment from "moment";
import { User, Relationship } from "sdk/typescript-axios-client-generated";
import {
  useRelationshipApi,
  useAuthApi,
  useUserApi,
} from "@/plugins/api.plugin";
import { useStore } from "@/store";
import InitTwoFactor from "@/components/InitTwoFactor.vue";
import EditUser from "@/components/EditUser.vue";
import Modal from "@/components/Modal.vue";
import Confirm from "@/components/Confirm.vue";
import { chatSocket, presenceSocket } from "@/App.vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "ProfileLeft",
  props: {
    user: {
      type: Object as PropType<User>,
      required: true,
    },
  },
  components: { Modal, InitTwoFactor, EditUser, Confirm },
  setup(props) {
    const store = useStore();
    const router = useRouter();
    const user = props.user;
    const userFriendships = ref<Relationship[]>([]);
    const userBlocked = ref<Relationship[]>([]);
    const relationshipApi = useRelationshipApi();
    const authApi = useAuthApi();
    const userApi = useUserApi();
    const showModal = ref(false);
    const showModal2 = ref(false);
    const toggleConfirm = ref("");
    const target = ref();
    const formatedDate = computed(() => {
      return moment(user.created_at).format("MM-DD-YYYY");
    });
    const userStatus = (user: User): "online" | "offline" | "ingame" => {
      if (user != undefined) {
        const inGameUser = store.state.inGameUsers.find(
          (u) => u === user.username
        );
        const onlineUser = store.state.onlineUsers.find(
          (u) => u.id === user.id
        );
        if (inGameUser) {
          return "ingame";
        } else if (onlineUser) {
          return "online";
        }
      }
      return "offline";
    };

    onMounted(() => {
      showModal2.value = store.state.firstTimeConnect;
      if (store.state.user.id != 0) {
        relationshipApi
          .getAllUserFriendships(store.state.user.id)
          .then((res: any) => (userFriendships.value = res.data))
          .catch((err: any) => {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          });
        relationshipApi
          .getUserBlocked(store.state.user.id)
          .then((res: any) => (userBlocked.value = res.data))
          .catch((err: any) => {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          });
      }
    });

    const deactivateTwoFactor = async () => {
      authApi
        .turnOffTwoFactorAuthentication({ withCredentials: true })
        .then((res: any) => {
          store.commit("toggleTwoFactor", false);
          store.dispatch("setMessage", res.data.message);
        })
        .catch((err) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    };

    const toggleModal = (nbr: number) => {
      if (nbr === 1) {
        showModal.value = !showModal.value;
      } else {
        showModal2.value = !showModal2.value;
        if (store.state.firstTimeConnect === true)
          store.commit("setFirstTimeConnect", false);
      }
    };

    const showBackdrop = computed(() => {
      return showModal.value || showModal2.value;
    });

    const logOut = async () => {
      authApi
        .logout({ withCredentials: true })
        .then((response) => {
          presenceSocket.emit("closeConnection", store.state.user);
          store.commit("resetUser"); //store.state.user = null;
          router.push("/login");
        })
        .catch((err: any) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    };

    const addFriend = async (user: User) => {
      if (store.state.user.id != 0) {
        await relationshipApi
          .saveRelationship(
            {
              requesterId: store.state.user.id,
              adresseeId: user.id,
            },
            {
              withCredentials: true,
            }
          )
          .then((res: any) => {
            userFriendships.value.push(res.data);
            chatSocket.emit(
              "newFriendshipRequest",
              res.data,
              store.state.user.username
            );
          })
          .catch((err: any) => {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          });
      }
    };

    const updateSidebar = () => {
      store.state.toggleFriendship = false;

      for (const friendship of userFriendships.value) {
        if (friendship.pending && friendship.adresseeId == store.state.user.id)
          store.state.toggleFriendship = true;
      }
    };

    const removeFriend = async (user: User) => {
      if (store.state.user.id != 0) {
        await relationshipApi
          .removeRelationship(
            {
              userId1: user.id,
              userId2: store.state.user.id,
            },
            {
              withCredentials: true,
            }
          )
          .then((res: any) => {
            let index = 0;
            for (const friendship of userFriendships.value) {
              if (
                friendship.requesterId == user.id ||
                friendship.adresseeId == user.id
              ) {
                userFriendships.value.splice(index, 1);
                chatSocket.emit(
                  "removeFriendship",
                  user.id,
                  store.state.user.id
                );
                updateSidebar();
                break;
              }
              index++;
            }
          })
          .catch((err: any) => {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          });
      }
    };

    const acceptFriend = async (user: User) => {
      if (store.state.user.id != 0) {
        await relationshipApi
          .validateRelationship(
            {
              requesterId: user.id,
              adresseeId: store.state.user.id,
            },
            {
              withCredentials: true,
            }
          )
          .then((res: any) => {
            for (const friendship of userFriendships.value) {
              if (friendship.requesterId == user.id) {
                friendship.pending = false;
                chatSocket.emit(
                  "acceptFriendship",
                  user.id,
                  user.username,
                  store.state.user.id,
                  store.state.user.username
                );
              }
            }
          })
          .catch((err: any) => {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          });
      }
    };

    chatSocket.on("addFriendship", (relationship: Relationship) => {
      userFriendships.value.push(relationship);
    });

    chatSocket.on("updateFriendship", (friendId: number) => {
      let index = 0;
      for (const friendship of userFriendships.value) {
        if (
          friendship.adresseeId == friendId ||
          friendship.requesterId == friendId
        ) {
          friendship.pending = false;
          break;
        }
        index++;
      }
    });

    chatSocket.on("rmFriendship", (friendId: number) => {
      let index = 0;
      for (const friendship of userFriendships.value) {
        if (
          friendship.adresseeId == friendId ||
          friendship.requesterId == friendId
        ) {
          userFriendships.value.splice(index, 1);
          break;
        }
        index++;
      }
    });

    // 1 == friends, 2 == self invited, 3 == other invited, 0 == no relationship
    // 4 == blocked && self is requester, -2 == blocked && self is adressee
    // -3 == banned
    const relationState = (user: User) => {
      if (store.state.user.id === 0 || user.id === store.state.user.id)
        return -1;

      if (user.banned) return -3;

      for (const relationship of userFriendships.value) {
        if (user.id == relationship.requesterId) {
          if (relationship.pending) return 2;
          return 1;
        } else if (user.id == relationship.adresseeId) {
          if (relationship.pending) return 3;
          return 1;
        }
      }

      for (const relationship of userBlocked.value) {
        if (
          store.state.user.id == relationship.requesterId &&
          relationship.adresseeId == user.id
        )
          return 4;
        if (
          store.state.user.id == relationship.adresseeId &&
          relationship.requesterId == user.id
        )
          return -2;
      }

      return 0;
    };

    const block = async (user: User) => {
      if (store.state.user.id != 0) {
        await relationshipApi
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
          .then((res: any) => {
            userBlocked.value.push(res.data);
            userFriendships.value = userFriendships.value.filter(
              (fr: Relationship) =>
                fr.adresseeId != user.id && fr.requesterId != user.id
            );
            chatSocket.emit("newBlocked", res.data, user.username);
          })
          .catch((err: any) => {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          });
      }
    };

    const unblock = async (user: User) => {
      if (store.state.user.id != 0) {
        await relationshipApi
          .removeRelationship(
            {
              userId1: user.id,
              userId2: store.state.user.id,
            },
            {
              withCredentials: true,
            }
          )
          .then((res: any) => {
            let index = 0;
            for (const blocked of userBlocked.value) {
              if (
                blocked.requesterId == user.id ||
                blocked.adresseeId == user.id
              ) {
                userBlocked.value.splice(index, 1);
                chatSocket.emit("removeBlocked", store.state.user, user.id);
                break;
              }
              index++;
            }
          })
          .catch((err: any) => {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          });
      }
    };

    chatSocket.on("newBlocked", (blocked) => {
      if (store.state.user.id == blocked[0].adresseeId) {
        userBlocked.value.push(blocked[0]);
        userFriendships.value = userFriendships.value.filter(
          (fr: Relationship) =>
            fr.requesterId != blocked[0].requesterId &&
            fr.adresseeId != blocked[0].requesterId
        );
      }
    });

    chatSocket.on("removeBlocked", (infos) => {
      if (store.state.user.id == infos[1]) {
        userBlocked.value = userBlocked.value.filter(
          (blocked: Relationship) => blocked.requesterId != infos[0].id
        );
      }
    });

    const challengeUser = () => {
      for (const challenge of store.state.challengesReceived) {
        if (challenge.challenger == user.username) {
          store.dispatch(
            "setErrorMessage",
            `Error: ${user.username} already invited you to play!`
          );
          return;
        }
      }
      router.push({
        name: "Pong",
        params: {
          challengeeId: user.id,
          challengeeName: user.username,
        },
      });
    };

    const toggleConfirmModal = (action: string, user: User) => {
      if (user) target.value = user;
      toggleConfirm.value = action;
    };

    const toggleModalBis = () => {
      toggleConfirm.value = "";
    };

    const executeAction = (action: string, entity: User) => {
      toggleModalBis();
    };

    const sendDM = (recipient: User) => {
      chatSocket.emit("profile-dm", recipient);
    };

    return {
      user,
      addFriend,
      removeFriend,
      acceptFriend,
      relationState,
      userStatus,
      formatedDate,
      self: computed(() => store.state.user),
      firstTimeConnect: computed(() => store.state.firstTimeConnect),
      deactivateTwoFactor,
      showModal,
      showModal2,
      toggleModal,
      showBackdrop,
      block,
      unblock,
      challengeUser,
      toggleConfirmModal,
      toggleConfirm,
      target,
      executeAction,
      toggleModalBis,
      sendDM,
    };
  },
});
</script>
