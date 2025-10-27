<template>
    <div class="nowData">
        <span class="title">血氧浓度</span>
        <div class="dataBox">
            <span class="data">{{ nowData }}&nbsp;</span>
            <span class="unit">%</span>
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
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
import dateFormatter from '../utils/dateFormatter';
import { getOxygenData } from '../api/healthData';
import { wsService } from '../api/healthData';

const userInfoStore = storeToRefs(useUserInfoStore());
const user_id = userInfoStore.user_id.value;

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

const nowData = ref(0);
const data = ref([]);
const formattedTime = ref([]);
let pollInterval = null;
const chart = ref(null);
let myChart = null;

// 颜色定义
const color = ['rgba(0, 190, 250)', 'rgba(0,61,150)', 'rgba(0,0,225)'];
// 限制数据点为最近30个
const maxDataPoints = 30;

// ============ 修改的代码 START =============
// 改进的数据获取函数，限制数据点数量并优化更新逻辑
const fetchOxygenData = async () => {
    try {
        const response = await getOxygenData(user_id);
        console.log('响应血氧数据', response);

        // --- 修正 1: 取最新的 maxDataPoints 个数据点 ---
        const latestDataArray = response.slice(0, maxDataPoints);

        // 处理返回的数据
        const processedData = latestDataArray.map(item => ({
            oxygenData: item.oxygenData,
            time: dateFormatter.Formatter(item.recordTime)
        }));

        // --- 修正 2: 更新实时显示值
        if (latestDataArray.length > 0) {
            nowData.value = latestDataArray[0].oxygenData;
        }

        // --- 修正 3: 反转数组以使时间从左到右递增 ---
        data.value = processedData.map(item => item.oxygenData).reverse();
        console.log('data.value (血氧 after reverse):', data.value);
        formattedTime.value = processedData.map(item => item.time).reverse();

    } catch (error) {
        console.error("出错", error);
    }
};

// ============ 修改的代码 START =============
// 重构图表初始化函数，添加动画配置
const initChart = () => {
    if (chart.value) {
        myChart = echarts.init(chart.value);

        // 启用数据动画效果
        const option = {
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicOut',
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
            legend: {
                data: [''],
                textStyle: {
                    fontSize: 12,
                    color: 'rgb(0,253,255,0.6)'
                },
                right: '4%'
            },
            grid: {
                top: '2%',
                bottom: '10%',
                left: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                offset: 20,
                boundaryGap: false,
                data: dateFormatter.getTime(formattedTime.value),
                axisLine: {
                    lineStyle: {
                        color: 'black'
                    }
                },
                axisLabel: {
                    textStyle: {
                        color: '#666',
                        fontSize: 16
                    },
                    formatter: function (params) {
                        return params.split(' ')[0]
                    }
                }
            },
            yAxis: {
                name: '浓度',
                type: 'value',
                offset: 20,
                axisLabel: {
                    formatter: '{value}',
                    textStyle: {
                        color: 'black',
                        fontSize: 16
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#CCCCCC',
                        type: 'dashed'
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: 'black'
                    }
                }
            },
            dataZoom: {
                type: 'inside',
                start: 50,
                end: 100
            },
            series: [{
                name: '浓度',
                type: 'line',
                // 增强动画效果
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: {
                    color: color[0]
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            { offset: 0, color: 'rgba(0, 190, 250, 0.8)' },
                            { offset: 1, color: 'rgba(0, 190, 250, 0.1)' }
                        ]
                    ),
                },
                lineStyle: {
                    width: 2,
                    shadowBlur: 5,
                    shadowColor: 'rgba(0, 190, 250, 0.3)',
                    shadowOffsetY: 5
                },
                // 为数据点添加动画效果
                emphasis: {
                    focus: 'series',
                    itemStyle: {
                        borderWidth: 2,
                        borderColor: '#fff',
                        shadowBlur: 10,
                        shadowColor: color[0]
                    }
                },
                data: data.value
            }]
        };

        myChart.setOption(option);
    }
};

// ============ 修改的代码 START =============
// 优化的更新函数，使用局部更新提升性能
const updateChart = async () => {
    await fetchOxygenData();
    if (!myChart) return;

    // 更新数据点（局部更新）
    myChart.setOption({
        xAxis: {
            data: dateFormatter.getTime(formattedTime.value)
        },
        series: [{
            data: data.value
        }]
    });
};


onMounted(async () => { // 添加 async
    window.addEventListener('resize', () => myChart?.resize());

    // 首先获取数据
    await fetchOxygenData(); // 等待数据获取完成

    // 然后初始化图表，此时 data.value 和 formattedTime.value 已经有值
    initChart();

    // 启动轮询
    pollInterval = setInterval(updateChart, 2000); // 移除不必要的 nextTick
});

onUnmounted(() => {
    if (pollInterval) {
        clearInterval(pollInterval);
    }
    window.removeEventListener('resize', () => myChart?.resize());
    if (myChart) {
        myChart.dispose();
    }
});
</script>