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
import { useRouter } from "vue-router";
import { useAuthApi } from "@/plugins/api.plugin";
export const pongSocket = io("http://localhost:3000/pong");
export const presenceSocket = io("http://localhost:3000/presence");
export const chatSocket = io("http://localhost:3000/chat");

export default {
  components: { SideBar, Header, Toast },
  setup() {
    const store = useStore();
    const router = useRouter();
    const authApi = useAuthApi();

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

    chatSocket.on("isAlreadyConnected", (user: User) => {
      if (store.state.user.id == user.id) {
        logOut();
      }
    });

    chatSocket.on("bannedUser", (user: User) => {
      if (store.state.user.id == user.id) {
        logOut();
      }
      store.commit("removeOnlineUser", user.id);
    });

    chatSocket.on("deletedUser", (user: User) => {
      if (store.state.user.id == user.id) {
        logOut();
      }
      store.commit("removeOnlineUser", user.id);
    });

    chatSocket.on("selfdeletedUser", (user: User) => {
      store.commit("removeOnlineUser", user.id);
    });

    chatSocket.on("promotedUser", (user: User) => {
      if (store.state.user.id == user.id) {
        store.state.user.role = user.role;
        router.push("/pong");
      }
    });

    chatSocket.on("demotedUser", (user: User) => {
      if (store.state.user.id == user.id) {
        store.state.user.role = "user";
        router.push("/pong");
      }
    });

    chatSocket.on(
      "chat-action",
      (action: string, userId: number, chanName: string) => {
        if (store.state.user.id == userId) {
          store.dispatch(
            "setMessage",
            "You have been " + action + " [" + chanName.substring(0, 15) + "]"
          );
          // if (action == 'banned') {
          //   chatSocket.emit("get-default");
          // }
        }
      }
    );

    chatSocket.on("newFriendshipRequest", (friendship: Relationship) => {
      if (store.state.user.id == friendship.adresseeId) {
        if (friendship.requester) {
          store.state.toggleFriendship = true;
          store.dispatch(
            "setMessage",
            `${friendship.requester.username} sent you a friend request!`
          );
        }
      }
    });

    chatSocket.on("friendshipAccepted", (friendship: Relationship) => {
      if (store.state.user.id == friendship.adresseeId) {
        if (friendship.requester)
          store.dispatch(
            "setMessage",
            `You're now friends with ${friendship.requester.username}`
          );
      }
      else if (store.state.user.id == friendship.requesterId) {
        if (friendship.adressee)
          store.dispatch(
            "setMessage",
            `You're now friends with ${friendship.adressee.username}`
          );
      }
    });

        chatSocket.on("newFriendshipRequest", (friendship) => {
      if (friendship.length == 2) {
        if (store.state.user.id == friendship[0].adresseeId) {
          store.state.toggleFriendship = true;
          store.dispatch(
            "setMessage",
            `${ friendship[1] } sent you a friend request!`
          );
          chatSocket.emit('app-addFriendship', friendship[0]);
        }
      }
    });
    chatSocket.on("removeFriendship", (usersId) => {
      if (usersId.length == 2) {
        if (store.state.user.id == usersId[0]) {
          chatSocket.emit('app-rmFriendship', usersId[1]);
        } else if (store.state.user.id == usersId[1]) {
          chatSocket.emit('app-rmFriendship', usersId[0]);
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
            chatSocket.emit('app-updateFriendship', usersInfo[2]);
          }
        }
        else if (store.state.user.id == usersInfo[2]) {
          if (usersInfo[1]) {
            store.dispatch(
              "setMessage",
              `You're now friends with ${usersInfo[1]}`
            );
            chatSocket.emit('app-updateFriendship', usersInfo[0]);
          }
        }
      }
    });


    chatSocket.on("app-dm", (recipient: User) => {
      router.push("/chat")
      chatSocket.emit("init-direct-message", recipient);
    });

    chatSocket.on(
      "chat-action",
      (action: string, userId: number, chanName: string) => {
        if (store.state.user.id == userId) {
          store.dispatch(
            "setMessage",
            "You have been " + action + " [" + chanName.substring(0, 15) + "]"
          );
        }
      }
    );

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
