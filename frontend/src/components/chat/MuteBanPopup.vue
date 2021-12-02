<template>
  <div class="chat-channel-form chat-channel-form--popup">
    You are muted from this channel until {{ endDate(cm) }}
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "MuteBanPopup",
  props: ["cm"],
  methods: {
    endDate(cm) {
      const rawDate = new Date(Number(cm.mute));
      const locale = rawDate.toLocaleString("sv-SE");
      return locale.substring(0, 16);
    },
    toggleModal() {
      this.$parent.toggleModal(0);
    },
  },
});
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>
