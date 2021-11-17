<template>
  <div class="profile-left-info">
    <div class="profile-left__avatar-div">
      <img :src="user.avatar" class="profile-left__avatar-img" alt="" />
    </div>
    <span class="profile-left__name">{{ user.username }} </span>
    <span class="profile-left__since">member since {{ formatedDate }}</span>
    <span v-if="isOnline && relationState(user) >= -1" class="profile-left__status"
      ><i class="status status--online fas fa-circle" /> online</span
    >
    <span v-else-if="relationState(user) >= -1" class="profile-left__status"
      ><i class="status status--offline fas fa-circle" /> offline</span
    >
  </div>
  <div v-if="relationState(user) >= 0" class="profile-left__social">
    <button
      v-show="relationState(user) == 0"
      @click="addFriend(user)"
      class="button button--second"
    >
      <i class="upload-icon fas fa-user-plus" /> add friend
    </button>
    <button
      v-show="relationState(user) == 1"
      @click="removeFriend(user)"
      class="button button--second"
    >
      <i class="upload-icon fas fa-user-minus" /> remove friend
    </button>
    <button
      v-show="relationState(user) == 2"
      @click="acceptFriend(user)"
      class="button button--second"
    >
      <i class="upload-icon fas fa-user-plus" /> accept invitation
    </button>
    <button
      v-show="relationState(user) == 3"
      @click="removeFriend(user)"
      class="button button--second"
    >
      <i class="upload-icon fas fa-user-times" /> cancel invitation
    </button>
    <button v-if="user.id != self.id" class="button button--primary">
      <i class="upload-icon fas fa-envelope" /> send message
    </button>
    <button v-if="user.id != self.id" class="button button--third">
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
    <button v-else class="button button--second" @click="deactivateTwoFactor">
      Disable 2FA
    </button>
    <button class="button button--grey" @click="deleteAccount()">Delete account</button>
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
        <Modal v-show="showModal2" @close="toggleModal(2)">
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
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, PropType } from "vue";
import moment from "moment";
import { User, Relationship } from "sdk/typescript-axios-client-generated";
import { useRelationshipApi, useAuthApi, useUserApi } from "@/plugins/api.plugin";
import { useStore } from "@/store";
import InitTwoFactor from "@/components/InitTwoFactor.vue";
import EditUser from "@/components/EditUser.vue";
import Modal from "@/components/Modal.vue";
import { presenceSocket } from "@/views/UserAccount.vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "ProfileLeft",
  props: {
    user: {
      type: Object as PropType<User>,
      required: true,
    },
  },
  components: { Modal, InitTwoFactor, EditUser },
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
    const formatedDate = computed(() => {
      return moment(user.created_at).format("MM-DD-YYYY");
    });
    const isOnline = computed((): boolean => {
      if (user != undefined) {
        const tmpUser: User[] = store.state.onlineUsers; // enlever cette ligne et utiliser un store typed !!!
        const onlineUser = tmpUser.find((u) => u.id === user.id);
        console.log("isOnline", onlineUser);
        return onlineUser != undefined;
      }
      return false;
    });

    onMounted(() => {
      showModal2.value = store.state.firstTimeConnect;
      if (store.state.user.id != 0) {
        relationshipApi
          .getAllUserFriendships(store.state.user.id)
          .then((res: any) => (userFriendships.value = res.data))
          .catch((err: any) => console.log(err.message));
        relationshipApi
          .getUserBlocked(store.state.user.id)
          .then((res: any) => (userBlocked.value = res.data))
          .catch((err: any) => console.log(err.message));
      }
    });

    const deactivateTwoFactor = async () => {
      authApi
        .turnOffTwoFactorAuthentication({ withCredentials: true })
        .then((res: any) => {
          store.commit("toggleTwoFactor", false);
          store.dispatch("setMessage", res.data.message);
        })
        .catch((error) => console.log(error));
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

    const deleteAccount = async() => {
      if (store.state.user.id != 0) {
        logOut();
        await userApi
          .removeUser(store.state.user.id)
          .then((res: any) => console.log("account deleted"))
          .catch((err: any) => console.log(err));
      }
    };

    const logOut = () => {
      authApi
        .logout({ withCredentials: true })
        .then((response) => {
          console.log(response);
          presenceSocket.emit("closeConnection", store.state.user);
          store.commit("resetUser"); //store.state.user = null;
          router.push("/login");
        })
        .catch((err: any) => console.log(err.message));
    };

    const addFriend = async (user: User) => {
      if (store.state.user.id != 0) {
        await relationshipApi
          .saveRelationship({
            requesterId: store.state.user.id,
            adresseeId: user.id,
          })
          .then((res: any) => window.location.reload())
          .catch((err: any) => console.log(err));
      }
    };

    const removeFriend = async (user: User) => {
      if (store.state.user.id != 0) {
        await relationshipApi
          .removeRelationship({
            userId1: user.id,
            userId2: store.state.user.id,
          })
          .then((res: any) => window.location.reload())
          .catch((err: any) => console.log(err));
      }
    };

    const acceptFriend = async (user: User) => {
      if (store.state.user.id != 0) {
        await relationshipApi
          .validateRelationship({
            requesterId: user.id,
            adresseeId: store.state.user.id,
          })
          .then((res: any) => window.location.reload())
          .catch((err: any) => console.log(err));
      }
    };

    // 1 == friends, 2 == self invited, 3 == other invited, 0 == no relationship
    // 4 == blocked && self is requester, -2 == blocked && self is adressee
    // -3 == banned
    const relationState = (user: User) => {
      if (store.state.user.id === 0 || user.id === store.state.user.id)
        return -1;

      if (user.banned)
        return -3;

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
        if (store.state.user.id == relationship.requesterId) return 4;
        if (store.state.user.id == relationship.adresseeId) return -2;
      }

      return 0;
    };

    const block = async (user: User) => {
      if (store.state.user.id != 0) {
        await relationshipApi
          .saveRelationship({
            requesterId: store.state.user.id,
            adresseeId: user.id,
            nature: "blocked",
          })
          .then((res: any) => window.location.reload())
          .catch((err: any) => console.log(err));
      }
    };

    const unblock = async (user: User) => {
      if (store.state.user.id != 0) {
        await relationshipApi
          .removeRelationship({
            userId1: user.id,
            userId2: store.state.user.id,
          })
          .then((res: any) => window.location.reload())
          .catch((err: any) => console.log(err));
      }
    };

    return {
      user,
      addFriend,
      removeFriend,
      acceptFriend,
      relationState,
      isOnline,
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
      deleteAccount
    };
  },
});
</script>
