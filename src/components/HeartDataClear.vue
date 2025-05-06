<template>
    <div class="nowData">
        <span class="title">平均心率</span>
        <div class="dataBox">
            <span class="data">{{ data[data.length - 1] }}</span>
            <span class="unit">bmp</span>
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
import axios from 'axios';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';

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


const data = ref([])
const date = ref([])



const fetchHeartData = async () => {

    try {
        const url = "/api/heartData";
        const response = await axios.post(url, {
            user_id: user_id
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            });


        for (let j = 0; j < response.data.length; j++) {
            data.value.push(response.data[j].heartData)
            date.value.push(response.data[j].created_at)
        }




        console.log("响应心率", response);


    } catch (error) {
        console.error("出错", error);
        alert("加载失败，请稍后再试。");

    }
}



const chart = ref(null);
let myChart = null;

let color = [
    "#FF0000",
    "#00CA69"
];

const hexToRgba = (hex, opacity) => {
    let rgbaColor = "";
    let reg = /^#[\da-f]{6}$/i;
    if (reg.test(hex)) {
        rgbaColor = `rgba(${parseInt("0x" + hex.slice(1, 3))},${parseInt(
            "0x" + hex.slice(3, 5)
        )},${parseInt("0x" + hex.slice(5, 7))},${opacity})`;
    }
    return rgbaColor;
}

const initChart = () => {
    if (chart.value) {
        myChart = echarts.init(chart.value);
        updateChart();
    }
};

const updateChart = async () => {
    await fetchHeartData()

    const option = {
        color: color,
        legend: {
            top: 20,

        },
        tooltip: {
            trigger: "axis",
            extraCssText: 'background: #fff; border-radius: 0;box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);color: #333;',
            axisPointer: {
                type: 'shadow',
                shadowStyle: {
                    color: '#ffffff',
                    shadowColor: 'rgba(225,225,225,1)',
                    shadowBlur: 5
                }
            }
        },
        grid: {
            top: '2%',
            bottom: '10%',
            left: '10%',
            containLabel: true
        },
        xAxis: [{
            type: "category",
            offset: 20,
            axisLabel: {
                formatter: '{value}',
                fontSize: 18,

                textStyle: {
                    color: "#333"
                }//,
            },
            axisTick: {
                show: false
            },
            axisLine: {
                lineStyle: {
                    color: "rgba(17,41,80,1)"
                }
            },
            data: date.value,
        }],
        yAxis: [{
            type: "value",
            offset: 30,
            min: 0,
            max: 160,
            interval: 20,
            splitNumber: 8,
            axisLabel: {
                textStyle: {
                    color: "#666"
                },
                fontSize: 17
            },
            nameTextStyle: {
                color: "#666",
                fontSize: 12,
                lineHeight: 40
            },
            splitLine: {
                lineStyle: {
                    type: "dashed",
                    color: "rgba(17,41,80,0.7)"
                }
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            }
        }],
        series: [{
            type: "line",
            smooth: true,
            symbolSize: 8,
            zlevel: 3,
            lineStyle: {
                normal: {
                    color: color[0],
                    shadowBlur: 3,
                    shadowColor: hexToRgba(color[0], 0.5),
                    shadowOffsetY: 8
                }
            },
            symbol: 'circle',
            data: data.value
        }, {
            type: "line",
            smooth: true,
            symbolSize: 8,
            zlevel: 3,
            lineStyle: {
                normal: {
                    color: color[1],
                    shadowBlur: 3,
                    shadowOffsetY: 8
                }
            },
            symbol: 'circle',
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(
                        0,
                        0,
                        0,
                        1,
                        [{
                            offset: 0,
                            color: hexToRgba(color[1], 0.3)
                        },
                        {
                            offset: 1,
                            color: hexToRgba(color[1], 0.1)
                        }
                        ],
                        false
                    ),
                    shadowColor: hexToRgba(color[1], 0.1),
                    shadowBlur: 10
                }
            },
        }]
    };


    myChart.setOption(option);
};


onMounted(() => {
    initChart();
    window.addEventListener('resize', () => myChart.resize());
},
);

onUnmounted(() => {
    window.removeEventListener('resize', () => myChart.resize());
    myChart.dispose();
});

</script>