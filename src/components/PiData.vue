<template>
    <div ref="chart" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
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

        const textColor = '#666'
        const seriesData = props.data
        const xAxisList = [


        ]

        const initChart = () => {
            if (chart.value) {
                myChart = echarts.init(chart.value);
                updateChart();
            }
        };

        const updateChart = () => {
            const option = {

                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    top: '20%',
                    left: '2%',
                    right: '15%',
                    bottom: '0%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: xAxisList,
                    axisLabel: {
                        // 坐标轴字体颜色
                        color: textColor,
                        fontSize: 18,
                        show: false
                    },
                    axisLine: {
                        // lineStyle: {
                        //     color: textColor
                        // }
                        show: false
                    },
                    axisTick: {
                        // y轴刻度线
                        show: false
                    },
                    splitLine: {
                        // 网格
                        show: false
                    },
                    boundaryGap: false
                },
                yAxis: {
                    type: 'value',
                    min: 30,
                    // name: '成绩（分）',
                    nameTextStyle: {
                        color: '#333',
                        fontSize: 18,
                        padding: [0, 0, 0, 80]
                    },
                    axisLabel: {
                        // 坐标轴字体颜色
                        color: textColor,
                        fontSize: 18,
                        show: false
                    },
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        // y轴刻度线
                        show: false
                    },
                    splitLine: {
                        // 网格
                        show: false,
                        lineStyle: {
                            color: '#CCCCCC',
                            type: 'dashed'
                        }
                    }
                },

                series: [
                    {
                        // name: '成绩（分）',
                        type: 'line',
                        symbol: 'circle',
                        symbolSize: 10,
                        z: 1,
                        itemStyle: {
                            color: '#5487FF'
                        },
                        lineStyle: {
                            color: '#5487FF'
                        },
                        data: seriesData
                    }
                ]
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