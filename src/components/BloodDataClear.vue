<template>
    <div class="nowData">
        <span class="title">血糖浓度</span>
        <div class="dataBox">
            <span class="data">{{ data[data.length - 1] }}&nbsp;</span>
            <span class="unit">mmol/L</span>
        </div>
    </div>
    <div ref="chart" style="width: 100%; height: 100%;"></div>
</template>

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
import { getBloodData } from '../api/healthData';

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

const data = ref([])
const date = ref([])

const fetchBloodData = async () => {
    try {
        const response = await getBloodData(user_id);
        console.log('响应血糖', response);

        // --- 修正：处理数据并反转 ---
        // 1. 提取并处理数据
        const tempData = response.map(item => item.bloodData);
        const tempDate = response.map(item => item.recordTime);

        // 2. 反转数组以使时间从左到右递增
        const reversedData = tempData.reverse();
        const reversedDate = tempDate.reverse();

        // 3. 更新响应式变量
        data.value = reversedData;
        date.value = reversedDate;

        console.log('处理后的血糖数据 (data.value):', data.value);
        console.log('处理后的时间 (date.value):', date.value);

    } catch (error) {
        console.error("出错", error);
        alert("加载失败，请稍后再试。");
    }
};

const chart = ref(null);
let myChart = null;

// payload 不再直接引用响应式变量，因为数据获取后会更新它们
// const payload = {
//     id: '',
//     data: {
//         title: ['平均浓度'],
//         unit: ['mmol/L'],
//         x: date.value, // 这里引用了响应式变量，但在 updateChart 之前可能未更新
//         data1: data.value,
//     },
// };

// const unit = payload.data.unit || [];
// const x_data = payload.data.x || []; // 在 fetch 之前解构，可能为空
// const data1 = payload.data.data1 || []; // 在 fetch 之前解构，可能为空
// const title = payload.data.title || [];

const initChart = () => {
    if (chart.value) {
        myChart = echarts.init(chart.value);
        updateChart();
    }
};

const updateChart = async () => {
    await fetchBloodData(); // 等待数据获取并更新响应式变量

    // --- 修正：在数据更新后，直接使用响应式变量 ---
    const x_data = date.value; // 现在获取的是已更新并反转的数据
    const data1 = data.value; // 现在获取的是已更新并反转的数据
    const title = ['平均浓度']; // 图表标题
    const unit = ['mmol/L']; // 图表单位

    const maxDataValue = data1.length > 0 ? Math.max(...data1) : 0;
    const yMax = Math.floor(maxDataValue + 3); // 根据实际数据计算Y轴最大值

    const option = {
        grid: {
            top: '2%',
            bottom: '10%',
            left: '10%',
            containLabel: true
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#fff',
            formatter: function (params) {
                // params[0] 是第一个系列（bar）的数据
                // value 是数据值，name 是 x 轴标签（时间）
                const pointData = params[0];
                return `${pointData.value} ${unit[0]}<br/>时间: ${pointData.axisValue}`;
            },
        },
        xAxis: [{
            type: 'category',
            data: x_data, // 使用更新后的 date.value
            offset: 15,
            axisTick: {
                show: false
            },
            axisLabel: {
                interval: 0,
                color: 'rgba(110, 109, 109, 1)',
                fontSize: 16,
            },
            splitLine: {
                show: false
            },
            boundaryGap: true,
            axisLine: {
                lineStyle: {
                    color: "rgba(216, 216, 216, 1)",
                    width: '1',
                    type: 'solid',
                }
            },
        }],
        yAxis: [{
            type: 'value',
            min: 0,
            max: yMax, // 使用计算出的最大值
            offset: 20,
            axisLabel: {
                show: true,
                textStyle: {
                    color: 'rgba(110, 109, 109, 1)',
                    fontSize: 16,
                }
            },
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: 'rgba(216, 216, 216, 1)',
                    type: 'dashed',
                }
            },
            show: true,
        }],
        series: [
            {
                name: title[0],
                type: 'bar',
                barWidth: 20,
                showBackground: true,
                backgroundStyle: {
                    color: 'rgba(21,136,209,0.0)',
                },
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 1,
                        color: 'rgb(127, 255, 212)', //渐变1
                    },
                    {
                        offset: 0.75,
                        color: 'rgb(127, 253, 255)', //渐变1
                    },
                    {
                        offset: 0.5,
                        color: 'rgb(127, 246, 255)', //渐变1
                    },
                    {
                        offset: 0.25,
                        color: 'rgb(127, 229, 255)', //渐变1
                    },
                    {
                        offset: 0,
                        color: 'rgb(127, 202, 255)', //渐变1
                    }
                    ]),
                },
                data: data1, // 使用更新后的 data.value
                z: 0,
                zlevel: 0,
            },
            {
                type: 'pictorialBar',
                barWidth: 20,
                itemStyle: {
                    color: '#fff', //数据的间隔颜色
                },
                symbolRepeat: 'true',
                symbolMargin: 3,
                symbol: 'rect',
                symbolSize: [20, 2],
                data: data1, // 使用更新后的 data.value
                z: 1,
                zlevel: 0,
                label: {
                    show: false,
                    position: 'top',
                    fontSize: 14,
                    color: '#fff',
                    formatter: function (params) {
                        return params.data;
                    },
                }
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
    if (myChart) {
        myChart.dispose(); // 确保图表实例被正确销毁
    }
});
</script>

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