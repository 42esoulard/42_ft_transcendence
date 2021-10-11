import { User } from '@/types/User'
import { createStore } from 'vuex'

export default createStore({
  state: {
    user: {
      id: 1,
      username: "John",
      forty_two_login: "jdoe",
      avatar: "http://localhost:3000/users/avatars/default.jpg",
      two_fa: false,
      refresh_token: "blablabla",
      expiry_date: new Date(2021, 12, 12),
      created_at: new Date(2021, 10, 9),
    } as User | null
  },
  getters: {},
  mutations: {},
  actions: {}
})