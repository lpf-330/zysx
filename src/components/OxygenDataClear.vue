<template>
    <div class="nowData">
        <span class="title">平均浓度</span>
        <div class="dataBox">
            <span class="data">{{ data[data.length - 1] }}&nbsp;</span>
            <span class="unit">%</span>
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
import 'echarts-liquidfill'
import axios from 'axios';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';

let userInfoStore = storeToRefs(useUserInfoStore())
let user_id = userInfoStore.user.value.user_id


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
//const data = ref([45.1, 35.2, 30.3, 53.4, 95, 23.6, 21.7])
const data = ref([])
//日期
//const date = ref(['15:00', '15:01', '15:02', '15:03', '15:04', '15:05', '15:06'])
const date = ref([])


const cancelTokenSource = axios.CancelToken.source();

const fetchOxygenData = async () => {

    try {

        // 获取帖子 ID  
        const url = `http://localhost:8081/oxygenData`;
        const response = await axios.post(url, {
            cancelToken: cancelTokenSource.token
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.data.code === 1) {
            for (let j = 0; j < response.data.length; j++) {
                data.value.push(response.data[j].oxygenData)
                date.value.push(response.data[j].Date)
            }
        } else {
            alert(response.data.msg)
        }
        // data.value = Object.values(data.value)
        // date.value = Object.values(date.value)

        console.log('响应血氧', response.data);
        // console.log('data', data.value);
        // console.log('date', date.value);



    } catch (error) {
        console.error("出错", error);
        alert("加载失败，请稍后再试。"); // 友好的错误提示  

    }
}



const chart = ref(null);
let myChart = null;

var charts = {
    unit: '浓度',
    names: [''],
    lineX: date.value,
    value: [
        data.value,
        // [360, 545, 80, 192, 330, 580, 192, 80, 250, 453, 352, 28, 625, 345, 65, 325],
        // [220, 125, 80, 192, 120, 180, 192, 80, 150, 153, 152, 128, 125, 145, 65, 125]
    ]

}
var color = ['rgba(0, 190, 250', 'rgba(0,61,150', 'rgba(0,0,225']
var lineY = []

for (var i = 0; i < charts.names.length; i++) {
    var x = i

    let data = {
        name: charts.names[i],
        type: 'line',
        color: color[x] + ')',
        smooth: true,
        areaStyle: {
            normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: color[x] + ', 0.8)'
                }, {
                    offset: 0.8,
                    color: color[x] + ', 0)'
                }], false),
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                shadowBlur: 10
            }
        },
        symbol: 'circle',
        symbolSize: 5,
        data: charts.value[i]
    }
    lineY.push(data)
}

const initChart = () => {
    if (chart.value) {
        myChart = echarts.init(chart.value);
        updateChart();
    }
};

const updateChart = async () => {

    await fetchOxygenData()

    var option = {
        // backgroundColor:'#0d235e',
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: charts.names,
            textStyle: {
                fontSize: 12,
                color: 'rgb(0,253,255,0.6)'
            },
            right: '4%'
        },
        grid: {
            top: '2%',
            bottom: '10%',
            left: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            offset: 20,
            boundaryGap: false,
            data: charts.lineX,
            axisLine: {
                lineStyle: {
                    color: 'black'
                }
            },
            axisLabel: {
                textStyle: {
                    color: 'balck',
                    fontSize: 16
                },
                formatter: function (params) {
                    return params.split(' ')[0]
                }
            }
        },
        yAxis: {
            name: charts.unit,
            type: 'value',
            offset: 20,
            axisLabel: {
                formatter: '{value}',
                textStyle: {
                    color: 'black',
                    fontSize: 16
                }
            },

            splitLine: {
                show: true,
                lineStyle: {
                    color: '#CCCCCC',
                    type: 'dashed'
                }
            },
            axisLine: {
                lineStyle: {
                    color: 'black'
                }
            }
        },
        dataZoom: {
            type: 'inside',
            start: 50,
            end: 100
        },
        series: lineY
    }
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