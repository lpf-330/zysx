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
import 'echarts-liquidfill'
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
        type: Number,
        required: true
    }
})

const chart = ref(null);
        let myChart = null;

        var value = props.data;

        const initChart = () => {
            if (chart.value) {
                myChart = echarts.init(chart.value);
                updateChart();
            }
        };

        const updateChart = () => {
            const option = {
                title: {
                    text: '',
                },
                series: [
                    {
                        type: 'liquidFill',
                        radius: '78.1%',
                        center: ['40%', '50%'],
                        color: [
                            {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [
                                    {
                                        offset: 0,
                                        color: '#daf4ff', // 0% 处的颜色  
                                    },
                                    {
                                        offset: 1,
                                        color: '#37D3FF', // 100% 处的颜色  
                                    },
                                ],
                            },
                        ],
                        data: [value, value], // data个数代表波浪数  
                        backgroundStyle: {
                            borderWidth: 1,
                            borderColor: '#448af9',
                            color: '#fff',
                        },
                        itemStyle: {
                            opacity: 1, // 波浪的透明度
                            shadowBlur: 0, // 波浪的阴影范围
                        },
                        label: {
                            show: true,
                            formatter: function (param) {
                                return (param.value * 100).toFixed(1) + '%';
                            },
                            fontSize: 16, // 调整字体大小  
                            fontWeight: 'normal',
                            color: '#fff'
                        },
                        outline: {
                            show: false,
                        },
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
</script>

<style>
.iy {
    background-color: #daf4ff;
}
</style>