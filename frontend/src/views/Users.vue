<template>
  <h1>List of all users in database</h1>
  <div v-if="users.length">
    <div v-for="user in users" :key="user.id" class="user">
      <h2>{{ user.username }}</h2>
      <button v-show="isFriend(user) == 0"
          @click="addFriend(user)"
          class="button button--second">
          add friend
      </button>
      <button v-show="isFriend(user) == 1"
          @click="removeFriend(user)"
          class="button button--third">
          remove friend
      </button>
      <button v-show="isFriend(user) == 2"
          @click="acceptFriend(user)"
          class="button button--primary">
          accept invitation
      </button>
      <button v-show="isFriend(user) == 3"
          @click="removeFriend(user)"
          class="button button--grey">
          cancel invitation
      </button>
    </div>
  </div>
  <div v-else>
    <p>Loading some data...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, ref, computed} from "vue";
import { User } from "@/types/User";
import { Friendship } from "@/types/Friendship";
import { useUserApi, useFriendshipApi } from "@/plugins/api.plugin";
import { useStore } from "vuex";

export default defineComponent({
  name: "Users",
  setup() {
    const users = ref<User[]>([]);
    const userFriendships = ref<Friendship[]>([]);
    const userApi = useUserApi();
    const friendshipApi = useFriendshipApi();
    const store = useStore();
    // const api = new DefaultApi();

    onMounted(() => {
      userApi
        .getUsers()
        .then((res: any) => (users.value = res.data))
        .catch((err: any) => console.log(err.message));
      userApi
        .getUserFriendships(store.state.user.id)
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
          adressee_id: user.id,
        })
        .then((res: any) => window.location.reload())
        .catch((err: any) => console.log(err));
    };

    const removeFriend = async (user: User) => {
      await friendshipApi
        .removeFriendship({
          first_id: user.id,
          second_id: store.state.user.id,
        })
        .then((res: any) => window.location.reload())
        .catch((err: any) => console.log(err));
    };

    const acceptFriend = async (user: User) => {
      await friendshipApi
        .validateFriendship({
          pending: true,
          requester_id: user.id,
          adressee: store.state.user,
        })
        .then((res: any) => window.location.reload())
        .catch((err: any) => console.log(err));

    };

    // 1 == friends, 2 == self invited, 3 == other invited, 0 == no friendship
    const isFriend = (user: User) => {
      if (!store.state.user || user.username == store.state.user.username)
        return (-1);
      for (const friendship of userFriendships.value){
        if (user.username == friendship.requester.username){
          if (friendship.pending)
            return (2);
          return (1);
        }
        else if (user.username == friendship.adressee.username){
          if (friendship.pending)
            return (3);
          return (1);
        }
      }
      return (0);
    }

    return {  users,
              addFriend,
              removeFriend,
              acceptFriend,
              isFriend,
              self: computed(() => store.state.user) };
  },
});
</script>

<style scoped>
.user {
  background: #f4f4f4;
  padding: 20px;
  border-radius: 10px;
  margin: 10px auto;
  max-width: 600px;
  cursor: pointer;
  color: #444;
}
.user:hover {
  background: #ddd;
}
.user a {
  text-decoration: none;
}
</style>
