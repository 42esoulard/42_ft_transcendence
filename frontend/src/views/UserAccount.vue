<template>
  <transition name="toast">
    <Toast v-if="message" :message="message" />
  </transition>
  <h1>User Account</h1>
  <div v-if="user">
    <img :src="user.avatar" class="ua-img" alt="[Your avatar]" />
    <p>Your avatar: {{ user.avatar }}</p>
    <p>Your id: {{ user.id }}</p>
    <p>Your username: {{ user.username }}</p>
    <p>Your login 42: {{ user.forty_two_login }}</p>
    <p>Two-Factor Auth activated: {{ user.two_fa_enabled }}</p>
    <p>Profile created at: {{ formatedDate }}</p>

    <div v-if="!user.two_fa_enabled" class="ua-twofa">
      <!-- <router-link :to="{ name: 'InitTwoFactor' }"
        >Activate Two-Factor Authentication</router-link
      > -->
      <button class="button button--invite" @click="toggleModal()">
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
      <transition name="fade">
        <p v-if="error" class="error">{{ error }}</p>
      </transition>
      <input @change="handleFile" type="file" ref="avatar" id="avatar" />
      <button>Update avatar</button>
    </form>
    <teleport to="#modals">
      <transition name="fade">
        <div v-if="showModal" class="backdrop"></div>
      </transition>
      <transition name="zoomin">
        <InitTwoFactor
          v-if="showModal"
          @close="toggleModal()"
          @success="handleSuccess"
        />
      </transition>
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

export default defineComponent({
  name: "UserAccount",
  components: { InitTwoFactor, Toast },
  setup() {
    const api = new DefaultApi();
    const store = useStore();

    const avatar = ref();
    const showModal = ref(false);
    const error = ref("");

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

    const postAvatar = () => {
      const data = new FormData();
      data.append("avatar", avatar.value);
      axios
        .post("http://localhost:3000/users/upload", data)
        .then(function(response) {
          console.log(response);
          window.location.reload();
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
          console.log(res);
          store.state.user.two_fa_enabled = false;
          store.state.message = res.data.message;
          setTimeout(() => {
            store.state.message = "";
          }, 3000);
        })
        .catch(error => console.log(error));
    };

    const toggleModal = () => {
      showModal.value = !showModal.value;
    };

    const handleSuccess = (message: string) => {
      console.log(message);
      store.state.message = message;
    };

    return {
      user: computed(() => store.state.user),
      message: computed(() => store.state.message),
      formatedDate,
      postAvatar,
      handleFile,
      avatar,
      deactivateTwoFactor,
      showModal,
      toggleModal,
      error,
      handleSuccess
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
/* .fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 2s ease;
} */
</style>
