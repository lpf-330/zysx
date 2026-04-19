<template>
    <div ref="chart" style="width: 100%; height: 180px;"></div>
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
import { color } from 'echarts';
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
    if (!myChart) return;
    const option = {
        tooltip: {
            show: false
        },
        legend: {
            right: 'center',
            top: '5%',
            itemWidth: 16,
            itemHeight: 16,
            itemGap: 25,
            icon: 'stack',
            textStyle: {
                color: '#E1E5E6'
            }
        },
        grid: {
            left: '5%',
            right: '10%',
            bottom: '40%',
            top: '40%',
            containLabel: true
        },
        xAxis: {
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
            }
        },
        yAxis: {
            show: false,
            min: props.data.length > 0 ? Math.min(...props.data) - 3 : 0,
            max: props.data.length > 0 ? Math.max(...props.data) + 3 : 10,
            type: 'value',
            axisTick: { show: false },
            axisLine: {
                show: false
            },
            axisLabel: {
                show: false
            },
            splitLine: {
                show: false
            }
        },
        series: [
            {
                smooth: true,
                type: 'line',
                symbol: 'circle',
                showSymbol: true,
                symbolSize: 8,
                itemStyle: {
                    color: 'rgba(26, 119, 221, 1)'
                },
                label: {
                    show: true,
                    position: 'top',
                    distance: 8,
                    color: '#1a77dd',
                    fontSize: 12,
                    fontWeight: 'bold',
                    formatter: '{c}'
                },
                data: props.data
            }
        ]
    };


    myChart.setOption(option);
};

// 监听数据变化
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