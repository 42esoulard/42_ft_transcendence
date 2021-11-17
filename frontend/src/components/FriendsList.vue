<template>
  <div class="list-div">
    <span class="list-div__title">Friends List</span>
    <div class="list-div-panel">
      <ul class="list-div-panel__list">
        <li
          v-for="relationship in relationships"
          :key="relationship.created_at"
          class="friend-name"
        >
          <router-link
            class="link link--neutral"
            :to="{
              name: 'UserProfile',
              params: { username: friendName(relationship) },
            }"
          >
            {{ formatedFriend(relationship) }}
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
import { Relationship } from "sdk/typescript-axios-client-generated";

export default defineComponent({
  name: "FriendsList",
  setup() {
    const store = useStore();
    const user = computed(() => store.state.user);
    const relationships = ref<Relationship[]>([]);
    const userApi = useUserApi();

    onMounted(() => {
      userApi
        .getUserRelationships(store.state.user.id)
        .then((res: any) => {
          for (const requested of res.data.relationships_requested)
            if (requested.pending == false) relationships.value.push(requested);
          for (const adressed of res.data.relationships_adressed)
            if (adressed.pending == false) relationships.value.push(adressed);
          console.log(relationships.value);
          //relationships.value.sort((a, b)=>a.created_at.getTime()-b.created_at.getTime());
        })
        .catch((err: any) => console.log(err.message));
    });

    const formatedFriend = (relationship: Relationship) => {
      if (store.state.user.username == relationship.requester.username)
        return relationship.adressee.username;
      return relationship.requester.username;
    };

    const friendName = (relationship: Relationship) => {
      if (store.state.user.username == relationship.requester.username)
        return relationship.adressee.username;
      return relationship.requester.username;
    };

    return { relationships, formatedFriend, friendName };
  },
});
</script>
