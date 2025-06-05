<template>
    <div class="nowData">
        <span class="title">平均心率</span>
        <div class="dataBox">
            <span class="data">{{ nowData }}</span>
            <span class="unit">bmp</span>
        </div>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">数据加载失败</div>
    <div v-else ref="chart" style="width: 100%; height: 100%;"></div>
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

.loading,
.error {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.16rem;
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
const chart = ref(null);
const loading = ref(true);
const error = ref(false);
const data = ref([]);
const formattedTime = ref([]);
let myChart = null;
let pollInterval = null;
const maxY = ref(0)

const color = ["#FF0000", "#00CA69"];
const maxDataPoints = 30; // 保持最近30个数据点



const hexToRgba = (hex, opacity) => {
    let rgbaColor = "";
    let reg = /^#[\da-f]{6}$/i;
    if (reg.test(hex)) {
        rgbaColor = `rgba(${parseInt("0x" + hex.slice(1, 3))},${parseInt(
            "0x" + hex.slice(3, 5)
        )},${parseInt("0x" + hex.slice(5, 7))},${opacity})`;
    }
    return rgbaColor;
};

// ============ 修改的代码 START =============
// 添加了加载状态和错误处理
// 使用maxDataPoints限制显示的数据点数量
const fetchHeartData = async () => {
    try {
        const response = await axios.post("/api/heartData",
            { user_id },
            { headers: { 'Content-Type': 'application/json' } }
        );

        // 取最近30个数据点
        const newData = response.data.slice(-maxDataPoints).map(item => ({
            heartData: item.heartData,
            time: dateFormatter.Formatter(item.created_at)
        }));

        // 更新实时显示值
        if (newData.length > 0) {
            nowData.value = newData[newData.length - 1].heartData;
        }

        // 更新图表数据
        data.value = newData.map(item => item.heartData);
        formattedTime.value = newData.map(item => item.time);

        maxY.value = Math.floor((Math.max(...data.value) + 20) / 20) * 20

        loading.value = false;
        error.value = false;
    } catch (err) {
        console.error("数据获取失败", err);
        error.value = true;
        loading.value = false;
    }
};

// ============ 修改的代码 START =============
// 重构了updateChart方法
// 添加了平滑动画和视觉优化
const updateChart = async () => {
    await fetchHeartData();

    if (!myChart || !chart.value) return;

    // 只更新数据部分而不是整个配置
    myChart.setOption({
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        xAxis: {
            data: dateFormatter.getTime(formattedTime.value)
        },
        series: [{
            data: data.value,
            // 修改点的大小和动画效果
            symbolSize: 10,
            itemStyle: {
                color: '#FF0000'
            }
        }]
    });
};

const initChart = () => {
    if (chart.value) {
        myChart = echarts.init(chart.value);

        // ============ 修改的代码 START =============
        // 改进的图表配置，添加了平滑动画和视觉效果
        const option = {
            color,
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            legend: { top: 20 },
            tooltip: {
                trigger: "axis",
                extraCssText: 'background: #fff; border-radius: 0;box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);color: #333;',
                axisPointer: {
                    type: 'shadow',
                    shadowStyle: {
                        color: '#ffffff',
                        shadowColor: 'rgba(225,225,225,1)',
                        shadowBlur: 5
                    }
                },
                formatter: function (params) {
                    return `${params.map((param, i) => {
                        return `<div style="margin-bottom:5px">${dateFormatter.getDate(formattedTime.value)[i]}</div>
                        <div>${param.marker + "  "}${param.data}</div>`;
                    }).join('')}`;
                }
            },
            grid: {
                top: '2%',
                bottom: '10%',
                left: '10%',
                containLabel: true
            },
            xAxis: [{
                type: "category",
                offset: 20,
                axisLabel: {
                    formatter: '{value}',
                    fontSize: 18,
                    textStyle: { color: "#333" }
                },
                axisTick: { show: false },
                axisLine: {
                    lineStyle: { color: "rgba(17,41,80,1)" }
                },
                data: dateFormatter.getTime(formattedTime.value),
            }],
            yAxis: [{
                type: "value",
                offset: 30,
                min: 0,
                max: maxY.value,
                interval: 20,
                splitNumber: 8,
                axisLabel: {
                    textStyle: { color: "#666" },
                    fontSize: 17
                },
                nameTextStyle: {
                    color: "#666",
                    fontSize: 12,
                    lineHeight: 40
                },
                splitLine: {
                    lineStyle: {
                        type: "dashed",
                        color: "rgba(17,41,80,0.7)"
                    }
                },
                axisLine: { show: false },
                axisTick: { show: false }
            }],
            series: [{
                type: "line",
                // 增强平滑效果和点的大小
                smooth: true,
                smoothMonotone: 'x',
                symbolSize: 10,
                zlevel: 3,
                lineStyle: {
                    normal: {
                        color: color[0],
                        width: 3,
                        shadowBlur: 8,
                        shadowColor: hexToRgba(color[0], 0.5),
                        shadowOffsetY: 8
                    }
                },
                symbol: 'circle',
                data: data.value
            }, {
                type: "line",
                smooth: true,
                symbolSize: 10,
                zlevel: 3,
                lineStyle: {
                    normal: {
                        color: color[1],
                        width: 3,
                        shadowBlur: 8,
                        shadowOffsetY: 8
                    }
                },
                symbol: 'circle',
                areaStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1,
                            [
                                { offset: 0, color: hexToRgba(color[1], 0.3) },
                                { offset: 1, color: hexToRgba(color[1], 0.1) }
                            ],
                            false
                        ),
                        shadowColor: hexToRgba(color[1], 0.1),
                        shadowBlur: 10
                    }
                },
            }]
        };

        myChart.setOption(option);
        loading.value = false;
    }
};
// ============ 修改的代码 END =============

onMounted(async () => {
    loading.value = true;
    await fetchHeartData();
    initChart();
    window.addEventListener('resize', () => myChart?.resize());

    // 轮询获取新数据
    pollInterval = setInterval(async () => {
        // 确保DOM已更新后再更新图表
        await nextTick();
        await updateChart();
    }, 2000);
});

onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval);
    window.removeEventListener('resize', () => myChart?.resize());
    if (myChart) myChart.dispose();
});
</script>