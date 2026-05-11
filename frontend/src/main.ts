import { createApp } from 'vue'
import { createPinia } from 'pinia'
// @ts-ignore 找不到模块“./App.vue”或其相应的类型声明。
import App from './App.vue'
import router from './router'
import './styles/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')