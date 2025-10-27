<template>
    <div class="nowData">
        <div class="dataBox">
            <span class="classTitle" style="color: rgb(255, 105, 35);">高压</span>
            <div class="class">
                <span class="data">{{ avgData22.toFixed(1) }}</span>
                <span class="unit">mmHg</span>
            </div>
        </div>
        <span class="title">血压</span>
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
import { getPreData } from '../api/healthData';

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

const userInfoStore = storeToRefs(useUserInfoStore());
const user_id = userInfoStore.user_id.value;


const fetchPressureData = async () => {
    try {
        const response = await getPreData(user_id);
        console.log('响应血压数据', response);

        // 重置数组，避免重复累加
        data1.value = [];
        data2.value = [];
        date.value = [];

        // 计算平均值的临时变量
        let sumDiastolic = 0;
        let sumSystolic = 0;

        // 处理并填充数据数组
        for (let i = 0; i < response.length; i++) {
            data1.value.push('-' + response[i].systolicBp);
            data2.value.push(response[i].diastolicBp);
            date.value.push(response[i].recordTime);

            sumDiastolic += Number(response[i].diastolicBp);
            sumSystolic += Number(response[i].systolicBp);
        }

        // --- 修正：反转所有数组以使时间从左到右递增 ---
        data1.value.reverse();
        data2.value.reverse();
        date.value.reverse();

        // 计算平均值
        if (response.length > 0) {
            avgData11.value = sumDiastolic / response.length;
            avgData22.value = sumSystolic / response.length;
        } else {
            avgData11.value = 0;
            avgData22.value = 0;
        }

        console.log('avgData11', avgData11.value);
        console.log('响应血压', response);

    } catch (error) {
        console.error("出错", error);
        alert("加载失败，请稍后再试。");
    }
};

const initChart = () => {
    if (chart.value) {
        myChart = echarts.init(chart.value);
        updateChart();
    }
};

const updateChart = async () => {

    await fetchPressureData()

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
                textStyle: {
                    color: '#fff',
                },
            },
            formatter: (params) => {
                return `<span>${params[0].name}</span>` + params
                    .map(param => {
                        const value = Array.isArray(param.value)
                            ? param.value
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
                                    color: 'rgba(35, 157, 250, 0.32)',
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(35, 157, 250, 1)',
                                },
                            ],
                            global: false,
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
                                    color: 'rgb(255, 105, 35,0.32)',
                                },
                                {
                                    offset: 0,
                                    color: 'rgb(255, 105, 35)',
                                },
                            ],
                            global: false,
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