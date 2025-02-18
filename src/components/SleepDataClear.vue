<template>  
    <div ref="chart" style="width: 100%; height: 85%;"></div>  
</template>  

<script>  
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

export default {  
    setup() {  
        const chart = ref(null);  
        let myChart = null;  

        const dataX = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];  
        const y = [40, 58, 40, 44, 61, 58, 77, 60, 78, 53, 70, 53];  
        const y1 = [50, 48, 44, 62, 41, 78, 57, 70, 68, 93, 60, 73];  

        const initChart = () => {  
            if (chart.value) {  
                myChart = echarts.init(chart.value);  
                updateChart();  
            }  
        };  

        const updateChart = () => {  
            const option = {  
        title: {  
            // text: '第六使徒迪瑞吉',  
            left: "center",  
            top: "8%",  
            textStyle: {  
                color: '#111111', // 标题颜色  
                fontWeight: 'bold',  
                fontSize: 16,  
            },  
        },  
        tooltip: {  
            trigger: 'axis',  
            backgroundColor: 'rgba(33,56,77,1)',  
            borderColor: 'rgba(33,56,77,1)',  
            textStyle: {  
                color: '#fff',  
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
            top: '16%',  
            right: '4%',  
            bottom: '4%',  
            left: '6%',  
            containLabel: true  
        },  
        xAxis: {  
            data: dataX,  
            type: 'category',  
            boundaryGap: true,  
            axisLabel: {  
                textStyle: {  
                    color: '#B5C5D4',  
                    fontSize: 12  
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
                    color: '#B5C5D4',  
                    fontSize: 12  
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
                data: y,  
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

        return {  
            chart  
        };  
    }  
};  
</script>