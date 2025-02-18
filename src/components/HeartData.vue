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
                name: '心率',
                backgroundColor: '#fff',
                grid: {
                    left: '-2%',
                    right: '5%',
                    bottom: '20%',
                    top: '25%',
                    containLabel: true
                },
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    data: ['9.23', '10.3', '10.11', '10.15'],
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
                    min: 80, //最低为最低减5
                    max: 92, //最高为最高值加5
                }],
                series: [{
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    //        symbolSize: 2,
                    showSymbol: true,
                    //       color:'#ffffff',
                    lineStyle: {
                        normal: {
                            width: 5,
                            color: '#fa8d55',
                        }
                    },
                    areaStyle: {
                        normal: {
                            // color: new echarts.graphic.LinearGradient(1, 1, 1, 0, [{
                            //     offset: 0,
                            //     color: 'rgba(251,153,102, 1)'
                            // }, {
                            //     offset: 1,
                            //     color: 'rgba(251,153,102, 0.3)'
                            // }]),
                            color: "#fff"
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#fa8d55',
                            borderColor: 'red',
                            borderWidth: 7,
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            color: '#ffffff',
                            fontSize: 24,
                        }
                    },
                    // markLine: {
                    //     lineStyle: {
                    //         normal: {
                    //             color: 'rgba(0,0,0,0.3)',
                    //         },
                    //     },
                    //     data: [{
                    //         name: '最高',
                    //         label: {
                    //             normal: {
                    //                 formatter: '正常心率 100次/分',
                    //                 position: 'middle',
                    //                 fontSize: 18,
                    //             }
                    //         },
                    //         yAxis: 100,//高100为界
                    //     },
                    //     {
                    //         name: '最低',
                    //         label: {
                    //             normal: {
                    //                 formatter: '正常心率 60次/分',
                    //                 position: 'middle',
                    //                 fontSize: 18,
                    //             }
                    //         },
                    //         yAxis: 60,//高100为界

                    //     }]
                    // },
                    data: [86, 87, 87, 87]
                },]
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