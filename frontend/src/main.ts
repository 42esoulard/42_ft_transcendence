import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// import api from "@/plugins/api.plugin";
import store from '@/store'

// Config for the sdk (not used anymore)
const config = {
  basePath: process.env.VUE_APP_API_URL,
};

createApp(App).use(router)
  .use(store)
  // .use(api, config)
  .mount('#app')
