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
        const payload = {
            id: '',
            data: {
                title: ['生态指数'],
                unit: ['%'],
                data1: [20, 80, 100, 40, 34, 90, 60],
            },
        };

        const unit = payload.data.unit || [];
        const x_data = payload.data.x || [];
        const data1 = payload.data.data1 || [];
        const title = payload.data.title || [];


        const updateChart = () => {
            const option = {
                backgroundColor: '#001037',
                backgroundColor: 'transparent',
                grid: {
                    top: "20%",
                    left: "10%",
                    right: "30%",
                    bottom: "20%",
                    // 是否包含文本
                    containLabel: true,
                },
                title: [{
                    text: ''
                },],
                tooltip: {
                    // 触发类型  经过轴触发axis  经过轴触发item
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
                    // 轴触发提示才有效
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
                    data: x_data,
                    axisTick: {
                        show: false // 是否显示坐标轴轴线
                    },

                    axisLabel: {
                        interval: 0,
                        color: 'rgba(110, 109, 109, 1)',
                        fontSize: 12,

                    },
                    splitLine: {
                        show: false
                    },
                    boundaryGap: true,
                    axisLine: {
                        // lineStyle: {
                        //     color: "rgba(216, 216, 216, 1)",
                        //     width: '1',
                        //     type: 'solid',

                        // }
                        show: false
                    },
                },],
                yAxis: [{
                    type: 'value',
                    min: 0,
                    max: 100,
                    axisLabel: { //坐标轴刻度标签的相关设置。
                        show: false,
                        textStyle: {
                            color: 'rgba(110, 109, 109, 1)',
                            fontSize: 12,
                        }
                    },
                    axisLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                        show: false,
                        // lineStyle: {
                        //     color: 'rgba(216, 216, 216, 1)',
                        //     type: 'dashed',
                        // }
                    },
                    show: true,
                }],
                series: [{
                    name: title[0],
                    type: 'bar',
                    barWidth: 10,
                    showBackground: true,
                    backgroundStyle: {
                        color: 'rgba(21,136,209,0.0)',
                    },
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgb(127, 202, 255)', //渐变1
                        },
                        {
                            offset: 0.25,
                            color: 'rgb(127, 229, 255)', //渐变1
                        },
                        {
                            offset: 0.5,
                            color: 'rgb(127, 246, 255)', //渐变1
                        },
                        {
                            offset: 0.75,
                            color: 'rgb(127, 253, 255)', //渐变1
                        }, {
                            offset: 1,
                            color: 'rgb(127, 255, 212)', //渐变1
                        }

                        ]),
                    },
                    data: data1,
                    z: 0,
                    zlevel: 0,
                },
                {
                    type: 'pictorialBar',
                    barWidth: 10,
                    itemStyle: {
                        color: '#fff', //数据的间隔颜色
                    },
                    symbolRepeat: 'true',
                    symbolMargin: 3,
                    symbol: 'rect',
                    symbolSize: [11, 2],
                    data: data1,
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

<style>
.hj {
    background-color: rgb(127, 202, 255);
}
</style>