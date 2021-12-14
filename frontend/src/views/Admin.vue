<template>
  <div class="users-main" v-if="user.id != 0">
    <div class="users">
      <div class="users__title">Manage users</div>
      <div class="users-list-selectors">
        <button
          @click="toggleOnline"
          :class="[
            'button',
            'button--selector',
            onlinelist ? 'button--selector--on' : '',
          ]"
        >
          online
        </button>
        <button
          @click="toggleAdmin"
          :class="[
            'button',
            'button--selector',
            adminlist ? 'button--selector--on' : '',
          ]"
        >
          admin
        </button>
        <button
          @click="toggleBanned"
          :class="[
            'button',
            'button--selector',
            bannedlist ? 'button--selector--on' : '',
          ]"
        >
          banned
        </button>
      </div>
      <div class="users-list">
        <tr
          v-for="member in selectList"
          :key="member.id"
          class="users-list__elt"
        >
          <td>
            <img
              v-if="isOnline(member)"
              class="users-list__avatar users-list__avatar--online"
              :src="member.avatar"
            />
            <img
              v-else
              class="users-list__avatar users-list__avatar--offline"
              :src="member.avatar"
            />
          </td>
          <td>
            <router-link
              :class="[
                'link',
                'link--user-list',
                member.role == 'user' ? '' : 'link--admin',
              ]"
              :to="{
                name: 'UserProfile',
                params: { username: member.username },
              }"
            >
              {{ member.username }}
            </router-link>
          </td>
          <td class="users-list__interactions">
            <button
              v-if="bannedlist"
              class="link link--neutral"
              @click="toggleConfirmModal('unban', member)"
              title="unban"
            >
              <i class="fas fa-user-slash" />
            </button>
            <button
              v-else-if="member.role == 'user'"
              class="link link--neutral"
              @click="toggleConfirmModal('ban', member)"
              title="ban"
            >
              <i class="fas fa-ban" />
            </button>
            <button
              class="link link--neutral"
              v-if="member.role == 'user'"
              @click="toggleConfirmModal('delete', member)"
              title="delete"
            >
              <i class="fas fa-trash" />
            </button>
            <button
              v-if="!bannedlist && user.role == 'owner' && !isAdmin(member)"
              class="link link--neutral"
              @click="toggleConfirmModal('promote', member)"
              title="promote"
            >
              <i class="fas fa-crown" />
            </button>
            <button
              v-if="!bannedlist && user.role == 'owner' && isAdmin(member)"
              class="link link--neutral"
              @click="toggleConfirmModal('promote owner', member)"
              title="promote owner"
            >
              <i class="fas fa-chess-king" />
            </button>
            <button
              v-if="isAdmin(member) && user.role == 'owner'"
              class="link link--neutral"
              @click="toggleConfirmModal('demote', member)"
              title="demote"
            >
              <i class="fas fa-arrow-down" />
            </button>
          </td>
        </tr>
      </div>

      <div class="users-search">
        <input
          class="users-search__bar"
          type="text"
          maxlength="10"
          v-model="searchQuery"
        />
      </div>
    </div>
  </div>

  <teleport to="#modals">
    <transition name="fade--error">
      <div v-if="toggleConfirm" class="backdrop"></div>
    </transition>
    <transition-group name="zoomin">
      <Modal v-if="toggleConfirm" @close="toggleModal">
        <template v-slot:confirmation>
          <Confirm
            :action="toggleConfirm"
            :target="target"
            @close="toggleModal"
            @confirm="executeAction"
          />
        </template>
      </Modal>
    </transition-group>
  </teleport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import { useStore } from "@/store";
import { User, Channel } from "sdk/typescript-axios-client-generated";
import { io } from "socket.io-client";
import { useUserApi, useAuthApi } from "@/plugins/api.plugin";
import { useRouter } from "vue-router";
import { chatSocket, presenceSocket } from "@/App.vue";
import Confirm from "@/components/Confirm.vue";
import Modal from "@/components/Modal.vue";

