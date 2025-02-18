<template>
    <div ref="chart" style="width: 90%; height: 90%;"></div>
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

        const initChart = () => {
            if (chart.value) {
                myChart = echarts.init(chart.value);
                updateChart();
            }
        };

        const updateChart = () => {
            const option = {
            name:'心率',
            // backgroundColor: '#ffc3a5',
            title: {
                // text: '88次', //最近一次体重
                // subtext: '      心率',
                textStyle: {
                    fontWeight: 'bolder',
                    fontSize: 48,
                    // color: '#FFFFFF',
                },
                subtextStyle: {
                    fontWeight: 'bolder',
                    fontSize: 24,
                    // color: '#fa8d55',
                },
                right: '5%',
                top: '5%'
            },
            grid: {
                left: '1%',
                right: '5%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: ['9.23', '10.3', '10.11', '10.15', '10.26', '12.26'],
                axisLabel: {
                    show: true,
                    interval:0,
                    fontSize: 20,
                    // color: '#ffffff',
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
                min: 80, //最低为最低减5
                max: 90, //最高为最高值加5
            }],
            series: [{
                name: '心率',
                type: 'line',
                smooth: true,
                // shadowColor: 'transparent',
                symbol: 'circle',
                //        symbolSize: 2,
                showSymbol: true,
                //       color:'#ffffff',
                itemStyle: {  
                normal: {  
                    color: 'black', // 数据点颜色改为黑色  
                    borderColor: '#000000', // 数据点边框颜色也改为黑色  
                    }  
                }  ,  
                areaStyle: {  
                normal: {  
                    color: 'transparent'  // 删除阴影效果  
                    }  
                },  
                itemStyle: {
                    normal: {
                        color: '#fa8d55',
                        borderColor: 'red',
                        borderWidth: 12,
                    }
                },
                label: {
                    normal: {
                        show: true,
                        position: 'top',
                        color: 'black',
                        fontSize: 24,
                    }
                },
                markLine: {
                    lineStyle: {
                        normal: {
                            color: 'rgba(0,0,0,0.3)',
                        },
                    },
                    data: [{
                        name: '最高',
                        label: {
                            normal: {
                                formatter: '正常心率 100次/分',
                                position: 'middle',
                                fontSize:18,
                            }
                        },
                        yAxis: 100,//高100为界
                    },
                {
                        name: '最低',
                        label: {
                            normal: {
                                formatter: '正常心率 60次/分',
                                position: 'middle',
                                fontSize:18,
                            }
                        },
                        yAxis: 60,//高100为界

                    }]
                },
                data: [86, 87, 87, 87, 86, 85]
            }, ]
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