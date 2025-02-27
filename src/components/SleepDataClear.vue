<template>
    <div class="nowData">
        <span class="title">平均时长</span>
        <div class="dataBox">
            <span class="data">{{ Math.floor(data[data.length - 1] / 60) }}&nbsp;</span>
            <span class="unit">h&nbsp;</span>
            <span class="data">{{ data[data.length - 1] % 60 }}&nbsp;</span>
            <span class="unit">min&nbsp;</span>
        </div>
    </div>
    <div ref="chart" style="width: 100%; height: 100%;"></div>
</template>

<style scoped>
.nowData {
    height: 15%;
    width: 40%;
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

//数据
const data = ref([40, 58, 40, 44, 61, 58, 77]);
//日期
const date = ref(['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00']);
// const y1 = [50, 48, 44, 62, 41, 78, 57, 70, 68, 93, 60, 73];

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
        // title: {
        //     // text: '第六使徒迪瑞吉',  
        //     left: "center",
        //     top: "8%",
        //     textStyle: {
        //         color: '#111111', // 标题颜色  
        //         fontWeight: 'bold',
        //         fontSize: 16,
        //     },
        // },
        tooltip: {
            trigger: 'axis',
            // backgroundColor: 'rgba(33,56,77,1)',
            // borderColor: 'rgba(33,56,77,1)',
            textStyle: {
                // color: '#fff',
                fontSize: 14
            },
            axisPointer: {
                lineStyle: {
                    color: 'rgba(19,255,241,1)',
                    type: 'dashed',
                    width: 2
                }
            }
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
            top: '2%',
            bottom: '10%',
            left: '10%',
            containLabel: true
        },
        xAxis: {
            data: date.value,
            type: 'category',
            boundaryGap: true,
            offset: 20,
            axisLabel: {
                textStyle: {
                    // color: '#B5C5D4',
                    fontSize: 16
                }
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
            name: '睡眠时长',
            offset: 20,
            nameTextStyle: {
                color: '#B5C5D4',
                fontSize: 12,
                padding: [0, 0, 0, -20]
            },
            axisTick: { show: false },
            axisLine: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    // color: '#B5C5D4',
                    fontSize: 16
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#9EA6B4',
                    type: 'solid'
                }
            }
        },
        series: [
            {
                smooth: true,
                type: 'line',
                showSymbol: false,
                symbolSize: 8,
                itemStyle: {
                    color: 'rgba(253, 190, 93, 1)'
                },
                areaStyle: {
                    color: 'rgba(0,0,0,0)' // 将阴影颜色设置为透明  
                }
            },
            {
                smooth: true,
                type: 'line',
                showSymbol: false,
                symbolSize: 4,
                itemStyle: {
                    color: 'rgba(26, 119, 221, 1)'
                },
                data: data.value,
                areaStyle: {
                    color: 'rgba(0,0,0,0)' // 将阴影颜色设置为透明  
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

onBeforeUnmount(() => {
    cancelTokenSource.cancel('Component unmounted, request canceled');
})
</script>