import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { wsService } from './utils/apiService'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
    console.error('=== Vue 全局错误 ===');
    console.error('错误对象:', err);
    console.error('错误信息:', err.message);
    console.error('错误堆栈:', err.stack);
    console.error('组件实例:', instance);
    console.error('错误信息:', info);
    console.error('错误类型:', err.constructor.name);
    console.error('完整错误:', err);
}

app.config.warnHandler = (msg, instance, trace) => {
    console.warn('=== Vue 警告 ===');
    console.warn('警告消息:', msg);
    console.warn('组件实例:', instance);
    console.warn('组件追踪:', trace);
}

app.use(pinia).use(router)

app.mount('#app')
