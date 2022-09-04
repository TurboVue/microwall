import { createApp } from 'vue'
import App from './App.vue'
import { createHead } from '@vueuse/head'
import { plugin, defaultConfig } from "@formkit/vue";
import store from "./store";
import router from "./router";
import '@unocss/reset/tailwind.css'
import 'uno.css'
import 'flowbite'
const app = createApp(App)
const head = createHead()

app.use(router)
app.use(head)
app.use(store)
app.use(plugin, defaultConfig)
app.mount(document.body)
