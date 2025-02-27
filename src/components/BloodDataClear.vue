<template>
    <div class="nowData">
        <span class="title">平均浓度</span>
        <div class="dataBox">
            <span class="data">{{ data[data.length - 1] }}&nbsp;</span>
            <span class="unit">mmol/L</span>
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
import { color } from 'echarts';
import axios from 'axios';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';

let userInfoStore = storeToRefs(useUserInfoStore())

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

const cancelTokenSource = axios.CancelToken.source();

//数据
//const data = ref([5.5, 8.0, 10.1, 6.3, 6.4, 8.9, 6.0])
const data = ref([])
//日期
// const date = ref(['1', '2', '3', '4', '5', '6', '7'])
const date = ref([])


const fetchBloodData = async () => {

    try {

        // 获取帖子 ID  
        const url = `http://localhost:8081/bloodData`; // 拼接 URL  
        const response = await axios.post(url, {
            cancelToken: cancelTokenSource.token,
            user_id: userInfoStore.user_id.value
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        if (response.data.code === 1) {
            for (let j = 0; j < response.data.length; j++) {
                data.value.push(response.data[j].data.bloodData)
                date.value.push(response.data[j].data.Date)
            }
        } else {
            alert(response.data.msg)
        }

        console.log('响应血糖', response.data);



    } catch (error) {
        console.error("出错", error);
        alert("加载失败，请稍后再试。"); // 友好的错误提示  

    }
}



const chart = ref(null);
let myChart = null;

const payload = {
    id: '',
    data: {
        title: ['平均浓度'],
        unit: ['mmol/L'],
        x: date.value,
        data1: data.value,
    },
};

const unit = payload.data.unit || [];
const x_data = payload.data.x || [];
const data1 = payload.data.data1 || [];
const title = payload.data.title || [];

const initChart = () => {
    if (chart.value) {
        myChart = echarts.init(chart.value);
        updateChart();
    }
};

const updateChart = async () => {

    await fetchBloodData()

    const option = {
        grid: {
            top: '2%',
            bottom: '10%',
            left: '10%',
            containLabel: true
        },
        // title: [{
        //     text: ''
        // },],
        tooltip: {
            // 触发类型  经过轴触发axis  经过轴触发item
            trigger: 'axis',
            backgroundColor: '#fff',
            // extraCssText: 'box-shadow: 0 0 8px rgba(0, 128, 255, 0.27) inset;',
            // borderWidth: 0,
            // confine: false,
            // appendToBody: true,
            // textStyle: {
            //     // color: '#fff',
            //     fontSize: 10,
            // },
            // 轴触发提示才有效
            // axisPointer: {
            //     type: 'shadow',
            // },
            // shadowStyle: {
            //     color: 'rgba(8, 4, 4, 0.80)',
            // },
            formatter: function (params) {
                // console.log(params)
                return params[0].value + 'mmol/L';
            },
        },
        xAxis: [{
            type: 'category',
            data: x_data,
            offset: 15,
            axisTick: {
                show: false // 是否显示坐标轴轴线
            },

            axisLabel: {
                interval: 0,
                color: 'rgba(110, 109, 109, 1)',
                fontSize: 16,

            },
            splitLine: {
                show: false
            },
            boundaryGap: true,
            axisLine: {
                lineStyle: {
                    color: "rgba(216, 216, 216, 1)",
                    width: '1',
                    type: 'solid',

                }
            },
        },],
        yAxis: [{
            type: 'value',
            min: 0,
            max: 15,
            offset: 20,
            axisLabel: { //坐标轴刻度标签的相关设置。
                show: true,
                textStyle: {
                    color: 'rgba(110, 109, 109, 1)',
                    fontSize: 16,
                }
            },
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: 'rgba(216, 216, 216, 1)',
                    type: 'dashed',
                }
            },
            show: true,
        }],
        series: [
            {
                name: title[0],
                type: 'bar',
                barWidth: 10,
                showBackground: true,
                backgroundStyle: {
                    color: 'rgba(21,136,209,0.0)',
                },
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 1,
                        color: 'rgb(0, 102, 255)', //渐变1
                    },
                    {
                        offset: 0.75,
                        color: 'rgb(0, 38, 255)', //渐变1
                    },
                    {
                        offset: 0.5,
                        color: 'rgb(89, 0, 255)', //渐变1
                    },
                    {
                        offset: 0.25,
                        color: 'rgb(255, 0, 238)', //渐变1
                    }, {
                        offset: 0,
                        color: 'rgb(255, 0, 85)', //渐变1
                    }

                    ]),
                },
                data: data1,
                z: 0,
                zlevel: 0,
            },
            {
                type: 'pictorialBar',
                barWidth: 10,
                itemStyle: {
                    color: '#fff', //数据的间隔颜色
                },
                symbolRepeat: 'true',
                symbolMargin: 3,
                symbol: 'rect',
                symbolSize: [11, 2],
                data: data1,
                z: 1,
                zlevel: 0,
                label: {
                    show: false,
                    position: 'top',
                    fontSize: 14,
                    color: '#fff', //柱状顶部文字颜色
                    formatter: function (params) {
                        return params.data;
                    },
                }
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