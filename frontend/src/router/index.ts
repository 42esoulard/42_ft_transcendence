import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import AddUser from '../views/AddUser.vue'
import Users from '../views/Users.vue'
import Chat from '../views/Chat.vue'
import UserAccount from '../views/UserAccount.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/users',
    name: 'Users',
    component: Users
  },
  {
    path: '/adduser',
    name: 'AddUser',
    component: AddUser
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  },
  {
    path: '/account',
    name: 'UserAccount',
    component: UserAccount
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
