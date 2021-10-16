import { User } from '@/types/User'
import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null as User | null,
    message: '',
  },
  getters: {},
  mutations: {},
  actions: {}
})