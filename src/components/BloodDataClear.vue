<template>
    <div class="nowData">
        <span class="title">平均浓度</span>
        <div class="dataBox">
            <span class="data">123</span>
            <span class="unit">mmol/L</span>
        </div>
    </div>
    <div ref="chart" style="width: 100%; height: 100%;"></div>
</template>

<style scoped>
.nowData {
    height: 15%;
    width: 35%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.title {
    font-size: 0.18rem;
    font-family: 'PuHuiTi';
}

.data {
    font-size: 0.14rem;
    color: #F7819B;
}

.dataBox {
    background-color: #fff;
    border-radius: 0.05rem;
    width: 25%;
    height: 60%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-left: 5%;
}

.unit {
    font-size: 0.08rem;
    font-family: 'PuHuiTi';
    color: #8E9AAB;
}
</style>

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

        const payload = {
            id: '',
            data: {
                title: ['平均浓度'],
                unit: ['mmol/L'],
                x: ['1', '2', '3', '4', '5', '6', '7'],
                data1: [20, 80, 100, 40, 34, 90, 60, 20, 80, 100, 40, 34],
            },
        };

        const unit = payload.data.unit || [];
        const x_data = payload.data.x || [];
        const data1 = payload.data.data1 || [];
        const title = payload.data.title || [];

        const initChart = () => {
            if (chart.value) {
                myChart = echarts.init(chart.value);
                updateChart();
            }
        };

        const updateChart = () => {
            const option = {
                backgroundColor: '#001037',
                backgroundColor: 'transparent',
                grid: {
                    top: '2%',
                    bottom: '10%',
                    left: '10%',
                    containLabel: true
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
                        return params[0].value + 'mmol/L';
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
                        lineStyle: {
                            color: "rgba(216, 216, 216, 1)",
                            width: '1',
                            type: 'solid',

                        }
                    },
                },],
                yAxis: [{
                    type: 'value',
                    min: 0,
                    max: 100,
                    axisLabel: { //坐标轴刻度标签的相关设置。
                        show: true,
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
                        show: true,
                        lineStyle: {
                            color: 'rgba(216, 216, 216, 1)',
                            type: 'dashed',
                        }
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
                            color: 'rgba(244, 43, 39, 1)', //渐变1
                        },
                        {
                            offset: 0.25,
                            color: 'rgba(246, 127, 42, 1)', //渐变1
                        },
                        {
                            offset: 0.5,
                            color: 'rgba(255, 208, 39, 1)', //渐变1
                        },
                        {
                            offset: 0.75,
                            color: 'rgba(70, 212, 211, 1)', //渐变1
                        }, {
                            offset: 1,
                            color: 'rgba(23, 167, 144, 1)', //渐变1
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
                        color: '#fff', //柱状顶部文字颜色
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