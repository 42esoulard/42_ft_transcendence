import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@fortawesome/fontawesome-free/js/all";
import { store, key } from "@/store";
import api from "@/plugins/api.plugin";

const app = createApp(App);
app.use(store, key); // should take the key as 2nd parameter to run correctly
app.use(api);

// Custom directive to handle 'autofocus' on an element
// Use with "v-focus" in desired element
// see: https://v3.vuejs.org/guide/custom-directive.html#intro
app.directive("focus", {
  mounted(el) {
    el.focus();
  },
});

app.use(router);
app.mount(".app");
