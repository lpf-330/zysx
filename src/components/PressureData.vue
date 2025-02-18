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
                color: ['transparent', '#3398DB'],
                grid: {
                    left: '20%',
                    right: '35%',
                    bottom: '20%',
                    top: '20%'
                },
                xAxis: [{
                    type: 'category',
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: false
                    },
                }],
                yAxis: [{
                    type: 'value',
                    splitLine: {
                        show: false
                    },
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: false
                    }
                }],
                series: [{
                    name: 'A',
                    type: 'bar',
                    data: [{
                        value: 100, percent: '10'
                    }, {
                        value: 100, percent: '20'
                    }, {
                        value: 100, percent: '30'
                    }, {
                        value: 100, percent: '40'
                    }],
                    barWidth: 20,
                    itemStyle: {
                        borderColor: '#999',
                        barBorderRadius: 100
                    },
                    label: {
                        show: false,
                        // position: 'top',
                        // color: '#999',
                        // formatter: function (item) {
                        //     return item.data.percent + '%';
                        // }
                    }
                },
                {
                    name: 'B',
                    type: 'bar',
                    barWidth: 20,
                    data: [20, 40, 60, 80],
                    barGap: '-98%',
                    itemStyle: {
                        barBorderRadius: 100
                    }
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

<style>
.kl {
    background-color: rgb(255, 177, 33);
}
</style>