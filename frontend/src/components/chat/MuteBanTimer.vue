<template>
  <div
    v-if="action === 'unmute' || action === 'unban'"
    class="chat-channel-form"
  >
    <div @click="closeModal()" class="close-cross">&times;</div>

    <form class="chat-channel-form__form" @submit.prevent="unmuteUnban()">
      <div class="chat-channel-form__subtitle">
        [{{ targetCm.member.username }}] is {{ state }} until {{ getEndDate() }}
      </div>
      <button class="button button--join-locked-chan" type="submit">
        {{ action }}
      </button>
    </form>
  </div>
  <div v-else class="chat-channel-form">
    <div @click="closeModal()" class="close-cross">&times;</div>

    <form class="chat-channel-form__form" @submit.prevent="checkEndDate()">
      <div class="chat-channel-form__subtitle">
        [{{ targetCm.member.username }}] will be {{ action }} until...
      </div>

      <input
        class="chat-channel-form__input"
        required
        type="datetime-local"
        id="date"
        v-model="endDate"
      />
      <button class="button button--join-locked-chan" type="submit">
        Confirm
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, computed } from "vue";
import { store } from "@/store";

export default defineComponent({
  name: "MuteBanTimer",
  props: ["action", "targetCm", "activeChannel"],
  emits: ["close", "update-mute-ban"],
  setup(props, context) {
    const dateInput = computed(
      () => <HTMLInputElement>document.querySelector("input#date")!
    );
    const curDate = new Date(Date.now() + 3600000);
    const tz = curDate.toLocaleString("sv-SE");
    const endDate = ref(tz.substring(0, 16));

    const state = props.action === "unmute" ? "muted" : "banned";

    const closeModal = () => {
      context.emit("close");
    };

    const checkEndDate = async () => {
      const parsedDate = Date.parse(endDate.value);
      if (parsedDate - Date.now() <= 0) {
        store.dispatch("setErrorMessage", "Please select a future date!");
        closeModal();
        return;
      }
      context.emit(
        "update-mute-ban",
        props.action,
        props.targetCm.id,
        Date.parse(endDate.value)
      );
    };

    const getEndDate = () => {
      const property = props.action === "unmute" ? "mute" : "ban";
      const rawDate = new Date(Number(props.targetCm[property]));
      const locale = rawDate.toLocaleString("sv-SE");
      return locale.substring(0, 16);
    };

    const unmuteUnban = async () => {
      context.emit("update-mute-ban", props.action, props.targetCm.id, 0);
    };

    return {
      closeModal,
      endDate,
      checkEndDate,
      getEndDate,
      unmuteUnban,
      state,
    };
  },
});
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>
