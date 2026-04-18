<template>
    <div ref="chart" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
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
import { defineProps } from 'vue';

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

const props = defineProps({
    data: {
        type: Array,
        required: true
    }
})

const chart = ref(null);
let myChart = null;

const textColor = '#666'
const xAxisList = [


]

const initChart = () => {
    if (chart.value && !myChart) {
        myChart = echarts.init(chart.value);
        updateChart();
    }
};

const updateChart = () => {
    if (!myChart || props.data.length === 0) return;
    const option = {

        grid: {
            top: '20%',
            left: '5%',
            right: '10%',
            bottom: '20%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xAxisList,
            axisLabel: {
                color: textColor,
                fontSize: 18,
                show: false
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                show: false
            },
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            min: Math.min(...props.data) - 3,
            max: Math.max(...props.data) + 3,
            nameTextStyle: {
                color: '#333',
                fontSize: 18,
                padding: [0, 0, 0, 80]
            },
            axisLabel: {
                color: textColor,
                fontSize: 18,
                show: false
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                show: false,
                lineStyle: {
                    color: '#CCCCCC',
                    type: 'dashed'
                }
            }
        },

        series: [
            {
                type: 'line',
                symbol: 'circle',
                symbolSize: 8,
                z: 1,
                smooth: true,
                lineStyle: {
                    color: '#5487FF',
                    width: 4
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(84, 135, 255, 0.3)' },
                        { offset: 1, color: 'rgba(84, 135, 255, 0)' }
                    ])
                },
                itemStyle: {
                    color: '#5487FF',
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'top',
                    distance: 6,
                    color: '#5487FF',
                    fontSize: 10,
                    fontWeight: 'bold',
                    formatter: '{c}'
                },
                data: props.data
            }
        ]
    };

    myChart.setOption(option);
};

watch(() => [props.data, props.xData], () => {
    updateChart();
    myChart?.resize();
}, { deep: true });

onMounted(() => {
    initChart();
    window.addEventListener('resize', () => myChart.resize());
});

onUnmounted(() => {
    window.removeEventListener('resize', () => myChart.resize());
    myChart.dispose();
});
</script>