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
    <form @submit.prevent="updateUsername">
      <transition name="fade--error">
        <p v-if="error_username" class="error">{{ error_username }}</p>
      </transition>
      <input type="text" v-model="username" maxlength="10" />
      <div>
        <button class="button button--primary">Update username</button>
      </div>
    </form>
    <p>Your login 42: {{ user.forty_two_login }}</p>
    <p>Two-Factor Auth activated: {{ user.two_fa_enabled }}</p>
    <p>Profile created at: {{ formatedDate }}</p>

    <div v-if="!user.two_fa_enabled" class="ua-twofa">
      <button class="button button--third" @click="toggleModal(1)">
        Enable Two-Factor Authentication
      </button>
    </div>
    <div v-else class="ua-twofa">
      <button class="button button--second" @click="deactivateTwoFactor">
        Disable Two-Factor Authentication
      </button>
    </div>
    <hr />

    <form @submit.prevent="postAvatar">
      <transition name="fade--error">
        <p v-if="error" class="error">{{ error }}</p>
      </transition>
      <input @change="handleFile" type="file" ref="avatar" id="avatar" />
      <button class="button button--primary">Update avatar</button>
    </form>
    <button @click="toggleModal(2)" class="button button--invite">
      Edit profile
    </button>
    <teleport to="#modals">
      <transition name="fade--error">
        <div v-if="showBackdrop" class="backdrop"></div>
      </transition>
      <transition name="zoomin">
        <Modal v-if="showModal" @close="toggleModal(1)">
          <template v-slot:twofa>
            <InitTwoFactor @close="toggleModal(1)" @success="handleSuccess" />
          </template>
        </Modal>
      </transition>
      <transition name="zoomin">
        <Modal v-show="showModal2" @close="toggleModal(2)">
          <template v-slot:update-user>
            <UpdateUser :avatar="avatar" @close="toggleModal(2)" />
          </template>
        </Modal>
      </transition>
    </teleport>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import { useAuthApi, useUserApi } from "@/plugins/api.plugin";
import { User } from "@/types/User";
import { useStore } from "vuex";
import moment from "moment";
import InitTwoFactor from "@/components/InitTwoFactor.vue";
import Toast from "@/components/Toast.vue";
import UpdateUser from "@/components/EditUser.vue";
import Modal from "@/components/Modal.vue";

export default defineComponent({
  name: "UserAccount",
  components: { Modal, InitTwoFactor, Toast, UpdateUser },
  setup() {
    const userApi = useUserApi();
    const authApi = useAuthApi();
    const store = useStore();

    const avatar = ref();
    const showModal = ref(false);
    const showModal2 = ref(false);
    const error = ref("");
    const error_username = ref("");
    const username = ref("");
    const users = ref<User[]>([]);

    onMounted(() => {
      userApi
        .getUsers()
        .then((res: any) => (users.value = res.data))
        .catch((err: any) => console.log(err.message));

      showModal2.value = store.state.firstTimeConnect;
    });

    const formatedDate = computed(() => {
      return moment(store.state.user.created_at as Date).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    });

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
      console.log("avatar value", avatar.value);
    };

    const updateUsername = async () => {
      if (!/^[a-zA-Z]+$/.test(username.value))
        error_username.value = "Username should only contains letters";
      else if (users.value.find(user => user.username == username.value))
        error_username.value = "Username already taken";
      else
        userApi
          .updateUser(
            {
              id: store.state.user.id,
              username: username.value
            },
            {
              withCredentials: true
            }
          )
          .then(res => {
            console.log(res);
            store.commit("updateUsername", username.value);
          })
          .catch(error_username => console.log(error_username));
    };

    const postAvatar = async () => {
      const data = new FormData();
      data.append("avatar", avatar.value);
      userApi
        .uploadFile({ data, withCredentials: true })
        .then((response: any) => {
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

    const handleSuccess = (message: string) => {
      console.log(message);
      store.dispatch("setMessage", message);
    };

    const showBackdrop = computed(() => {
      return showModal.value || showModal2.value;
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
      showModal2,
      toggleModal,
      error,
      handleSuccess,
      showBackdrop,
      updateUsername,
      username,
      error_username
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
