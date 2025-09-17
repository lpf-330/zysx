<template>
    <div class="nowData">
        <span class="title">平均指数</span>
        <div class="dataBox">
            <span class="data">{{ nowData }}</span>
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
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';
import dateFormatter from '../utils/dateFormatter';
import { piData } from '../api/piData'

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

const userInfoStore = storeToRefs(useUserInfoStore())

const nowData = ref(0)
const data = ref([])
const formattedTime = ref([])
let pollInterval = null;

const chart = ref(null);
let myChart = null;
const maxY = ref(0)

const textColor = '#666'



const fetchPiData = async () => {

    try {

        const url = '/api/piData'
        const response = await piData(userInfoStore.user_id.value)

        if (data.value.length === 0) {
            for (let j = 0; j < response.length; j++) {
                data.value.push(response[j].piData)

                formattedTime.value.push(dateFormatter.Formatter(response[j].created_at))
            }
        } else {
            for (let j = 0; j < response.length; j++) {
                // data.value.push(response.data[j].heartData)
                data.value[j] = response[j].piData

                // formattedTime.value.push(dateFormatter.Formatter(response.data[j].created_at))
                const tem = dateFormatter.Formatter(response[j].created_at)
                formattedTime.value[j].time = tem.time
                formattedTime.value[j].date = tem.date
            }
        }

        nowData.value = data.value[data.value.length - 1]

        maxY.value = Math.floor((Math.max(...data.value) + 10) / 10) * 10


    } catch (error) {
        console.error("出错", error);
        alert("加载失败，请稍后再试。"); // 友好的错误提示  

    }


}



const initChart = () => {
    if (chart.value) {
        myChart = echarts.init(chart.value);
        updateChart();
    }
};

const updateChart = async () => {

    await fetchPiData()
    const option = {

        tooltip: {
            trigger: 'axis',
            formatter: function (params) {

                return `
                ${params.map((param, i) => {
                    return `<div style="margin-bottom:5px">${dateFormatter.getDate(formattedTime.value)[i]}</div>
                            <div>${param.marker + "  "}${param.data}</div>`;
                }).join('')}
                `;
            }
        },
        grid: {
            top: '2%',
            bottom: '10%',
            left: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dateFormatter.getTime(formattedTime.value),
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
            max: maxY.value,
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
    pollInterval = setInterval(updateChart, 2000); // 每2秒轮询一次
});

onUnmounted(() => {
    if (pollInterval) {
        clearInterval(pollInterval);
    }
    window.removeEventListener('resize', () => myChart.resize());
    myChart.dispose();
});


</script>