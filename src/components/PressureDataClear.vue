<template>
    <div class="nowData">
        <div class="dataBox">
            <span class="classTitle">高压</span>
            <div class="class">
                <span class="data">123</span>
                <span class="unit">mmHg</span>
            </div>
        </div>
        <span class="title">平均血压</span>
        <div class="dataBox">
            <span class="classTitle">低压</span>
            <div class="class">
                <span class="data">123</span>
                <span class="unit">mmHg</span>
            </div>
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
    width: 30%;
    height: 65%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-left: 3%;
    margin-right: 3%;
}

.unit {
    font-size: 0.08rem;
    font-family: 'PuHuiTi';
    color: #8E9AAB;
}

.class {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.classTitle {
    font-size: 0.1rem;
    font-family: 'PuHuiTi';
}
</style>

<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
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

//收缩压
const data1 = ref([709, 1917, 2455, 2610, 1719, 1433, 1009])
//伸缩压
const data2 = ref([-327, -1776, -507, -1200, -800, -482, -998])
//日期
const date = ref([1, 2, 3, 4, 5, 6, 7])


const chart = ref(null);
let myChart = null;

const cancelTokenSource = axios.CancelToken.source();

const fetchData = () => {
    const url = 'http://localhost:8081/'    //这后面还没补上
    const response = await axios.post(url, {
        cancelToken: cancelTokenSource.token
    },
        {
            headers: {
                'Content-Type': 'application/json',
            }
        }
    )
}

const initChart = () => {
    if (chart.value) {
        myChart = echarts.init(chart.value);
        updateChart();
    }
};

const updateChart = () => {
    const option = {
        // backgroundColor: '#344b58',
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
                textStyle: {
                    color: '#fff',
                },
            },
        },
        grid: {
            top: '2%',
            bottom: '10%',
            left: '10%',
            containLabel: true,
            textStyle: {
                color: '#fff',
            },
        },
        calculable: true,
        xAxis: [
            {
                type: 'category',
                // axisLine: {
                //     lineStyle: {
                //         color: 'rgba(255,255,255,.5)',
                //     },
                // },
                splitLine: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                splitArea: {
                    show: false,
                },
                axisLabel: {
                    interval: 0,
                    // color: 'rgba(255,255,255,0.7)',
                    fontSize: 18,
                },
                data: date.value,
            },
        ],
        yAxis: [
            {
                type: 'value',
                offset: 15,
                splitLine: {
                    show: false,
                },
                axisLine: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    interval: 0,
                    // color: 'rgba(255,255,255,0.5)',
                    fontSize: 18,
                    formatter: (m) => {
                        return Math.abs(m);
                    },
                },
                splitArea: {
                    show: false,
                },
            },
        ],
        series: [
            {
                name: '收缩压',
                type: 'bar',
                barWidth: 20,
                gridIndex: 0,
                yAxisIndex: 0,
                label: {
                    show: true,
                    position: 'top',
                },
                itemStyle: {
                    normal: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: 'rgba(35, 157, 250, 0.32)', // 0% 处的颜色
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(35, 157, 250, 1)', // 100% 处的颜色
                                },
                            ],
                            global: false, // 缺省为 false
                        },
                    },
                },
                data: data1.value,
            },

            {
                name: '伸缩压',
                type: 'bar',
                barWidth: 20,
                barGap: '-100%',
                gridIndex: 0,
                yAxisIndex: 0,
                label: {
                    show: true,
                    position: 'bottom',
                    formatter: (m) => {
                        return Math.abs(m.value);
                    },
                },
                itemStyle: {
                    normal: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 1,
                                    color: 'rgba(35, 250, 187, 0.32)', // 0% 处的颜色
                                },
                                {
                                    offset: 0,
                                    color: 'rgba(35, 250, 187, 1)', // 100% 处的颜色
                                },
                            ],
                            global: false, // 缺省为 false
                        },
                        barBorderRadius: 0,
                    },
                },
                data: data2.value,
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

onBeforeUnmount(() => {
    cancelTokenSource.cancel('Component unmounted, request canceled');
})
</script>