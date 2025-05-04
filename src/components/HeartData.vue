<template>
    <div ref="chart" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted,watch } from 'vue';
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
        type: Array,
        required: true
    }
})

// console.log('heartData',props.data,typeof(props.data[0]));


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

    const option = {
        name: '心率',
        backgroundColor: '#fff',
        grid: {
            left: '5%',
            right: '10%',
            bottom: '40%',
            top: '40%',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            data: [1,2,3,4],
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
            min: Math.min(...props.data)-5, //最低为最低减5
            max: Math.max(...props.data)+5, //最高为最高值加5
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
            data: props.data
        },]
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

// export default {
//     setup() {
        

//         return {
//             chart
//         };
//     }
// };
</script>