import { challengeExport } from "@/types/PongGame";
import { User, Relationship } from "sdk/typescript-axios-client-generated";
import { InjectionKey } from "vue";
import { createStore, useStore as baseUseStore, Store } from "vuex";

interface ChallengeReceived {
  challenger: string;
  expiry_date: Date;
}

// define your typings for the store state
export interface State {
  user: User;
  message: string;
  errorMessage: string;
  error: boolean;
  firstTimeConnect: boolean;
  isConnected: boolean;
  onlineUsers: User[];
  inGameUsers: string[];
  challengesReceived: ChallengeReceived[];
  allPendingChallenges: challengeExport[];
  chatNotification: boolean;
  chatOn: boolean;
  toggleFriendship: boolean;
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol();

/**
 * Following is the actual store
 */
export const store = createStore<State>({
  state: {
    user: {
      id: 0,
      username: "0",
    },
    message: "",
    errorMessage: "",
    error: false,
    firstTimeConnect: false,
    isConnected: false,
    onlineUsers: [],
    inGameUsers: [],
    challengesReceived: [],
    allPendingChallenges: [],
    chatNotification: false,
    chatOn: false,
    toggleFriendship: false,
  },
  getters: {},
  mutations: {
    resetUser(state: State) {
      state.user.id = 0;
      state.user.username = "0";
    },

    toggleTwoFactor(state: State, payload: boolean) {
      if (state.user) {
        state.user.two_fa_enabled = payload;
      }
    },

    tagAvatar(state: State) {
      if (state.user) {
        if (state.user.avatar?.search("default.jpg") != -1) {
          state.user.avatar = `${process.env["VUE_APP_API_URL"]}/users/avatars/${state.user.forty_two_login}.jpg`;
        } else {
          const tag = `?tag=${Date.now().toString()}`;
          state.user.avatar = `${state.user.avatar}${tag}`;
        }
      }
    },

    updateUsername(state: State, payload: string) {
      if (state.user) {
        state.user.username = payload;
      }
    },

    setMessage(state: State, payload: string) {
      state.message = payload;
    },

    setErrorMessage(state: State, payload: string) {
      state.errorMessage = payload;
    },

    setFirstTimeConnect(state: State, payload: boolean) {
      state.firstTimeConnect = payload;
    },

    addOnlineUser(state: State, newUser: User) {
      const user = state.onlineUsers.find((user) => user.id === newUser.id);
      if (!user) state.onlineUsers.push(newUser);
    },

    allConnectedUsers(state: State, connectedUsers: User[]) {
      if (connectedUsers.length) state.onlineUsers = connectedUsers;
    },

    removeOnlineUser(state: State, id: number) {
      if (id) {
        state.onlineUsers = state.onlineUsers.filter((u) => u.id !== id);
      }
    },

    addInGameUsers(state: State, players: string[]) {
      const user1 = state.inGameUsers.find((user) => user === players[0]);
      if (!user1) state.inGameUsers.push(players[0]);
      const user2 = state.inGameUsers.find((user) => user === players[1]);
      if (!user2) state.inGameUsers.push(players[1]);
    },

    removeInGameUsers(state: State, players: string[]) {
      if (players[0]) {
        state.inGameUsers = state.inGameUsers.filter(
          (user) => user !== players[0]
        );
      }
      if (players[1]) {
        state.inGameUsers = state.inGameUsers.filter(
          (user) => user !== players[1]
        );
      }
    },

    allPlayingUsers(state: State, players: string[]) {
      if (players.length) state.inGameUsers = players;
    },

    addChallenge(state: State, challenge: ChallengeReceived) {
      if (
        !state.challengesReceived.filter(
          (chall: ChallengeReceived) => chall.challenger == challenge.challenger
        ).length
      )
        state.challengesReceived.push(challenge);
    },
    removeChallenge(state: State, challenger: string) {
      state.challengesReceived = state.challengesReceived.filter(
        (user) => user.challenger !== challenger
      );
    },
    allPendingChallenges(state: State, challenges: challengeExport[]) {
      if (challenges.length) state.allPendingChallenges = challenges;
    },
    userPendingChallenges(state: State) {
      state.allPendingChallenges.forEach((challenge) => {
        if (challenge.challengeeName === state.user.username)
          state.challengesReceived.push({
            challenger: challenge.challengerName,
            expiry_date: challenge.expiry_date,
          });
      });
    },
  },
  actions: {
    setMessage(context, payload: string) {
      context.commit("setMessage", payload);
      setTimeout(() => {
        context.commit("setMessage", "");
      }, 3000);
    },
    setChallenge(context, payload: string) {
      context.commit("setMessage", payload);
      setTimeout(() => {
        context.commit("setMessage", "");
      }, 10000);
    },
    setErrorMessage(context, payload: string) {
      context.commit("setErrorMessage", payload);
      setTimeout(() => {
        context.commit("setErrorMessage", "");
      }, 3000);
    },

    // we call setPendingChallenges once store.user has been set
    // we wait one second before commiting, to be sure that store.allPendingChallenges has been set too
    setPendingChallenges(context) {
      setTimeout(() => {
        context.commit("userPendingChallenges");
      }, 1000);
    },
  },
});

// define your own `useStore` composition function
export function useStore() {
  return baseUseStore(key);
}
