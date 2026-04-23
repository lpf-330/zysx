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

const initChart = () => {
    if (chart.value && !myChart) {
        myChart = echarts.init(chart.value);
        updateChart();
    }
};

const updateChart = () => {
    if (!myChart || props.data.length === 0) return;

    const option = {
        name: '心率',
        backgroundColor: '#fff',
        grid: {
            left: '5%',
            right: '10%',
            bottom: '25%',
            top: '20%',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            data: [1, 2, 3, 4],
            axisLabel: {
                show: false,
                interval: 0,
                fontSize: 20,
                color: '#ffffff',
                fontWeight: 'bold'

            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
        }],
        yAxis: [{
            show: false,
            min: Math.min(...props.data) - 5,
            max: Math.max(...props.data) + 5,
        }],
        series: [{
            type: 'line',
            smooth: true,
            symbol: 'circle',
            showSymbol: true,
            lineStyle: {
                normal: {
                    width: 5,
                    color: '#fa8d55',
                }
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(250, 141, 85, 0.3)' },
                        { offset: 1, color: 'rgba(250, 141, 85, 0)' }
                    ])
                }
            },
            itemStyle: {
                normal: {
                    color: '#fa8d55',
                    borderColor: '#fff',
                    borderWidth: 2,
                }
            },
            label: {
                show: true,
                position: 'top',
                distance: 8,
                color: '#fa8d55',
                fontSize: 12,
                fontWeight: 'bold',
                formatter: '{c}'
            },
            data: props.data
        },]
    };

    myChart.setOption(option);
};


watch(() => [props.data], () => {
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