<template>
    <div class="nowData">
        <span class="title">平均浓度</span>
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
import { oxygenData } from '../api/oxygenData';

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
        const response = await oxygenData(user_id)

        console.log('pidata', response);


        // 只保留最新的 maxDataPoints 个数据点
        const newDataArray = response.slice(-maxDataPoints);

        // 重置数据数组
        data.value = [];
        formattedTime.value = [];

        // 填充新数据
        for (const item of newDataArray) {
            data.value.push(item.oxygenData);
            formattedTime.value.push(dateFormatter.Formatter(item.created_at));
        }

        // 更新当前显示值
        if (data.value.length > 0) {
            nowData.value = data.value[data.value.length - 1];
        }
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
// ============ 修改的代码 END =============

onMounted(() => {
    initChart();
    window.addEventListener('resize', () => myChart?.resize());

    // 初始加载数据
    updateChart();

    // 轮询获取新数据，并确保DOM更新后刷新图表
    pollInterval = setInterval(async () => {
        await nextTick();
        await updateChart();
    }, 2000);
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