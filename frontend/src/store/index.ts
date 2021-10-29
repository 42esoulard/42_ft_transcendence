import { User } from '@/types/User'
import { Friendship } from '@/types/Friendship'
import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'

// define your typings for the store state
export interface State {
  user: User | null,
  message: string,
  firstTimeConnect: boolean,
  onlineUsers: User[];
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

/**
 * Following is the actual store
 */
export const store = createStore<State>({
  state: {
    user: null,
    message: '',
    firstTimeConnect: false,
    onlineUsers: [],
  },
  getters: {},
  mutations: {

    toggleTwoFactor(state: State, payload: boolean) {
      if (state.user) {
        state.user.two_fa_enabled = payload;
      }
    },

    updateAvatar(state: State, payload: string) {
      if (state.user) {
        const tag = `?tag=${Date.now().toString()}`;
        // This is dirty, better to save avatar with ONLY ONE extension in backend
        const avatar = `http://localhost:3000/users/avatars/${payload}${tag}`;
        state.user.avatar = avatar;
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

    addOnlineUser(state: State, payload: User) {
      state.onlineUsers.push(payload);
    },


  },
  actions: {
    setMessage(context, payload: string) {
      context.commit('setMessage', payload);
      setTimeout(() => {
        context.commit('setMessage', '');
      }, 3000);
    },
    tagAvatar(context, payload: number) {
      setTimeout(() => {
        context.commit('tagAvatar', payload);
      }, 2000);
    },

  },
})

// define your own `useStore` composition function
export function useStore() {
  return baseUseStore(key)
}
