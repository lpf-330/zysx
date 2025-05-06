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

const dataX = [1, 2, 3, 4];

const initChart = () => {
    if (chart.value && !myChart) {
        myChart = echarts.init(chart.value);
        updateChart();
    }
};

const updateChart = () => {
    if (!myChart || props.data.length === 0) return;
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
            top: '20%',
            right: '4%',
            bottom: '20%',
            left: '3%',
            containLabel: true
        },
        xAxis: {
            data: dataX,
            type: 'category',
            boundaryGap: false,
            axisLabel: {
                show: false
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            min: Math.min(...props.data) - 3,
            max: Math.max(...props.data) + 3,
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
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(
                        0,
                        0,
                        0,
                        1,
                        [
                            {
                                offset: 0,
                                color: 'rgba(253, 190, 93,.4)'
                            },
                            {
                                offset: 0.9,
                                color: 'rgba(253, 190, 93,0)'
                            }
                        ],
                        false
                    ),
                    shadowColor: 'rgba(0, 0, 0, 0.1)'
                },
                showSymbol: false,
                symbolSize: 8,
                itemStyle: {
                    color: 'rgba(253, 190, 93, 1)'
                },
            },
            {
                smooth: true,
                type: 'line',
                showSymbol: false,
                symbolSize: 4,
                itemStyle: {
                    color: 'rgba(26, 119, 221, 1)'
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