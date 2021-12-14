import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Users from "../views/Users.vue";
import Chat from "../views/Chat.vue";
import Banned from "../views/Banned.vue";
import Admin from "../views/Admin.vue";
import Pong from "../views/Pong/Pong.vue";
import Ladder from "../views/Ladder.vue";
import PongGame from "../views/Pong/PongGame.vue";
import PongWatch from "../views/Pong/PongWatch.vue";
import ReceiveChallenge from "../views/Pong/ReceiveChallenge.vue";
import SendChallenge from "../views/Pong/SendChallenge.vue";
import Login from "../views/Login.vue";
import { store } from "@/store";
import axios from "axios";
import UserProfile from "../views/UserProfile.vue";
import NotFound from "../views/NotFound.vue";
import { User } from "sdk/typescript-axios-client-generated";
import { useAuthApi } from "@/plugins/api.plugin";
import { EmoticonSadOutline } from "mdue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: { name: "Pong" },
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      requiresVisitor: true,
    },
  },
  {
    path: "/banned",
    name: "Banned",
    component: Banned,
    meta: {
      requiresVisitor: true,
    },
  },
  {
    path: "/users",
    name: "Users",
    component: Users,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/ladder",
    name: "Ladder",
    component: Ladder,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/chat",
    name: "Chat",
    component: Chat,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/admin",
    name: "Admin",
    component: Admin,
    meta: {
      requiresAdmin: true,
    },
  },
  {
    path: "/profile/:username",
    name: "UserProfile",
    component: UserProfile,
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/pong",
    name: "Pong",
    props: true,
    component: Pong,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/pong/play",
    name: "PongGame",
    props: true,
    component: PongGame,
    beforeEnter(to, from, next) {
      if (to.params.authorized) {
        next();
      } else {
        next({ name: "Pong" });
      }
    },
  },
  {
    path: "/pong/watch",
    name: "PongWatch",
    component: PongWatch,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/pong/watch/live",
    name: "PongGameWatch",
    component: PongGame,
    props: true,
    beforeEnter(to, from, next) {
      if (to.params.authorized) {
        next();
      } else {
        next({ name: "PongWatch" });
      }
    },
  },
  {
    path: "/pong/challenge/received",
    name: "ChallengeReceived",
    component: ReceiveChallenge,
  },
  {
    path: "/pong/challenge/sent",
    name: "SendChallenge",
    component: SendChallenge,
    props: true,
    beforeEnter(to, from, next) {
      if (to.params.authorized) {
        next();
      } else {
        next({ name: "Pong" });
      }
    },
  },
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// const authApi = useAuthApi(); // Doesnt work !!????

//To exchange cookie or auth header w/o in every req
axios.defaults.withCredentials = true;

const refreshToken = async () => {
  // await authApi.refreshToken({ withCredentials: true })
  await axios
    .get(`${process.env["VUE_APP_API_URL"]}/auth/refreshtoken`)
    .then(async (response) => {
      await getProfile();
    })
    .catch((err: any) => {
      if (err && err.response) {
        console.log(err.response.data.message);
      }
    });
};

const getProfile = async () => {
  // await authApi.profile()
  await axios
    .get<User>(`${process.env["VUE_APP_API_URL"]}/auth/profile`)
    .then((response) => {
      store.state.user = response.data;
      store.dispatch("setPendingChallenges");
    })
    .catch(async (err: Error) => {
      await refreshToken();
    });
};

router.beforeEach(async (to, from) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (store.state.user.id === 0) {
      await getProfile();
    }
    if (store.state.user.id === 0) {
      return "/login"; // redirected to login
    } else {
      if (store.state.user.banned) {
        return "/banned";
      }
      return true; // the route is allowed
    }
  } else if (to.matched.some((record) => record.meta.requiresVisitor)) {
    // Use local storage to store isLoggedIn boolean to block access to login page while user is logged in ?
    // localStorage.setItem('isLoggedIn', 'true');
    if (store.state.user.id === 0) {
      await getProfile();
    }
    if (store.state.user.id) {
      return true;
    }
  } else if (to.matched.some((record) => record.meta.requiresAdmin)) {
    if (store.state.user.id === 0) {
      await getProfile();
    }
    if (store.state.user.id === 0) {
      return "/login"; // redirected to login
    }
    if (store.state.user.role == "user") {
      return "/";
    }
    return true;
  }
});

export default router;
