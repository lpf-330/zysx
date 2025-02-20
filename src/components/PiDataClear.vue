<template>
    <div class="nowData">
        <span class="title">平均指数</span>
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

        const textColor = '#666'
        const seriesData = [62, 65, 59, 52, 78]
        const xAxisList = [
            '11.06',
            '11.07',
            '11.08',
            '11.09',
            '11.10'
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
                    top: '2%',
                    bottom: '10%',
                    left: '10%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: xAxisList,
                    axisLabel: {
                        // 坐标轴字体颜色
                        color: textColor,
                        fontSize: 18
                    },
                    axisLine: {
                        lineStyle: {
                            color: textColor
                        }
                    },
                    axisTick: {
                        // y轴刻度线
                        show: true
                    },
                    splitLine: {
                        // 网格
                        show: false
                    },
                    boundaryGap: false
                },
                yAxis: {
                    type: 'value',
                    min: 0,
                    name: '灌注指数',
                    nameTextStyle: {
                        color: '#333',
                        fontSize: 25,
                        padding: [0, 0, 0, 80]
                    },
                    axisLabel: {
                        // 坐标轴字体颜色
                        color: textColor,
                        fontSize: 18
                    },
                    axisLine: {
                        show: true
                    },
                    axisTick: {
                        // y轴刻度线
                        show: false
                    },
                    splitLine: {
                        // 网格
                        show: true,
                        lineStyle: {
                            color: '#CCCCCC',
                            type: 'dashed'
                        }
                    }
                },

                series: [
                    {
                        name: '灌注指数',
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

        return {
            chart
        };
    }
};
</script>