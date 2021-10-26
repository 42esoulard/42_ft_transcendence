<template>
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
    <button @click="toggleModal(2)" class="button button--msg">
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
          <template v-slot:edit-user>
            <UpdateUser @close="toggleModal(2)" />
          </template>
        </Modal>
      </transition>
    </teleport>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import { useAuthApi} from "@/plugins/api.plugin";
import { User } from "@/types/User";
import { useStore } from "vuex";
import moment from "moment"; // Should not be in this component
import InitTwoFactor from "@/components/InitTwoFactor.vue";
import UpdateUser from "@/components/EditUser.vue";
import Modal from "@/components/Modal.vue";

export default defineComponent({
  name: "UserAccount",
  components: { Modal, InitTwoFactor, UpdateUser },
  setup() {
    const authApi = useAuthApi();
    const store = useStore();

    const avatar = ref();
    const showModal = ref(false);
    const showModal2 = ref(false);
    const error = ref("");
    const username = ref("");
    const users = ref<User[]>([]);

    onMounted(() => {
      showModal2.value = store.state.firstTimeConnect;
    });

    const formatedDate = computed(() => {
      return moment(store.state.user.created_at as Date).format(
        "YYYY-MM-DD HH:mm:ss"
      );
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

    const handleSuccess = (message: string) => {
      console.log(message);
      store.dispatch("setMessage", message);
    };

    const showBackdrop = computed(() => {
      return showModal.value || showModal2.value;
    });

    return {
      user: computed(() => store.state.user),
      firstTimeConnect: computed(() => store.state.firstTimeConnect),
      formatedDate,
      avatar,
      deactivateTwoFactor,
      showModal,
      showModal2,
      toggleModal,
      error,
      handleSuccess,
      showBackdrop,
      username,
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
