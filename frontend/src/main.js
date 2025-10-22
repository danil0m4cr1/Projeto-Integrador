import { createApp } from 'vue'
import './style.css'
import { createPinia } from 'pinia'
import piniaPersistedState from 'pinia-plugin-persistedstate';
import router from "./router/index"
import App from './App.vue'

const pinia = createPinia();
pinia.use(piniaPersistedState);

createApp(App)
    .use(pinia)
    .use(router)
    .mount('#app')