export default defineComponent({
  name: "Admin",
  components: { Confirm, Modal },
  setup() {
    const store = useStore();
    const userApi = useUserApi();
    const authApi = useAuthApi();
    const router = useRouter();
    const userList = ref<User[]>([]);
    const bannedList = ref<User[]>([]);
    const channelList = ref<Channel[]>([]);
    const onlinelist = ref(false);
    const publiclist = ref(false);
    const privatelist = ref(false);
    const bannedlist = ref(false);
    const adminlist = ref(false);
    const searchQuery = ref("");
    const toggleConfirm = ref("");
    const target = ref();

    const isOnline = (user: User): boolean => {
      if (user != undefined) {
        const isonline = store.state.onlineUsers.find((u) => u.id === user.id);
        return isonline != undefined;
      }
      return false;
    };

    const isAdmin = (user: User): boolean => {
      if (user != undefined && user.role != "user") return true;
      return false;
    };

    onMounted(() => {
      userApi
        .getUsers()
        .then((res: any) => {
          userList.value = res.data;
          userList.value.sort((a, b) => a.username.localeCompare(b.username));
        })
        .catch((err: any) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
      userApi
        .getBannedUsers()
        .then((res: any) => {
          bannedList.value = res.data;
          bannedList.value.sort((a, b) => a.username.localeCompare(b.username));
        })
        .catch((err: any) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    });

    const toggleOnline = () => {
      onlinelist.value = !onlinelist.value;
    };

    const toggleBanned = () => {
      bannedlist.value = !bannedlist.value;
    };

    const toggleAdmin = () => {
      adminlist.value = !adminlist.value;
    };

    const togglePublic = () => {
      publiclist.value = !publiclist.value;
    };

    const togglePrivate = () => {
      privatelist.value = !privatelist.value;
    };

    const toggleConfirmModal = (
      action: string,
      user?: User,
      channel?: Channel
    ) => {
      if (user) target.value = user;
      else if (channel) target.value = channel;
      toggleConfirm.value = action;
    };

    const toggleModal = () => {
      toggleConfirm.value = "";
    };

    const executeAction = (action: string, entity: User | Channel) => {
      toggleModal();
      if (action == "ban") {
        banUser(<User>entity);
      } else if (action == "unban") {
        unbanUser(<User>entity);
      } else if (action == "delete") {
        deleteUser(<User>entity);
      } else if (action == "promote") {
        promote(<User>entity);
      } else if (action == "demote") {
        demote(<User>entity);
      } else if (action == "promote owner") {
        changeOwner(<User>entity);
        (<User>entity).role = "owner";
        chatSocket.emit("promotedUser", <User>entity);
      }
    };

    const selectList = computed((): User[] => {
      const list = ref();
      if (bannedlist.value) {
        if (onlinelist.value || adminlist.value) return list.value;
        list.value = bannedList.value;
      } else if (onlinelist.value)
        list.value = userList.value.filter((user) =>
          store.state.onlineUsers.find((u: User) => u.id === user.id)
        );
      else list.value = userList.value;
      if (searchQuery.value.length) {
        list.value = list.value.filter((entity: User) =>
          entity.username
            .toLowerCase()
            .startsWith(searchQuery.value.toLowerCase())
        );
      }
      list.value = list.value.filter(
        (entity: User) => entity.id != store.state.user.id
      );
      if (adminlist.value)
        list.value = list.value.filter((entity: User) => entity.role != "user");
      return list.value.sort(
        (a: User, b: User) => a.role == "user" && b.role != "user"
      );
    });

    const deleteUser = async (user: User) => {
      await userApi
        .getUser(store.state.user.id)
        .then((res) => {
          if (!res || res.data.role == "user") {
            store.dispatch("setErrorMessage", "Unauthorized");
            window.location.reload();
          } else {
            chatSocket.emit("deletedUser", user, store.state.user.id);
            userList.value = userList.value.filter(
              (usr: User) => usr.id != user.id
            );
            bannedList.value = bannedList.value.filter(
              (usr: User) => usr.id != user.id
            );
          }
        })
        .catch((err) => {
          if (err && err.response) {
            window.location.reload();
            store.dispatch("setErrorMessage", err.response.data.message);
          }
        });
    };

    const promote = async (user: User) => {
      await userApi
        .promoteUser(user.id, { withCredentials: true })
        .then((res: any) => {
          user.role = "admin";
          chatSocket.emit("promotedUser", user);
        })
        .catch((err: any) => {
          {
            if (err && err.response) {
              if (err.response.data.message == "Unauthorized")
                window.location.reload();
              store.dispatch("setErrorMessage", err.response.data.message);
            }
          }
        });
    };

    const demote = async (user: User) => {
      await userApi
        .demoteUser(user.id, { withCredentials: true })
        .then((res: any) => {
          user.role = "user";
          chatSocket.emit("demotedUser", user);
        })
        .catch((err: any) => {
          {
            if (err && err.response) {
              if (err.response.data.message == "Unauthorized")
                window.location.reload();
              store.dispatch("setErrorMessage", err.response.data.message);
            }
          }
        });
    };

    const changeOwner = async (user: User) => {
      await userApi
        .changeOwner(user.id, { withCredentials: true })
        .then((res: any) => {
          user.role = "owner";
          logOut();
        })
        .catch((err: any) => {
          {
            if (err && err.response) {
              if (err.response.data.message == "Unauthorized")
                window.location.reload();
              store.dispatch("setErrorMessage", err.response.data.message);
            }
          }
        });
    };

    const logOut = () => {
      authApi
        .logout({ withCredentials: true })
        .then((response) => {
          presenceSocket.emit("closeConnection", store.state.user);
          store.commit("resetUser"); //store.state.user = null;
          router.push("/login");
        })
        .catch((err: any) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    };

    const banUser = async (user: User) => {
      await userApi
        .banUser(user.id, { withCredentials: true })
        .then((res: any) => {
          bannedList.value.push(user);
          userList.value = userList.value.filter(
            (usr: User) => usr.id != user.id
          );
          user.role == "user";
          chatSocket.emit("bannedUser", user);
        })
        .catch((err: any) => {
          if (err && err.response) {
            if (err.response.data.message == "Unauthorized")
              window.location.reload();
            store.dispatch("setErrorMessage", err.response.data.message);
          }
        });
    };

    const unbanUser = async (user: User) => {
      await userApi
        .unbanUser(user.id, { withCredentials: true })
        .then((res: any) => {
          bannedList.value = bannedList.value.filter(
            (usr: User) => usr.id != user.id
          );
          userList.value.push(user);
        })
        .catch((err: any) => {
          if (err && err.response) {
            if (err.response.data.message == "Unauthorized")
              window.location.reload();
            store.dispatch("setErrorMessage", err.response.data.message);
          }
        });
    };

    return {
      user: computed(() => store.state.user),
      selectList,
      searchQuery,
      onlinelist,
      bannedlist,
      adminlist,
      userList,
      isAdmin,
      isOnline,
      toggleBanned,
      toggleOnline,
      toggleAdmin,
      promote,
      unbanUser,
      banUser,
      deleteUser,
      demote,
      togglePublic,
      togglePrivate,
      privatelist,
      publiclist,
      channelList,
      changeOwner,
      toggleConfirm,
      toggleModal,
      toggleConfirmModal,
      target,
      executeAction,
    };
  },
});
</script>

<style scoped></style>
