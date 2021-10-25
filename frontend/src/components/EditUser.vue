<template>
  <div class="edit-user-grid tac br15">
    <div @click="closeModal()" class="close-cross">
      &times;
    </div>
    <h2>Update your informations</h2>
    <p>
      NB: deux boutons (submit username et submit avatar)<br />
      ou un seul "submit" qui envoie les deux en meme temps ?
    </p>
    <h3>Update your username</h3>
    <form @submit.prevent="updateUser">
      <input
        v-model="username"
        v-focus
        type="text"
        maxlength="10"
        name="username"
      />
      <!-- <div class="otp_submit">
        <button class="button button--invite">Update username</button>
      </div> -->
      <transition name="fade--error">
        <p v-if="error" class="error">{{ error }}</p>
      </transition>
      <h3>Update your avatar</h3>
      <input @change="handleFile" type="file" ref="avatar" id="avatar" />
      <button class="button button--msg">Update your info</button>
    </form>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "UpdateUser",
  props: ["avatar"],
  setup(props, context) {
    const store = useStore();
    const username = ref(store.state.user.username);
    const error = ref("");
    const avatar = ref(props.avatar); // use the store ???

    const closeModal = () => {
      context.emit("close");
    };

    //this function is redundant, export it in a composable ??
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

    const updateUser = () => {
      if (username.value) {
        console.log("Update username to", username.value);
      } else {
        console.log("username is unchanged");
      }
      if (avatar.value) {
        console.log("Update avatar to", avatar.value.name);
        console.log("Update avatar to", avatar.value);
      } else {
        console.log("avatar is unchanged");
      }
    };

    return {
      closeModal,
      username,
      updateUser,
      avatar,
      handleFile,
      error,
      user: computed(() => store.state.user)
    };
  }
});
</script>
