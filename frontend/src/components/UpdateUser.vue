<template>
  <div class="update-user-grid tac br15">
    <div @click="closeModal()" class="close-cross">
      &times;
    </div>
    <h2>Update your informations</h2>
    <h3>Update your username</h3>
    <form @submit.prevent="updateUsername">
      <input
        v-model="username"
        v-focus
        type="text"
        maxlength="10"
        name="username"
      />
      <div class="otp_submit">
        <button class="button button--third">Update username</button>
      </div>
      <p>NB: deux boutons (submit username et submit avatar)<br />
      ou un seul "submit" qui envoie les deux en meme temps ?</p>
    </form>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "UpdateUser",
  setup(props, context) {

    const store = useStore();
    const username = ref(store.state.user.username);

    const closeModal = () => {
      context.emit("close");
    };

    const updateUsername = () => {
      console.log("Update username to", username.value);
    };

    return {
      closeModal,
      username,
      updateUsername,
      user: computed(() => store.state.user)
    };
  }
});
</script>
