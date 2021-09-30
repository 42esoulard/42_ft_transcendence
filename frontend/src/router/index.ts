import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import AddUser from '../views/AddUser.vue'
import Users from '../views/Users.vue'
import Chat from '../views/Chat.vue'
import PongPlay from '../views/Pong/PongPlay.vue'
import PongGame from '../views/Pong/PongGame.vue'
import PongWatch from '../views/Pong/PongWatch.vue'

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
    path: '/pong',
    name: 'Pong',
    component: PongPlay
  },
  {
    path: '/pong/:id',
    name: 'PongGame',
    component: PongGame
  },
  {
    path: '/pong/watch',
    name: 'PongWatch',
    component: PongWatch
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
