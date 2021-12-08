<template>
  <div class="friendships-pending">
    <div class="friendships-panel">
      <h1 class="friendships-panel__title">Friendships pending</h1>
      <div class="table__body">
        <div
          v-for="friendship in getPendingList"
          :key="friendship"
          class="friendship"
        >
          <router-link
            class="link link--user-list link--user-list--pending"
            :to="{
              name: 'UserProfile',
              params: { username: friendship.requester.username },
            }"
          >
            {{ friendship.requester.username }}
          </router-link>
          <div class="friendship__buttons">
            <button
              class="button button--third button--invitation button--invitation--pending"
              @click="acceptFriend(friendship.requester)"
              title="accept"
            >
              <i class="friendship__icon fas fa-user-check" />
            </button>
            <button
              class="button button--third button--invitation button--invitation--decline"
              @click="removeFriend(friendship.requester)"
              title="decline"
            >
              <i class="friendship__icon fas fa-user-slash" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="friendships-panel">
      <h1 class="friendships-panel__title">Friendship requests</h1>
      <div class="table__body">
        <div
          v-for="friendship in getAdressedList"
          :key="friendship"
          class="friendship"
        >
          <router-link
            class="link link--user-list link--user-list--pending"
            :to="{
              name: 'UserProfile',
              params: { username: friendship.adressee.username },
            }"
          >
            {{ friendship.adressee.username }}
          </router-link>
          <button
            class="button button--third button--invitation button--invitation--cancel"
            @click="removeFriend(friendship.adressee)"
            title="cancel"
          >
            <i class="friendship__icon fas fa-user-minus" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, computed, onMounted } from "vue";
import { useStore } from "@/store";
import { useRelationshipApi } from "@/plugins/api.plugin";
import { Relationship, User } from "sdk/typescript-axios-client-generated";
import { chatSocket } from "@/App.vue";

export default defineComponent({
  name: "Pending",
  setup() {
    const store = useStore();
    const relationships = ref<Relationship[]>([]);
    const relationshipApi = useRelationshipApi();

    onMounted(() => {
      relationshipApi
        .getAllUserFriendships(store.state.user.id)
        .then((res: any) => {
          for (const relationship of res.data) {
            if (relationship.pending == true)
              relationships.value.push(relationship);
          }
        })
        .catch((err: any) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    });

    chatSocket.on("addFriendship", async (relationship: Relationship) => {
      await relationshipApi
        .getRelationship(relationship.requesterId, relationship.adresseeId)
        .then((res) => {
          relationships.value.push(res.data);
        })
        .catch((err: any) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    });

    chatSocket.on("rmFriendship", (friendId: number) => {
      let index = 0;
      for (const friendship of relationships.value) {
        if (
          friendship.adresseeId == friendId ||
          friendship.requesterId == friendId
        ) {
          relationships.value.splice(index, 1);
          updateSidebar();
          break;
        }
        index++;
      }
    });

    const updateSidebar = () => {
      store.state.toggleFriendship = false;

      for (const friendship of relationships.value) {
        if (friendship.adresseeId == store.state.user.id)
          store.state.toggleFriendship = true;
      }
    };

    const acceptFriend = async (user: User) => {
      if (store.state.user.id != 0) {
        await relationshipApi
          .validateRelationship(
            {
              requesterId: user.id,
              adresseeId: store.state.user.id,
            },
            {
              withCredentials: true,
            }
          )
          .then((res: any) => {
            for (const friendship of relationships.value) {
              if (friendship.requesterId == user.id)
                relationships.value.splice(
                  relationships.value.indexOf(friendship),
                  1
                );
              updateSidebar();
              chatSocket.emit(
                "acceptFriendship",
                user.id,
                user.username,
                store.state.user.id,
                store.state.user.username
              );
            }
          })
          .catch((err: any) => {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          });
      }
    };

    chatSocket.on("updateFriendship", (friendId: number) => {
      let index = 0;
      for (const friendship of relationships.value) {
        if (
          friendship.adresseeId == friendId ||
          friendship.requesterId == friendId
        ) {
          friendship.pending = !friendship.pending;
          if (!friendship.pending) {
            relationships.value.splice(
              relationships.value.indexOf(friendship),
              1
            );
          }
          break;
        }
        index++;
      }
    });

    const removeFriend = async (user: User) => {
      if (store.state.user.id != 0) {
        await relationshipApi
          .removeRelationship(
            {
              userId1: user.id,
              userId2: store.state.user.id,
            },
            {
              withCredentials: true,
            }
          )
          .then((res: any) => {
            let index = 0;
            for (const friendship of relationships.value) {
              if (
                friendship.requesterId == user.id ||
                friendship.adresseeId == user.id
              ) {
                relationships.value.splice(index, 1);
                updateSidebar();
                chatSocket.emit(
                  "removeFriendship",
                  user.id,
                  store.state.user.id
                );
                break;
              }
              index++;
            }
          })
          .catch((err: any) => {
            if (err && err.response)
              store.dispatch("setErrorMessage", err.response.data.message);
          });
      }
    };

    const getPendingList = computed(() => {
      return relationships.value.filter(
        (rs: Relationship) => rs.adresseeId == store.state.user.id
      );
    });

    const getAdressedList = computed(() => {
      return relationships.value.filter(
        (rs: Relationship) => rs.requesterId == store.state.user.id
      );
    });

    return { getPendingList, getAdressedList, acceptFriend, removeFriend };
  },
});
</script>
