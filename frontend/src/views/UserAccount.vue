<template>
  <transition name="toast">
    <Toast v-if="message" :message="message" />
  </transition>
  <div class="user-account" v-if="user">
    <h1 class="profile-left__name">User Account</h1>
    <img :src="user.avatar" class="ua-img" alt="[Your avatar]" />
    <p>Your avatar: {{ user.avatar }}</p>
    <p>Your id: {{ user.id }}</p>
    <p>Your username: {{ user.username }}</p>
    <p>Your login 42: {{ user.forty_two_login }}</p>
    <p>Two-Factor Auth activated: {{ user.two_fa_enabled }}</p>
    <p>Profile created at: {{ formatedDate }}</p>

    <div v-if="!user.two_fa_enabled" class="ua-twofa">
      <button class="button button--invite" @click="toggleModal(1)">
        Enable Two-Factor Authentication
      </button>
    </div>
    <div v-else class="ua-twofa">
      <button class="button button--add" @click="deactivateTwoFactor">
        Disable Two-Factor Authentication
      </button>
    </div>
    <hr />

    <form method="post" @submit.prevent="postAvatar">
      <transition name="fade--error">
        <p v-if="error" class="error">{{ error }}</p>
      </transition>
      <input @change="handleFile" type="file" ref="avatar" id="avatar" />
      <button class="button button--msg">Update avatar</button>
    </form>
    <teleport to="#modals">
      <transition name="fade--error">
        <div v-if="showBackdrop" class="backdrop"></div>
      </transition>
      <transition-group name="zoomin">
        <Modal v-if="showModal" @close="toggleModal(1)">
          <template v-slot:twofa>
            <InitTwoFactor @close="toggleModal(1)" @success="handleSuccess" />
          </template>
        </Modal>
        <Modal v-if="firstTimeConnect" @close="toggleModal(2)">
          <template v-slot:update-user>
            <UpdateUser @close="toggleModal(2)" />
          </template>
        </Modal>
      </transition-group>
    </teleport>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { DefaultApi } from "@/../sdk/typescript-axios-client-generated";
import { useStore } from "vuex";
import axios from "axios";
import moment from "moment";
import InitTwoFactor from "@/components/InitTwoFactor.vue";
import Toast from "@/components/Toast.vue";
import UpdateUser from "@/components/UpdateUser.vue";
import Modal from "@/components/Modal.vue";

export default defineComponent({
  name: "UserAccount",
  components: { Modal, InitTwoFactor, Toast, UpdateUser },
  setup() {
    const api = new DefaultApi();
    const store = useStore();

    const avatar = ref();
    const showModal = ref(false);
    const error = ref("");
    const date = ref(1);

    const formatedDate = computed(() => {
      return moment(store.state.user.created_at as Date).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    });

    //To exchange cookie or auth header w/o in every req
    axios.defaults.withCredentials = true;

    const handleFile = (
      event: Event & {
        target: HTMLInputElement & {
          files: FileList;
        };
      }
    ) => {
      const { target } = event;
      const { files } = target;
      if (files.length === 0) {
        return;
      }
      avatar.value = files[0];
      console.log(avatar.value);
    };

    const postAvatar = async () => {
      const data = new FormData();
      data.append("avatar", avatar.value);
      await axios
        .post("http://localhost:3000/users/upload", data)
        .then(response => {
          console.log(response);
          store.commit("updateAvatar", response.data.filename);
          // store.commit("tagAvatar", Date.now());
          // window.location.reload();
        })
        .catch(err => {
          error.value = err.response.data.message;
        });
      setTimeout(() => (error.value = ""), 2000);
    };

    const deactivateTwoFactor = async () => {
      await axios
        .get("http://localhost:3000/auth/2fa/turn-off")
        .then(res => {
          store.commit("toggleTwoFactor", false);
          store.dispatch("setMessage", res.data.message);
        })
        .catch(error => console.log(error));
    };

    const toggleModal = (nbr: number) => {
      if (nbr === 1) {
        showModal.value = !showModal.value;
      } else {
        store.commit("setFirstTimeConnect", false);
      }
    };

    const handleSuccess = (message: string) => {
      console.log(message);
      store.dispatch("setMessage", message);
    };

    const showBackdrop = computed(() => {
      return showModal.value || store.state.firstTimeConnect;
    });

    return {
      user: computed(() => store.state.user),
      message: computed(() => store.state.message),
      firstTimeConnect: computed(() => store.state.firstTimeConnect),
      formatedDate,
      postAvatar,
      handleFile,
      avatar,
      deactivateTwoFactor,
      showModal,
      toggleModal,
      error,
      handleSuccess,
      showBackdrop
    };
  }
});
</script>

<style scoped>
.ua-img {
  width: 200px;
  height: 200px;
  border-radius: 200px;
}
p {
  margin-bottom: 0.8rem;
}
</style>
