import { Null } from 'mdue'
import { User } from 'sdk/typescript-axios-client-generated'
import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'

// define your typings for the store state
export interface State {
  user: User,
  message: string,
  firstTimeConnect: boolean,
  isConnected: boolean,
  onlineUsers: User[];
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

/**
 * Following is the actual store
 */
export const store = createStore<State>({
  state: {
    user: {
      id: 0,
      username: "0",
    },
    message: '',
    firstTimeConnect: false,
    isConnected: false,
    onlineUsers: [],
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
        const tag = `?tag=${Date.now().toString()}`;
        state.user.avatar = `${state.user.avatar}${tag}`;
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

    setFirstTimeConnect(state: State, payload: boolean) {
      state.firstTimeConnect = payload;
    },

    addOnlineUser(state: State, newUser: User) {
      const user = state.onlineUsers.find(user => user.id === newUser.id);
      if (!user)
        state.onlineUsers.push(newUser);
    },

    allConnectedUsers(state: State, connectedUsers: User[]) {
      if (connectedUsers.length)
        state.onlineUsers = connectedUsers;
    },

    removeOnlineUser(state: State, id: number) {
      if (id) {
        state.onlineUsers = state.onlineUsers.filter(u => u.id !== id);
      }
    },


  },
  actions: {
    setMessage(context, payload: string) {
      context.commit('setMessage', payload);
      setTimeout(() => {
        context.commit('setMessage', '');
      }, 3000);
    },

  },
})

// define your own `useStore` composition function
export function useStore() {
  return baseUseStore(key)
}
