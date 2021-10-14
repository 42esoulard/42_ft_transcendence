import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@fortawesome/fontawesome-free/js/all'
import store from '@/store'
import api from "@/plugins/api.plugin";


createApp(App)
  .use(store)
  .use(api)
  .use(router)
  .mount('.app')
