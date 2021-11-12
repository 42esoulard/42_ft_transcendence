<template>
  <img :src="user.avatar" class="profile-left__avatar-img" alt="" />
  <span class="profile-left__name">{{ user.username }} </span>
  <span class="profile-left__since">member since {{ formatedDate }}</span>
  <span v-if="isOnline" class="profile-left__status"
    ><i class="status status--online fas fa-circle" /> online</span
  >
  <span v-else class="profile-left__status"
    ><i class="status status--offline fas fa-circle" /> offline</span
  >
  <div class="profile-left__social">
    <button
      v-show="isFriend(user) == 0"
      @click="addFriend(user)"
      class="button button--second"
    >
      <i class="upload-icon fas fa-user-plus" /> add friend
    </button>
    <button
      v-show="isFriend(user) == 1"
      @click="removeFriend(user)"
      class="button button--second"
    >
      <i class="upload-icon fas fa-user-minus" /> remove friend
    </button>
    <button
      v-show="isFriend(user) == 2"
      @click="acceptFriend(user)"
      class="button button--second"
    >
      <i class="upload-icon fas fa-user-plus" /> accept invitation
    </button>
    <button
      v-show="isFriend(user) == 3"
      @click="removeFriend(user)"
      class="button button--second"
    >
      <i class="upload-icon fas fa-user-times" /> cancel invitation
    </button>
    <button
      v-if="user.username != self.username"
      class="button button--primary"
    >
      <i class="upload-icon fas fa-envelope" /> send message
    </button>
    <button v-if="user.username != self.username" class="button button--third">
      <i class="upload-icon fas fa-table-tennis" /> invite game
    </button>
    <button v-if="user.username != self.username" class="button button--grey">
      <i class="upload-icon fas fa-ban" /> block
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, PropType } from "vue";
import moment from "moment";
import { Friendship } from "@/types/Friendship";
import { useUserApi, useFriendshipApi } from "@/plugins/api.plugin";
import { User } from "@/types/User";
import { useStore } from "vuex";

export default defineComponent({
  name: "ProfileLeft",
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    }
  },
  setup(props) {
    const store = useStore();
    const user = props.user;
    const userFriendships = ref<Friendship[]>([]);
    const userApi = useUserApi();
    const friendshipApi = useFriendshipApi();
    const formatedDate = computed(() => {
      return moment(user.created_at).format("MM-DD-YYYY");
    });
    const isOnline = computed((): boolean => {
      if (user != undefined) {
        const tmpUser: User[] = store.state.onlineUsers; // enlever cette ligne et utiliser un store typed !!!
        const onlineUser = tmpUser.find(u => u.id === user.id);
        console.log("isOnline", onlineUser);
        return onlineUser != undefined;
      }
      return false;
    });

    onMounted(() => {
      userApi
        .getUserFriendships(store.state.user!.id)
        .then((res: any) => {
          for (const requested of res.data.friendships_requested)
            userFriendships.value.push(requested);
          for (const adressed of res.data.friendships_adressed)
            userFriendships.value.push(adressed);
        })
        .catch((err: any) => console.log(err.message));
    });

    const addFriend = async (user: User) => {
      //console.log("SELF", store.state.user, "USER", user)
      await friendshipApi
        .saveFriendship({
          pending: true,
          requester: store.state.user,
          adressee_id: user.id
        })
        .then((res: any) => window.location.reload())
        .catch((err: any) => console.log(err));
    };

    const removeFriend = async (user: User) => {
      await friendshipApi
        .removeFriendship({
          first_id: user.id,
          second_id: store.state.user!.id
        })
        .then((res: any) => window.location.reload())
        .catch((err: any) => console.log(err));
    };

    const acceptFriend = async (user: User) => {
      if (store.state.user) {
        await friendshipApi
          .validateFriendship({
            pending: true,
            requester_id: user.id,
            adressee: store.state.user
          })
          .then((res: any) => window.location.reload())
          .catch((err: any) => console.log(err));
      }
    };

    // 1 == friends, 2 == self invited, 3 == other invited, 0 == no friendship
    const isFriend = (user: User) => {
      if (!store.state.user || user.username == store.state.user.username)
        return -1;
      for (const friendship of userFriendships.value) {
        if (user.username == friendship.requester.username) {
          if (friendship.pending) return 2;
          return 1;
        } else if (user.username == friendship.adressee.username) {
          if (friendship.pending) return 3;
          return 1;
        }
      }
      return 0;
    };
    return {
      user,
      addFriend,
      removeFriend,
      acceptFriend,
      isFriend,
      formatedDate,
      isOnline,
      self: computed(() => store.state.user)
    };
  }
});
</script>
