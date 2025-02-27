<template>
    <div class="nowData">
        <span class="title">平均指数</span>
        <div class="dataBox">
            <span class="data">{{ data[data.length - 1] }}</span>
            <span class="unit">mmol/L</span>
        </div>
    </div>
    <div ref="chart" style="width: 100%; height: 100%;"></div>
</template>

<style scoped>
.nowData {
    height: 15%;
    width: 35%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.title {
    font-size: 0.18rem;
    font-family: 'PuHuiTi';
}

.data {
    font-size: 0.14rem;
    color: #F7819B;
}

.dataBox {
    background-color: #fff;
    border-radius: 0.05rem;
    width: 25%;
    height: 60%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-left: 5%;
}

.unit {
    font-size: 0.08rem;
    font-family: 'PuHuiTi';
    color: #8E9AAB;
}
</style>

<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { color } from 'echarts';
import axios from 'axios';

echarts.use([
    LineChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
]);

const cancelTokenSource = axios.CancelToken.source();

//数据
const data = ref([6.2, 6.5, 5.9, 5.2, 7.8, 6.6, 7.9])
//日期
const date = ref(['11.06', '11.07', '11.08', '11.09', '11.10', '11.11', '11.12'])

const chart = ref(null);
let myChart = null;

const textColor = '#666'


const fetchData = () => {
    const url = 'http://localhost:8081/piData'
    const response = await axios.post(url, {
        cancelToken: cancelTokenSource.token
    },
        {
            headers: {
                'Content-Type': 'application/json',
            }
        }
    )
}



const initChart = () => {
    if (chart.value) {
        myChart = echarts.init(chart.value);
        updateChart();
    }
};

const updateChart = () => {
    const option = {

        tooltip: {
            trigger: 'axis'
        },
        grid: {
            top: '2%',
            bottom: '10%',
            left: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: date.value,
            offset: 20,
            axisLabel: {
                // 坐标轴字体颜色
                color: textColor,
                fontSize: 18
            },
            axisLine: {
                lineStyle: {
                    color: textColor
                }
            },
            axisTick: {
                // y轴刻度线
                show: true
            },
            splitLine: {
                // 网格
                show: false
            },
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            min: 0,
            name: '灌注指数',
            offset: 20,
            nameTextStyle: {
                color: '#333',
                fontSize: 25,
                padding: [0, 0, 0, 80]
            },
            axisLabel: {
                // 坐标轴字体颜色
                color: textColor,
                fontSize: 18
            },
            axisLine: {
                show: false
            },
            axisTick: {
                // y轴刻度线
                show: false
            },
            splitLine: {
                // 网格
                show: true,
                lineStyle: {
                    color: '#CCCCCC',
                    type: 'dashed'
                }
            }
        },
        series: [
            {
                name: '灌注指数',
                type: 'line',
                symbol: 'circle',
                symbolSize: 10,
                z: 1,
                itemStyle: {
                    color: '#5487FF'
                },
                lineStyle: {
                    color: '#5487FF'
                },
                data: data.value
            }
        ]
    };

    myChart.setOption(option);
};


onMounted(() => {
    initChart();
    window.addEventListener('resize', () => myChart.resize());
});

onUnmounted(() => {
    window.removeEventListener('resize', () => myChart.resize());
    myChart.dispose();
});

onBeforeUnmount(() => {
    cancelTokenSource.cancel('Component unmounted, request canceled');
})
</script>