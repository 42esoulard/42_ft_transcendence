<template>
  <div class="profile-left-info">
    <div class="profile-left__avatar-div">
      <img
        v-if="user.username == self.username"
        class="profile-left__avatar-img"
        :src="self.avatar"
        alt="" />
      <img v-else :src="user.avatar" class="profile-left__avatar-img" alt="" />
    </div>
    <span class="profile-left__name">{{ user.username }} </span>
    <span class="profile-left__since">member since {{ formatedDate }}</span>
    <span v-if="isOnline" class="profile-left__status"
      ><i class="status status--online fas fa-circle" /> online</span>
    <span v-else class="profile-left__status"
      ><i class="status status--offline fas fa-circle" /> offline</span>
  </div>
  <div v-if="isFriend(user) != -1" class="profile-left__social">
    <button
      v-show="isFriend(user) == 0"
      @click="addFriend(user)"
      class="button button--second">
      <i class="upload-icon fas fa-user-plus" /> add friend
    </button>
    <button
      v-show="isFriend(user) == 1"
      @click="removeFriend(user)"
      class="button button--second">
      <i class="upload-icon fas fa-user-minus" /> remove friend
    </button>
    <button
      v-show="isFriend(user) == 2"
      @click="acceptFriend(user)"
      class="button button--second">
      <i class="upload-icon fas fa-user-plus" /> accept invitation
    </button>
    <button
      v-show="isFriend(user) == 3"
      @click="removeFriend(user)"
      class="button button--second">
      <i class="upload-icon fas fa-user-times" /> cancel invitation
    </button>
    <button
      v-if="user.username != self.username"
      class="button button--primary">
      <i class="upload-icon fas fa-envelope" /> send message
    </button>
    <button v-if="user.username != self.username" class="button button--third">
      <i class="upload-icon fas fa-table-tennis" /> invite game
    </button>
    <button v-if="user.username != self.username" class="button button--grey">
      <i class="upload-icon fas fa-ban" /> block
    </button>
  </div>
  <div v-else-if="user" class="profile-left__social">
    <button @click="toggleModal(2)" class="button button--primary">
      Edit profile info
    </button>
    <button
      v-if="!self.two_fa_enabled"
      class="button button--third"
      @click="toggleModal(1)">
      Enable 2FA
    </button>
    <button v-else class="button button--second" @click="deactivateTwoFactor">
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
        <Modal v-show="showModal2" @close="toggleModal(2)">
          <template v-slot:edit-user>
            <EditUser @close="toggleModal(2)" />
          </template>
        </Modal>
      </transition>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, PropType } from "vue";
import moment from "moment";
import { User, Friendship } from 'sdk/typescript-axios-client-generated';
import { useUserApi, useFriendshipApi, useAuthApi } from "@/plugins/api.plugin";
import { useStore } from "@/store";
import InitTwoFactor from "@/components/InitTwoFactor.vue";
import EditUser from "@/components/EditUser.vue";
import Modal from "@/components/Modal.vue";

export default defineComponent({
  name: "ProfileLeft",
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    }
  },
  components: { Modal, InitTwoFactor, EditUser },
  setup(props) {
    const store = useStore();
    const user = props.user;
    const userFriendships = ref<Friendship[]>([]);
    const userApi = useUserApi();
    const friendshipApi = useFriendshipApi();
    const authApi = useAuthApi();
    const showModal = ref(false);
    const showModal2 = ref(false);
    const username = ref("");
    const formatedDate = computed(() => {
      return moment(user.created_at).format("MM-DD-YYYY");
    });
    const isOnline = computed((): boolean => {
      if (user != undefined) {
        const tmpUser: User[] = store.state.onlineUsers; // enlever cette ligne et utiliser un store typed !!!
        const onlineUser = tmpUser.find(u => u.id === user.id);
        console.log("isOnline", onlineUser);
        return onlineUser != undefined;
      }
      return false;
    });

    onMounted(() => {
      showModal2.value = store.state.firstTimeConnect;
      if (store.state.user.id != 0) {
        userApi
          .getUserFriendships(store.state.user.id)
          .then((res: any) => {
            for (const requested of res.data.friendships_requested)
              userFriendships.value.push(requested);
            for (const adressed of res.data.friendships_adressed)
              userFriendships.value.push(adressed);
          })
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
        .catch(error => console.log(error));
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

    const addFriend = async (user: User) => {
      //console.log("SELF", store.state.user, "USER", user)
      if (store.state.user.id != 0) {
        await friendshipApi
          .saveFriendship({
            requester: store.state.user,
            adressee: user
          })
          .then((res: any) => window.location.reload())
          .catch((err: any) => console.log(err));
      }
    };

    const removeFriend = async (user: User) => {
      if (store.state.user.id != 0) {
        await friendshipApi
          .removeFriendship({
            user1: user,
            user2: store.state.user
          })
          .then((res: any) => window.location.reload())
          .catch((err: any) => console.log(err));
      }
    };

    const acceptFriend = async (user: User) => {
      if (store.state.user.id != 0) {
        await friendshipApi
          .validateFriendship({
            requester: user,
            adressee: store.state.user
          })
          .then((res: any) => window.location.reload())
          .catch((err: any) => console.log(err));
      }
    };

    // 1 == friends, 2 == self invited, 3 == other invited, 0 == no friendship
    const isFriend = (user: User) => {
      if (store.state.user.id === 0 || user.username == store.state.user.username)
        return -1;
      for (const friendship of userFriendships.value) {
        if (user.username == friendship.requester.username) {
          if (friendship.pending) return 2;
          return 1;
        } else if (user.username == friendship.adressee.username) {
          if (friendship.pending) return 3;
          return 1;
        }
      }
      return 0;
    };
    return {
      user,
      addFriend,
      removeFriend,
      acceptFriend,
      isFriend,
      isOnline,
      formatedDate,
      self: computed(() => store.state.user),
      firstTimeConnect: computed(() => store.state.firstTimeConnect),
      deactivateTwoFactor,
      showModal,
      showModal2,
      toggleModal,
      showBackdrop,
      username
    };
  }
});
</script>
