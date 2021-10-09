import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import AddUser from '../views/AddUser.vue'
import Users from '../views/Users.vue'
import Chat from '../views/Chat.vue'
import UserAccount from '../views/UserAccount.vue'
import PongPlay from '../views/Pong/PongPlay.vue'
import PongGame from '../views/Pong/PongGame.vue'
import PongWatch from '../views/Pong/PongWatch.vue'
import Login from '../views/Login.vue';
import store from "@/store";
import axios from 'axios'
import UserProfile from '../views/UserProfile.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: {
      requiresAuth: true,
    }
  },
  {
    path: '/adduser',
    name: 'AddUser',
    component: AddUser,
    meta: {
      requiresAuth: true,
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  },
  {
    path: '/account',
    name: 'UserAccount',
    component: UserAccount,
    meta: {
      requiresAuth: true,
    }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: {
      requiresAuth: true,
    }
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

//To exchange cookie or auth header w/o in every req
axios.defaults.withCredentials = true;

const refreshToken = async () => {
  await axios
    .get("http://localhost:3000/auth/refreshtoken")
    .then((response) => console.log(response))
    .catch((err: any) => console.log(err.message));
};

const getProfile = async () => {
  await axios
    .get("http://localhost:3000/auth/profile")
    .then((response) => {
      store.state.user = response.data;
      // console.log(store.state.user);
    })
    .catch((err: any) => console.log(err.message));
};

router.beforeEach(async (to, from) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.state.user) {
      await refreshToken();
      await getProfile();
    }
    console.log('user:', store.state.user)
    if (!store.state.user) {
      return '/login'; // redirected to login
    } else {
      return true; // the route is allowed
    }
  }
});

export default router
