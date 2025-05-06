<template>
    <div ref="chart" style="width: 100%; height: 100%;"></div>
</template>

<script setup>



import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';


echarts.use([
    BarChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
]);

const props = defineProps({
    data: {
        type: Array,
        required: true
    },
    xData: {
        type: Array,
        default: () => []
    },
    title: {
        type: Array,
        default: () => []
    }
});

const chart = ref(null);
let myChart = null;


const initChart = () => {
    if (chart.value && !myChart) {
        myChart = echarts.init(chart.value);
        updateChart();
    }
};


const updateChart = () => {
    if (!myChart || props.data.length === 0) return;

    const option = {
        backgroundColor: '#001037',
        backgroundColor: 'transparent',
        grid: {
            top: "20%",
            left: "5%",
            right: "25%",
            bottom: "20%",
            containLabel: true,
        },
        title: [{
            text: ''
        },],
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(9, 30, 60, 0.6)',
            extraCssText: 'box-shadow: 0 0 8px rgba(0, 128, 255, 0.27) inset;',
            borderWidth: 0,
            confine: false,
            appendToBody: true,
            textStyle: {
                color: '#fff',
                fontSize: 10,
            },
            axisPointer: {
                type: 'shadow',
            },
            shadowStyle: {
                color: 'rgba(8, 4, 4, 0.80)',
            },
            formatter: function (params) {
                console.log(params)
                return params[0].value + 'kWh';
            },
        },
        xAxis: [{
            type: 'category',
            data: props.xData,
            axisTick: { show: false },
            axisLabel: {
                interval: 0,
                color: 'rgba(110, 109, 109, 1)',
                fontSize: 12
            },
            splitLine: { show: false },
            boundaryGap: true,
            axisLine: { show: false }
        }],
        yAxis: [{
            type: 'value',
            min: Math.min(...props.data) - 3,
            max: Math.max(...props.data) + 3,
            splitLine: { show: false },
            axisLabel: {
                show: false,
                textStyle: {
                    color: 'rgba(110, 109, 109, 1)',
                    fontSize: 12,
                }
            },
            axisLine: { show: false },
            axisTick: { show: false }
        }],
        series: [{
            name: props.title[0] || '数据',
            type: 'bar',
            barWidth: 10,
            showBackground: true,
            backgroundStyle: {
                color: 'rgba(21,136,209,0.0)',
            },
            data: props.data,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgb(127, 202, 255)',
                },
                {
                    offset: 0.25,
                    color: 'rgb(127, 229, 255)',
                },
                {
                    offset: 0.5,
                    color: 'rgb(127, 246, 255)',
                },
                {
                    offset: 0.75,
                    color: 'rgb(127, 253, 255)',
                }, {
                    offset: 1,
                    color: 'rgb(127, 255, 212)',
                }

                ])
            },
            z: 0,
            zlevel: 0,
        },
        {
            type: 'pictorialBar',
            barWidth: 10,
            itemStyle: {
                color: '#fff',
            },
            symbolRepeat: 'true',
            symbolMargin: 3,
            symbol: 'rect',
            symbolSize: [11, 2],
            data: props.data,
            z: 1,
            zlevel: 0,
            label: {
                show: false,
                position: 'top',
                fontSize: 14,
                formatter: function (params) {
                    return params.data;
                },
            }
        }
        ]
    };

    myChart.setOption(option);
};

// 监听数据变化
watch(() => [props.data, props.xData], () => {
    updateChart();
    myChart?.resize();
}, { deep: true });

onMounted(() => {
    initChart();
    window.addEventListener('resize', () => myChart?.resize());
});

onUnmounted(() => {
    window.removeEventListener('resize', () => myChart?.resize());
    myChart?.dispose();
});
</script>

<style>
.hj {
    background-color: rgb(127, 202, 255);
}
</style>