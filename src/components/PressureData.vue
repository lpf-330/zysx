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
        type: Array,    //第一个值为收缩压（高压），第二个值为舒张压（低压）
        required: true
    }
})

let information = {
    color: "#069DFD",
    area: ["高压", "低压"],
    dataArray: [560, 480],
};

let style = {
    width: 32,
    height: 24,
    padding: [5, 6, 0, 0],
    fontSize: 20,
    align: "center",
    color: "#ffffff"
}

const chart = ref(null);
let myChart = null;

const initChart = () => {
    if (chart.value && !myChart) {
        myChart = echarts.init(chart.value);
        updateChart();
    }
};

const updateChart = () => {
    if (!myChart || props.data.length === 0) return; // 数据为空时不渲染

    console.log('here');

    const option = {
        grid: {
            left: "4%",
            right: "10%",
            top: "20%",
            bottom: "10%", // 特殊
            containLabel: true,
        },
        xAxis: [
            {
                type: "value",
                show: false,
            },
        ],
        yAxis: [
            {
                type: "category",
                splitLine: {
                    show: false,
                },
                axisLine: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                inverse: true,
                data: information.area,
                axisLabel: {
                    color: "rgba(96, 98, 102, 1)",
                    margin: 10,
                    formatter: (name, index) => {
                        // const id = index + 1;
                        // if (id < 5) {
                        //     return `{nameStyle|${name}}`;
                        // } else {
                        //     return `{nameStyle|${name}}`;
                        // }
                        if (index === 0) {
                            return `{highPressure|${name}}`
                        } else {
                            return `{lowPressure|${name}}`
                        }
                    },
                    rich: {
                        highPressure: {
                            padding: [0, 10, 0, 2],
                            fontSize: 16,
                            color: 'rgb(255, 105, 35)',
                        },
                        lowPressure: {
                            padding: [0, 10, 0, 2],
                            fontSize: 16,
                            color: 'rgb(66, 157, 255)',
                        },
                        rank: {
                            ...style,
                            backgroundColor: new echarts.graphic.LinearGradient(0, 1, 1, 1, [
                                {
                                    offset: 0,
                                    color: '#E7F4FF',
                                },
                                {
                                    offset: 0.95,
                                    color: '#fff',
                                },
                            ]),
                        },
                        rank1: {
                            ...style,
                            color: "#FF992B",
                            backgroundColor: new echarts.graphic.LinearGradient(0, 1, 1, 1, [
                                {
                                    offset: 0,
                                    color: '#E7F4FF',
                                },
                                {
                                    offset: 0.95,
                                    color: '#fff',
                                },
                            ]),
                        },
                    },
                },
            },
            {
                inverse: true,
                axisTick: "none",
                axisLine: "none",
                show: true,
                axisLabel: {
                    color: "rgb(0, 0, 0)",
                    fontSize: 16,
                    margin: 20,
                    formatter: function (value) {
                        return value + 'mmhg';
                    },
                },
                data: props.data,
            },
        ],
        series: [
            {
                type: "bar",
                barWidth: 14, // 柱子宽度
                MaxSize: 0,
                showBackground: true,
                backgroundStyle: {
                    color: "rgb(157, 230, 230)",
                    borderRadius: 5, //设置背景的圆角
                },
                data: props.data.map((item) => {
                    return {
                        value: item,
                        itemStyle: {
                            borderRadius: 5,
                            color: information.color,
                        },
                    };
                }),
            },
            {
                type: 'scatter',
                emphasis: {
                    scale: false
                },
                symbol: 'rect',
                itemStyle: {
                    barBorderRadius: [30, 0, 0, 30],
                    color: '#fff',
                    shadowColor: '#fff',
                    shadowBlur: 1,
                    borderWidth: 1,
                    opacity: 1
                },
                symbolSize: [4, 13], // 进度条白点的大小
                z: 2,
                data: props.data,
            },
        ],
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

<style scoped>
.hhh {
    background-color: rgb(0, 0, 0);
}
</style>
