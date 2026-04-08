import { createApp, onMounted, onUnmounted } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { wsService } from './utils/apiService'

createApp(App).use(pinia).use(router).mount('#app')

onMounted(() => {
    wsService.connect();
})

onUnmounted(() => {
    wsService.disconnect();
})


