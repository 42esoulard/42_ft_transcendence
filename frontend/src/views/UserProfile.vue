<template>
  <div class="user-panel">
    <div class="user-panel-left">
      <div class="user-panel-left__avatar-div">
        <img src="../assets/default_avatar.png" class="user-panel-left__avatar-img" alt= "">
        <button class="button">Upload <i class="upload-icon fas fa-camera" /></button>
      </div>
    </div>
    <div class="user-panel-middle">

    </div>
    <div class="user-panel-right"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from "vue";

export default defineComponent({
  name: "UserProfile",
  setup() {

    return {  };
  },
});

</script>

<style lang="scss">
  @import "../../sass/main.scss";
</style>
