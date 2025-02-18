<template>
    <div ref="chart" style="width: 100%; height: 100%;"></div>
</template>

<script>
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

export default {
    setup() {
        const chart = ref(null);
        let myChart = null;

        const initChart = () => {
            if (chart.value) {
                myChart = echarts.init(chart.value);
                updateChart();
            }
        };

        const updateChart = () => {
                    const option = {
            backgroundColor: '#fff',
            tooltip: {
                trigger: 'axis',
                formatter: '{b0}: {c0}℃',
            },
            grid: {
                top: '15%',
                left: '5%',
                right: '5%',
                bottom: '2%',
                containLabel: true,
            },
            yAxis: {
                axisLine: {
                    show: false,
                    color: '#ffffff',
                },
                axisLabel: {
                    textStyle: {
                        color: '#fff',
                        fontSize: '14',
                    },
                },
                axisTick: {
                    show: false,
                    lineStyle: {
                        color: '#285abc',
                    },
                },
                splitLine: {
                    show: false,
                },
            },
            xAxis: [{
                    axisTick: 'none',
                    axisLine: 'none',
                    offset: '27',
                    data: ['01日', '02日', '03日'],
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: '#285abc',
                            fontSize: '14',
                        },
                        lineHeight: 55,
                    },
                },
                {
                    axisTick: 'none',
                    axisLine: 'none',
                    axisLabel: {
                        show: false,
                    },
                    data: [0, 0, 0],
                },
                {
                    name: '单位：件',
                    nameGap: '50',
                    data: [],
                },
            ],
            series: [{
                    name: '℃',
                    type: 'bar',
                    xAxisIndex: 0,
                    data: [52, 60, 22],
                    barWidth: 5,
                    itemStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
                                    offset: 0,
                                    color: '#93FE94',
                                },
                                {
                                    offset: 0.5,
                                    color: '#E4D225',
                                },
                                {
                                    offset: 1,
                                    color: '#E01F28',
                                },
                            ]),
                        },
                    },
                    z: 2,
                },
                {
                    name: '温度背景框',
                    type: 'bar',
                    xAxisIndex: 1,
                    barGap: '-100%',
                    data: [99, 99.5, 99.5],
                    barWidth: 8,
                    itemStyle: {
                        normal: {
                            // color: '#0e2147',
                            barBorderRadius: 5,
                        },
                    },
                    z: 1,
                },
                {
                    name: '外框',
                    type: 'bar',
                    xAxisIndex: 2,
                    barGap: '-100%',
                    data: [100, 100, 100],
                    barWidth: 10,
                    itemStyle: {
                        normal: {
                            color: '#4577BA',
                            barBorderRadius: 50,
                        },
                    },
                    z: 0,
                },
                {
                    name: '外圆',
                    type: 'scatter',
                    hoverAnimation: false,
                    data: [0, 0, 0],
                    xAxisIndex: 2,
                    symbolSize: 15,
                    itemStyle: {
                        normal: {
                            color: '#93FE94',
                            opacity: 1,
                        },
                    },
                    z: 2,
                },
                {
                    name: '白圆',
                    type: 'scatter',
                    hoverAnimation: false,
                    data: [0, 0, 0],
                    xAxisIndex: 1,
                    symbolSize: 20,
                    itemStyle: {
                        normal: {
                            color: '#0C2E6D',
                            opacity: 1,
                        },
                    },
                    z: 1,
                },
                {
                    name: '外圆',
                    type: 'scatter',
                    hoverAnimation: false,
                    data: [0, 0, 0],
                    xAxisIndex: 2,
                    symbolSize: 23,
                    itemStyle: {
                        normal: {
                            color: '#4577BA',
                            opacity: 1,
                        },
                    },
                    z: 0,
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
            myChart.dispose();
        });

        return {
            chart
        };
    }
};
</script>