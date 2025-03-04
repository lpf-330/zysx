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

//数据
//const data = ref(['100', '138', '127', '113', '120', '100', '110']);
const data = ref([])
//日期
//const date = ref(["2025-01-12", "2025-01-13", "2025-01-14", "2025-01-15", "2025-01-16", "2025-01-17", "2025-01-18"]);
const date = ref([])

//const cancelTokenSource = axios.CancelToken.source();

const fetchHeartData = async () => {

    try {
        const url = "http://localhost:8081/heartData";
        const response = await axios.post(url, {
            // cancelToken: cancelTokenSource.token,
            //user_id: Number(user_id)
            user_id: user_id
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            });


        for (let j = 0; j < response.data.length; j++) {
            data.value.push(response.data[j].heartData)
            date.value.push(response.data[j].Date)
        }




        console.log("响应心率", response);


    } catch (error) {
        console.error("出错", error);
        alert("加载失败，请稍后再试。"); // 友好的错误提示  

    }
}



// onMounted(fetchHeartData)
// onBeforeMount(fetchHeartData)


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
    // console.log('updateChart', data.value, date.value);
    await fetchHeartData()

    const option = {
        //backgroundColor: '#fff',
        color: color,
        legend: {
            top: 20,

        },
        tooltip: {
            trigger: "axis",
            // formatter: function (params) {
            //     let html = '';
            //     params.forEach(v => {
            //         html += `<div style="color: #666;font-size: 14px;line-height: 24px">
            //     <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color[v.componentIndex]};"></span>
            //     ${v.seriesName}2020.${v.name}  
            //     <span style="color:${color[v.componentIndex]};font-weight:700;font-size: 18px;margin-left:5px">${v.value}</span>
            //     次`;
            //     })
            //     return html
            // },
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
            // boundaryGap: false,
            offset: 20,
            axisLabel: {
                formatter: '{value}',
                fontSize: 18,

                textStyle: {
                    color: "#333"
                }//,
                //rotate:20

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
            // name: '心率',
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
            // 分割线
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
            // name: "2018",
            // name: "一般隐患",
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
            symbol: 'circle',//数据交叉点样式
            data: data.value
        }, {
            // name: "重大隐患",
            type: "line",
            smooth: true,
            symbolSize: 8,
            zlevel: 3,
            lineStyle: {
                normal: {
                    color: color[1],
                    shadowBlur: 3,
                    // shadowColor: hexToRgba(color[1], 0.5),
                    shadowOffsetY: 8
                }
            },
            symbol: 'circle',//数据交叉点样式 (实心点)
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
            // data: yAxisData2
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
    // cancelTokenSource.cancel('Component unmounted, request canceled');
    window.removeEventListener('resize', () => myChart.resize());
    myChart.dispose();
});

onBeforeUnmount(() => {
    //cancelTokenSource.cancel('Component unmounted, request canceled');
})
</script>