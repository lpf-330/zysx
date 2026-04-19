import { createApp, onMounted, onUnmounted } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { wsService } from './utils/apiService'
<<<<<<< Updated upstream
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GaugeChart, PieChart, BarChart, LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import 'echarts-liquidfill'

use([CanvasRenderer, GaugeChart, PieChart, BarChart, LineChart, TitleComponent, TooltipComponent, GridComponent])

createApp(App).use(pinia).use(router).component('v-chart', VChart).mount('#app')
=======
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(ElementPlus, { zIndex: 3000, locale: zhCn })
app.mount('#app')
>>>>>>> Stashed changes

onMounted(() => {
    wsService.connect();
})

onUnmounted(() => {
    wsService.disconnect();
})


