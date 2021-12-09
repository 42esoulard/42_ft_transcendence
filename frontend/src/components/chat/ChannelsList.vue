<template>
  <div
    :class="[
      'chat-channels',
      channelsListOn == true ? 'chat-channels--on' : '',
    ]"
  >
    <div v-if="channelsListOn == true" @click="closeList()" class="close-cross">
      &times;
    </div>
    <button class="chat-channels__create" @click="toggleModal()">
      Create Channel
    </button>
    <div>
      <div class="chat-channels__title">Joined channels</div>
      <ul class="chat-channels__list">
        <li v-for="cm in joinedChannels" :key="cm.channel.id">
          <button
            :class="[
              'chat-channels__item',
              activeChannel.id === cm.id ? 'chat-channels__item--on' : '',
            ]"
            @click="switchChannel(cm)"
          >
            <div class="chat-channels__name" :title="cm.channel.name">
              <div v-if="cm.new_message" class="chat-channels__notif"></div>
              <div v-else class="chat-channels__sharp">#</div>
              {{ cm.channel.name }}
            </div>
            <div>
              <span v-if="cm.is_owner"
                ><img
                  class="fas fa-user-tie chat-channels__tag chat-channels__tag--owner"
                  title="Channel Owner"
              /></span>
              <span v-if="cm.is_admin"
                ><img
                  class="fas fa-user-shield chat-channels__tag chat-channels__tag--admin"
                  title="Channel Admin"
              /></span>
            </div>
          </button>
        </li>
      </ul>
    </div>

    <div>
      <div class="chat-channels__title">More channels</div>
      <ul class="chat-channels__list">
        <li v-for="chan in availableChannels" :key="chan.id">
          <button
            :class="[
              'chat-channels__item',
              activeChannel.channel.id === chan.id
                ? 'chat-channels__item--on'
                : '',
            ]"
            @click="previewChannel(chan)"
          >
            <div class="chat-channels__name" :title="chan.name">
              #{{ chan.name }}
            </div>
            <span v-if="chan.password"
              ><img
                class="fas fa-lock chat-channels__tag chat-channels__tag--locked"
                title="Password-protected"
            /></span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ChannelsList",
  props: [
    "joinedChannels",
    "availableChannels",
    "activeChannel",
    "channelsListOn",
  ],
  methods: {
    switchChannel(cm) {
      this.$parent.switchChannel(cm);
    },
    previewChannel(chan) {
      this.$parent.previewChannel(chan);
    },
    toggleModal() {
      this.$parent.toggleModal(0);
    },
    closeList() {
      this.$parent.toggleChannelsList();
    },
  },
});
</script>

<style lang="scss">
@import "../../../sass/main.scss";
</style>
