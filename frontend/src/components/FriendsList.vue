<template>
<div class="list-div">
  <span class="list-div__title">Friends List</span>
  <div class="list-div-panel">
    <ul class="list-div-panel__list">
      <li v-for="friendship in friendships" :key="friendship.created_at" class="friend-name">
        <router-link :to="{ name: 'UserProfile', params: {username: friendName(friendship)} }">
          {{ formatedFriend(friendship) }}
        </router-link>
      </li>
    </ul>
  </div>
</div>
</template>

<script lang="ts">
  import { defineComponent, inject, ref, computed, onMounted } from "vue";
  import { useStore } from "vuex";
  import { useUserApi } from "@/plugins/api.plugin";
  import { Friendship } from "@/types/Friendship";

  export default defineComponent({
    name: "FriendsList",
    setup() {
      const store = useStore();
      const user = computed(() => store.state.user);
      const friendships = ref<Friendship[]>([]);
      const userApi = useUserApi();

      onMounted(() => {
        userApi
          .getUserFriendships(store.state.user.id)
          .then((res: any) => {
            for (const requested of res.data.friendships_requested)
              if (requested.pending == false)
                friendships.value.push(requested);
            for (const adressed of res.data.friendships_adressed)
              if (adressed.pending == false)
                friendships.value.push(adressed);
            console.log(friendships.value);
            //friendships.value.sort((a, b)=>a.created_at.getTime()-b.created_at.getTime());
          })
          .catch((err: any) => console.log(err.message));
      });

      const formatedFriend = (friendship: Friendship) => {
        if (store.state.user.username == friendship.requester.username)
          return friendship.adressee.username;
        return friendship.requester.username;
      }

      const friendName = (friendship: Friendship) => {
        if (store.state.user.username == friendship.requester.username)
          return friendship.adressee.username;
        return friendship.requester.username;
      }

      return { friendships, formatedFriend, friendName }
    }
  })
</script>
