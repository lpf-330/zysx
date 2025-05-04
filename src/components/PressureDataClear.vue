<template>
    <div class="nowData">
        <div class="dataBox">
            <span class="classTitle" style="color: rgb(255, 105, 35);">高压</span>
            <div class="class">
                <span class="data">{{ avgData22.toFixed(1) }}</span>
                <span class="unit">mmHg</span>
            </div>
        </div>
        <span class="title">平均血压</span>
        <div class="dataBox">
            <span class="classTitle" style="color: rgba(35, 157, 250, 1);">低压</span>
            <div class="class">
                <span class="data">{{ avgData11.toFixed(1) }}</span>
                <span class="unit">mmHg</span>
            </div>
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
    width: 30%;
    height: 65%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-left: 3%;
    margin-right: 3%;
}

.unit {
    font-size: 0.08rem;
    font-family: 'PuHuiTi';
    color: #8E9AAB;
}

.class {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.classTitle {
    font-size: 0.1rem;
    font-family: 'PuHuiTi';
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
import axios from 'axios';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';

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

//高压
//const data1 = ref([709, 1917, 2455, 2610, 1719, 1433, 1009])
const data1 = ref([])

//低压
//const data2 = ref([-327, -1776, -507, -1200, -800, -482, -998])
const data2 = ref([])
//日期
//const date = ref([1, 2, 3, 4, 5, 6, 7])
const date = ref([])

const avgData1 = ref(0)
const avgData2 = ref(0)

const avgData11 = ref(0)
const avgData22 = ref(0)

const chart = ref(null);
let myChart = null;

const userInfoStore = storeToRefs(useUserInfoStore())


const fetchPressureData = async () => {
    try {

        console.log('user_id', userInfoStore.user_id.value);


        const url = 'http://localhost:8081/pressureData'    //这后面还没补上
        const response = await axios.post(url, {
            user_id: userInfoStore.user_id.value
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        )

        for (let i = 0; i < response.data.length; i++) {
            data2.value.push(response.data[i].diastolicBP)
            data1.value.push('-' + response.data[i].systolicBP)
            date.value.push(response.data[i].date)

            avgData11.value += Number(response.data[i].diastolicBP)
            avgData22.value += Number(response.data[i].systolicBP)
        }


        console.log('avgData11', avgData11.value);


        avgData11.value /= response.data.length
        avgData22.value /= response.data.length

        console.log('响应血压', response.data);


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

    await fetchPressureData()

    const option = {
        // backgroundColor: '#344b58',
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
                textStyle: {
                    color: '#fff',
                },
            },
            formatter: (params) => { // 自定义提示框内容（）
                return `<span>${params[0].name}</span>` + params
                    .map(param => {
                        // 判断数据格式：一维数值或二维数组（）
                        const value = Array.isArray(param.value)
                            ? param.value // 提取二维数组中的数值（如 [x, y]）
                            : param.value;
                        return `
              <div style="${param.color}">         
                ${param.marker} 
                ${param.seriesName}: 
                <strong>${Math.abs(value).toFixed(1)}</strong> <!-- 取绝对值 -->
              </div>
            `;
                    })
                    .join('');
            }
        },
        grid: {
            top: '2%',
            bottom: '10%',
            left: '10%',
            containLabel: true,
            textStyle: {
                color: '#fff',
            },
        },
        calculable: true,
        xAxis: [
            {
                type: 'category',
                // axisLine: {
                //     lineStyle: {
                //         color: 'rgba(255,255,255,.5)',
                //     },
                // },
                splitLine: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                splitArea: {
                    show: false,
                },
                axisLabel: {
                    interval: 0,
                    // color: 'rgba(255,255,255,0.7)',
                    fontSize: 15,
                },
                data: date.value,
            },
        ],
        yAxis: [
            {
                type: 'value',
                offset: 15,
                splitLine: {
                    show: false,
                },
                axisLine: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    interval: 0,
                    // color: 'rgba(255,255,255,0.5)',
                    fontSize: 18,
                    formatter: (m) => {
                        return Math.abs(m);
                    },
                },
                splitArea: {
                    show: false,
                },
            },
        ],
        series: [
            {
                name: '低压',
                type: 'bar',
                barWidth: 20,
                gridIndex: 0,
                yAxisIndex: 0,
                label: {
                    show: true,
                    position: 'top',
                    formatter: (m) => {
                        return Math.abs(m.value);
                    },
                },
                itemStyle: {
                    normal: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: 'rgba(35, 157, 250, 0.32)', // 0% 处的颜色
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(35, 157, 250, 1)', // 100% 处的颜色
                                },
                            ],
                            global: false, // 缺省为 false
                        },
                    },
                },
                data: data2.value,
            },

            {
                name: '高压',
                type: 'bar',
                barWidth: 20,
                barGap: '-100%',
                gridIndex: 0,
                yAxisIndex: 0,
                label: {
                    show: true,
                    position: 'bottom',
                    formatter: (m) => {
                        return Math.abs(m.value);
                    },
                },
                itemStyle: {
                    normal: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 1,
                                    color: 'rgb(255, 105, 35,0.32)', // 0% 处的颜色
                                },
                                {
                                    offset: 0,
                                    color: 'rgb(255, 105, 35)', // 100% 处的颜色
                                },
                            ],
                            global: false, // 缺省为 false
                        },
                        barBorderRadius: 0,
                    },
                },
                data: data1.value,
            },
        ],
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

</script>