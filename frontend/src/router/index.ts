import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import AddUser from '../views/AddUser.vue'
import Users from '../views/Users.vue'
import Chat from '../views/Chat.vue'
import UserAccount from '../views/UserAccount.vue'
import PongPlay from '../views/Pong/PongPlay.vue'
import PongGame from '../views/Pong/PongGame.vue'
import PongWatch from '../views/Pong/PongWatch.vue'
import FakeLogin from '../views/FakeLogin.vue'
import Login from '../views/Login.vue';
import { store } from "@/store";
import axios from 'axios'
import UserProfile from '../views/UserProfile.vue'
import InitTwoFactor from '../views/InitTwoFactor.vue'
import NotFound from '../views/NotFound.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true,
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresVisitor: true,
    }
  },
  {
    path: '/fake-login',
    name: 'FakeLogin',
    component: FakeLogin
  },
  {
    path: '/init-otp',
    name: 'InitTwoFactor',
    component: InitTwoFactor,
    meta: {
      requiresAuth: true,
    }
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
    component: AddUser
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: {
      requiresAuth: true,
    }
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
    component: PongPlay,
    meta: {
      requiresAuth: true,
    }
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
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFound
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

//To exchange cookie or auth header w/o in every req
// axios.defaults.withCredentials = true;

const refreshToken = async () => {
  await axios
    .get("http://localhost:3000/auth/refreshtoken")
    .then(async (response) => {
      await getProfile();
    })
    .catch((err: any) => console.log(err.message));
};

const getProfile = async () => {
  await axios
    .get("http://localhost:3000/auth/profile")
    .then((response) => {
      store.state.user = response.data;
    })
    .catch(async (err: Error) => {
      await refreshToken();
    });
};

router.beforeEach(async (to, from) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    console.log('beforeEach');
    if (!store.state.user) {
      await getProfile();
    }
    if (!store.state.user) {
      return `/login`; // redirected to login
    } else {
      return true; // the route is allowed
    }
  } else if (to.matched.some(record => record.meta.requiresVisitor)) {
    if (store.state.user) {
      return '/';
    } else {
      return true;
    }
  }
});

export default router
