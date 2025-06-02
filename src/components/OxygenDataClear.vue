<template>
    <div class="nowData">
        <span class="title">平均浓度</span>
        <div class="dataBox">
            <span class="data">{{ nowData }}&nbsp;</span>
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
import dateFormatter from '../utils/dateFormatter';

let userInfoStore = storeToRefs(useUserInfoStore())
let user_id = userInfoStore.user_id.value


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

const nowData = ref(0)
const data = ref([])
const formattedTime = ref([])
let pollInterval = null;

const fetchOxygenData = async () => {

    try {

        const url = `/api/oxygenData`;
        const response = await axios.post(url, {
            user_id: user_id
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (data.value.length === 0) {
            for (let j = 0; j < response.data.length; j++) {
                data.value.push(response.data[j].oxygenData)

                formattedTime.value.push(dateFormatter.Formatter(response.data[j].created_at))
            }
        } else {
            for (let j = 0; j < response.data.length; j++) {
                // data.value.push(response.data[j].heartData)
                data.value[j] = response.data[j].oxygenData

                // formattedTime.value.push(dateFormatter.Formatter(response.data[j].created_at))
                const tem = dateFormatter.Formatter(response.data[j].created_at)
                formattedTime.value[j].time = tem.time
                formattedTime.value[j].date = tem.date
            }
        }

        nowData.value = data.value[data.value.length - 1]

    } catch (error) {
        console.error("出错", error);
        alert("加载失败，请稍后再试。");

    }
}



const chart = ref(null);
let myChart = null;

var charts = {
    unit: '浓度',
    names: [''],
    lineX: [],
    value: [
        data.value,
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

    charts.lineX = dateFormatter.getTime(formattedTime.value)

    var option = {
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {

                return `
                ${params.map((param, i) => {
                    return `<div style="margin-bottom:5px">${dateFormatter.getDate(formattedTime.value)[i]}</div>
                            <div>${param.marker + "  "}${param.data}</div>`;
                }).join('')}
                `;
            }
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
                    color: '#666',
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
    pollInterval = setInterval(updateChart, 2000); // 每2秒轮询一次
});

onUnmounted(() => {
    if (pollInterval) {
        clearInterval(pollInterval);
    }
    window.removeEventListener('resize', () => myChart.resize());
    myChart.dispose();
});

</script>