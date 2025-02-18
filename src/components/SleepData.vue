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

        const dataX = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const y = props.data;

        const initChart = () => {
            if (chart.value) {
                myChart = echarts.init(chart.value);
                updateChart();
            }
        };

        const updateChart = () => {
            const option = {
                tooltip: {
                    show: false
                    // trigger: 'axis',
                    // backgroundColor: 'rgba(33,56,77,1)',
                    // borderColor: 'rgba(33,56,77,1)',
                    // textStyle: {
                    //     color: '#fff',
                    //     fontSize: 14
                    // },
                    // axisPointer: {
                    //     lineStyle: {
                    //         color: 'rgba(19,255,241,1)',
                    //         type: 'dashed',
                    //         width: 2
                    //     }
                    // }
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
                    top: '16%',
                    right: '4%',
                    bottom: '4%',
                    left: '1%',
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
                        show: false // 去除刻度线
                    }
                },
                yAxis: {
                    type: 'value',
                    axisTick: { show: false },
                    axisLine: {
                        show: false
                    },
                    axisLabel: {
                        show: false
                    },
                    // y轴分割线的颜色
                    splitLine: {
                        // lineStyle: {
                        //     color: '#9EA6B4',
                        //     type: 'solid',
                        // }
                        show: false
                    }
                },
                series: [
                    {
                        // name: '总流量',
                        smooth: true,
                        type: 'line',
                        // 填充颜色设置
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(
                                0,
                                0,
                                0,
                                1,
                                [
                                    {
                                        offset: 0,
                                        color: 'rgba(253, 190, 93,.4)' // 渐变色的起始颜色
                                    },
                                    {
                                        offset: 0.9,
                                        color: 'rgba(253, 190, 93,0)' // 渐变线的结束颜色
                                    }
                                ],
                                false
                            ),
                            shadowColor: 'rgba(0, 0, 0, 0.1)'
                        },
                        // 开始不显示拐点， 鼠标经过显示
                        showSymbol: false,
                        symbolSize: 8,
                        // 设置拐点颜色以及边框
                        itemStyle: {
                            color: 'rgba(253, 190, 93, 1)'
                        },
                        // data: y1
                    },
                    {
                        // name: '进园',
                        smooth: true,
                        type: 'line',
                        // 填充颜色设置
                        // areaStyle: {
                        //     color: new echarts.graphic.LinearGradient(
                        //     0,
                        //     0,
                        //     0,
                        //     1,
                        //     [
                        //         {
                        //             offset: 0,
                        //             color: 'rgba(26, 119, 221,.4)' // 渐变色的起始颜色
                        //         },
                        //         {
                        //             offset: 0.9,
                        //             color: 'rgba(26, 119, 221,0)' // 渐变线的结束颜色
                        //         }
                        //     ],
                        //     false
                        //     ),
                        //     shadowColor: 'rgba(0, 0, 0, 0.1)'
                        // },
                        // 开始不显示拐点， 鼠标经过显示
                        showSymbol: false,
                        symbolSize: 4,
                        // 设置拐点颜色以及边框
                        itemStyle: {
                            // color: "rgba(241,162,42,1)",
                            color: 'rgba(26, 119, 221, 1)'
                        },
                        data: y
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