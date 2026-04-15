import { createApp, onMounted, onUnmounted } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { wsService } from './utils/apiService'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GaugeChart, PieChart, BarChart, LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import 'echarts-liquidfill'

use([CanvasRenderer, GaugeChart, PieChart, BarChart, LineChart, TitleComponent, TooltipComponent, GridComponent])

createApp(App).use(pinia).use(router).component('v-chart', VChart).mount('#app')

onMounted(() => {
    wsService.connect();
})

onUnmounted(() => {
    wsService.disconnect();
})


