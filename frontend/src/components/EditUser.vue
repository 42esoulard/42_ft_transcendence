<template>
  <div class="edit-user-grid tac br15">
    <div @click="closeModal()" class="close-cross">&times;</div>
    <h2>Update your informations</h2>
    <h3>Avatar</h3>
    <div class="edit-user-img-container">
      <img :src="avatarUrl" class="ua-img" alt="[Your avatar]" />
      <input
        @change="handleFile"
        type="file"
        accept=".png, .jpg, .jpeg, .gif"
        ref="avatarInput"
        id="avatar"
      />
      <div class="icon-wrapper">
        <i class="fas fa-upload"></i>
      </div>
    </div>
    <h3>Username</h3>
    <form @submit.prevent="updateUser">
      <input
        type="text"
        v-focus
        name="username"
        v-model="username"
        maxlength="8"
        :placeholder="user.username"
      />
      <transition-group name="fade--error">
        <p v-if="error_username" class="error">{{ error_username }}</p>
        <p v-if="error_avatar" class="error">{{ error_avatar }}</p>
      </transition-group>
      <hr />
      <button class="button button--primary" style="margin: auto">
        Update your info
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { useUserApi } from "@/plugins/api.plugin";
import { User } from "sdk/typescript-axios-client-generated";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useStore } from "@/store";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "EditUser",
  setup(props, context) {
    const store = useStore();
    const userApi = useUserApi();

    const username = ref("");
    const error_avatar = ref("");
    const avatar = ref(); // should be typed !?
    const avatarInput = ref(); // should be typed !?
    const avatarUrl = ref(store.state.user.avatar);
    const users = ref<User[]>([]);
    const error_username = ref("");
    const router = useRouter();

    onMounted(() => {
      // Should not be on mounted as users can change everytime
      userApi
        .getUsers()
        .then((res: any) => (users.value = res.data))
        .catch((err: any) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    });

    const closeModal = () => {
      context.emit("close");
    };

    const handleFile = () => {
      const files = avatarInput.value.files;
      if (files.length !== 0) {
        avatar.value = files[0];
      }
    };

    const updateUsername = async (): Promise<boolean> => {
      let ret = false;
      const newUsername = username.value;
      if (!/^[a-zA-Z]+$/.test(newUsername))
        error_username.value = "Username should only contains letters";
      else if (users.value.find((user) => user.username == newUsername))
        error_username.value = "Username already taken";
      else
        await userApi
          .updateUser(
            {
              id: store.state.user.id,
              username: newUsername,
            },
            {
              withCredentials: true,
            }
          )
          .then((res) => {
            store.commit("updateUsername", newUsername);
            ret = true;
          })
          .catch((err) => {
            {
              if (err && err.response)
                store.dispatch("setErrorMessage", err.response.data.message);
            }
          });
      return ret;
    };

    const postAvatar = async (): Promise<boolean> => {
      let ret = false;
      const data = new FormData();
      data.append("avatar", avatar.value);
      await userApi
        .uploadFile({ data, withCredentials: true })
        .then((res: any) => {
          store.commit("tagAvatar");
          ret = true;
        })
        .catch((err) => {
          error_avatar.value = err.response.data.message;
          // setTimeout(() => (error_avatar.value = ""), 2000);
        });
      return ret;
    };

    const updateUser = async () => {
      let usernameUpdated = true;
      let avatarUpdated = true;
      if (username.value) {
        usernameUpdated = await updateUsername();
      } else {
      }
      if (avatar.value) {
        avatarUpdated = await postAvatar();
      } else {
      }
      if (usernameUpdated) {
        username.value = "";
        error_username.value = "";
      }
      if (avatarUpdated) {
        avatar.value = null;
        error_avatar.value = "";
      }
      if (usernameUpdated && avatarUpdated) {
        closeModal();
        if (usernameUpdated && store.state.user.username)
          router.push({ path: `/profile/${store.state.user.username}` });
        store.dispatch(
          "setMessage",
          "Your profile has been successfully updated"
        );
      }
    };

    watch(avatar, (avatar) => {
      if (avatar instanceof File) {
        let fileReader = new FileReader();

        fileReader.readAsDataURL(avatar);
        fileReader.addEventListener("load", () => {
          avatarUrl.value = fileReader.result as string;
        });
      }
    });

    return {
      closeModal,
      username,
      updateUser,
      avatar,
      avatarInput,
      avatarUrl,
      handleFile,
      error_avatar,
      error_username,
      user: computed(() => store.state.user),
    };
  },
});
</script>

<style scoped>
.ua-img {
  width: 150px;
  height: 150px;
  border-radius: 150px;
  transition: 0.3s ease;
  opacity: 0.7;
}

.edit-user-img-container {
  position: relative;
  margin: auto;
  margin-bottom: 30px;
  width: 150px;
  height: 150px;
  border-radius: 150px;
  overflow: hidden;
}

.icon-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  text-align: center;
  width: 100%;
  padding: 5px;
  cursor: pointer;
  font-size: 1.2em;
  transition: 0.3s ease;
}

.edit-user-img-container:hover .icon-wrapper {
  /* background: rgba(0, 0, 0, 0.7); */
  display: none;
}

.edit-user-img-container:hover img {
  opacity: 1;
}

input[type="file"] {
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
