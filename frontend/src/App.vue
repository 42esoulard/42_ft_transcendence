<template>
  <Header />
  <div class="main-div">
    <SideBar />
    <div class="router-view">
      <router-view :key="$route.fullPath" />
    </div>
  </div>
  <transition name="toast">
    <Toast v-if="message" :message="message" />
  </transition>
  <transition name="toast">
    <Toast v-if="errorMessage" :errorMessage="errorMessage" />
  </transition>
</template>

<script lang="ts">
import SideBar from "./components/SideBar.vue";
import Header from "./components/Header.vue";
import Toast from "@/components/Toast.vue";
import { io } from "socket.io-client";
import { useStore } from "@/store";
import { computed, onUpdated } from "vue";
import { Relationship, User } from "sdk/typescript-axios-client-generated";
import { challengeExport, challengeMessage, gameMode } from "./types/PongGame";
import { useRoute, useRouter } from "vue-router";
import { useAuthApi, useUserApi } from "@/plugins/api.plugin";
export const pongSocket = io(`${process.env["VUE_APP_API_URL"]}/pong`);
export const presenceSocket = io(`${process.env["VUE_APP_API_URL"]}/presence`);
export const chatSocket = io(`${process.env["VUE_APP_API_URL"]}/chat`);

export default {
  components: { SideBar, Header, Toast },
  setup() {
    const store = useStore();
    const router = useRouter();
    const authApi = useAuthApi();
    const userApi = useUserApi();

    onUpdated(() => {
      if (store.state.user.id != 0) {
        if (!store.state.isConnected) {
          presenceSocket.emit("newConnection", store.state.user);
          chatSocket.emit("newConnection", store.state.user);
          store.state.isConnected = true;
        }
      }
    });

    presenceSocket.on("newUser", (user: User) => {
      store.commit("addOnlineUser", user);
    });
    presenceSocket.on("allConnectedUsers", (user: User[]) => {
      store.commit("allConnectedUsers", user);
    });
    presenceSocket.on("leftUser", (id: number) => {
      store.commit("removeOnlineUser", id);
    });
    presenceSocket.on("disconnected", () => {
      store.state.isConnected = false;
    });

    pongSocket.on("newInGameUsers", (players: string[]) => {
      store.commit("addInGameUsers", players);
    });

    pongSocket.on("removeInGameUsers", (players: string[]) => {
      store.commit("removeInGameUsers", players);
    });

    pongSocket.on("allPlayingUsers", (playersUserNames: string[]) => {
      store.commit("allPlayingUsers", playersUserNames);
    });

    pongSocket.on(
      "gameReadyToStart",
      (
        room: string,
        player1UserName: string,
        player2UserName: string,
        gameMode: gameMode
      ) => {
        router.push({
          name: "PongGame",
          params: {
            room,
            player1UserName,
            player2UserName,
            gameMode,
            authorized: "ok",
            userType: "player",
          },
        });
      }
    );

    pongSocket.on("challengeRequest", (message: challengeMessage) => {
      if (message.challengeeId === store.state.user.id) {
        store.commit("addChallenge", {
          challenger: message.challengerName,
          expiry_date: message.expiry_date,
        });
        store.dispatch(
          "setChallenge",
          `${message.challengerName} challenged you! [PONG-LINK]`
        );
      }
    });

    pongSocket.on("allPendingChallenges", (message: challengeExport[]) => {
      store.commit("allPendingChallenges", message);
    });

    chatSocket.on("chatOff", (user: User) => {
      store.state.chatOn = false;
    });

    chatSocket.on("chatNotifications", () => {
      store.state.chatNotification = true;
    });

    chatSocket.on("chat-message", (data: any) => {
      if (store.state.user.id != 0) {
        if (store.state.chatOn) {
          //meow!
          chatSocket.emit("chat-message-on", data);
        } else if (store.state.isConnected) {
          chatSocket.emit("chat-message-off", data, store.state.user);
        }
      }
    });

    chatSocket.on("isAlreadyConnected", async (user: User) => {
      if (store.state.user.id == user.id) {
        logOut();
      }
    });

    chatSocket.on("bannedUser", async (user: User) => {
      if (store.state.user.id == user.id) {
        logOut();
      }
      store.commit("removeOnlineUser", user.id);
    });

    chatSocket.on("deletedUser", async (info) => {
      if (info.length == 2 && info[0].id && store.state.user.id == info[0].id) {
        await logOut().then(() => chatSocket.emit("finishDeletion", info));
      }
    });

    chatSocket.on("finishDeletion", async (info) => {
      if (info.length == 2 && info[0].id && store.state.user.id == info[1]) {
        await userApi
          .removeUser(info[0].id, { withCredentials: true })
          .then(() => store.commit("removeOnlineUser", info[0].id))
          .catch((err: any) => {
            {
              if (err && err.response)
                store.dispatch("setErrorMessage", err.response.data.message);
            }
          });
      }
    });

    const route = useRoute();

    chatSocket.on("promotedUser", (user: User) => {
      if (store.state.user.id == user.id) {
        store.state.user.role = user.role;
        if (user.role == "owner" && route.path != "/pong/play")
          window.location.reload();
        else if (route.path != "/pong/play") router.push("/admin");
        store.dispatch("setMessage", "You've been promoted!");
      }
    });

    chatSocket.on("demotedUser", (user: User) => {
      if (store.state.user.id == user.id) {
        store.state.user.role = "user";
        if (route.path == "/admin") router.push("/pong");
        store.dispatch("setMessage", "You've been demoted!");
        chatSocket.emit("self-update-channels");
      }
    });

    chatSocket.on("newFriendshipRequest", (friendship) => {
      if (friendship.length == 2) {
        if (store.state.user.id == friendship[0].adresseeId) {
          store.state.toggleFriendship = true;
          store.dispatch(
            "setMessage",
            `${friendship[1]} sent you a friend request!`
          );
          chatSocket.emit("app-addFriendship", friendship[0]);
        }
      }
    });
    chatSocket.on("removeFriendship", (usersId) => {
      if (usersId.length == 2) {
        if (store.state.user.id == usersId[0]) {
          chatSocket.emit("app-rmFriendship", usersId[1]);
        } else if (store.state.user.id == usersId[1]) {
          chatSocket.emit("app-rmFriendship", usersId[0]);
        }
      }
    });
    chatSocket.on("friendshipAccepted", (usersInfo) => {
      if (usersInfo.length == 4) {
        if (store.state.user.id == usersInfo[0]) {
          if (usersInfo[3]) {
            store.dispatch(
              "setMessage",
              `You're now friends with ${usersInfo[3]}`
            );
            chatSocket.emit("app-updateFriendship", usersInfo[2]);
          }
        } else if (store.state.user.id == usersInfo[2]) {
          if (usersInfo[1]) {
            store.dispatch(
              "setMessage",
              `You're now friends with ${usersInfo[1]}`
            );
            chatSocket.emit("app-updateFriendship", usersInfo[0]);
          }
        }
      }
    });

    chatSocket.on("app-dm", (recipient: User) => {
      userApi
        .getUser(recipient.id)
        .then((res: any) => {
          router.push("/chat");
          chatSocket.emit("init-direct-message", recipient);
        })
        .catch((err) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    });

    chatSocket.on(
      "chat-action",
      (action: string, userId: number, chanName: string) => {
        if (store.state.user.id == userId) {
          store.dispatch(
            "setMessage",
            "You have been " + action + " [" + chanName.substring(0, 15) + "]"
          );
          // if (action == 'kicked from') {
          //   chatSocket.emit('app-get-default');
          // }
        }
      }
    );

    const logOut = async () => {
      await authApi
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

    return {
      user: computed(() => store.state.user),
      message: computed(() => store.state.message),
      errorMessage: computed(() => store.state.errorMessage),
    };
  },
};
</script>

<style lang="scss">
@import "../sass/main.scss";
body {
  background: url("./assets/background.jpg");
}
</style>
