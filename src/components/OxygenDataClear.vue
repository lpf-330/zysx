<template>
    <div ref="chart" style="width: 100%; height: 90%;"></div>
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
import 'echarts-liquidfill'  

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

        var charts = {
        unit: '浓度',
        names: [''],
        lineX: ['15:00','15:01','15:02','15:03','15:04','15:05','15:06','15:07','15:08','15:09','15:10','15:11','15:12','15:13','15:14','15:15'],
        value: [
        [4510, 352, 303, 534, 95, 236, 217, 328, 159, 151, 231, 192, 453, 524, 165, 236],
        [360, 545, 80, 192, 330, 580, 192, 80, 250, 453, 352, 28, 625, 345, 65, 325],
        [220, 125, 80, 192, 120, 180, 192, 80, 150, 153, 152, 128, 125, 145, 65, 125]
    ]

}
var color = ['rgba(0, 190, 250', 'rgba(0,61,150','rgba(0,0,225']
var lineY = []

for (var i = 0; i < charts.names.length; i++) {
    var x = i
    
    var data = {
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

        const updateChart = () => {
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
                top: '14%',
                left: '4%',
                right: '4%',
                bottom: '12%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: charts.lineX,
                axisLine:{
                    lineStyle:{
                        color:'black'
                    }
                },
                axisLabel: {
                    textStyle: {
                        color: 'balck'
                    },
                    formatter: function(params) {
                        return params.split(' ')[0] 
                    }
                }
            },
            yAxis: {
                name: charts.unit,
                type: 'value',
                axisLabel: {
                    formatter: '{value}',
                    textStyle: {
                        color: 'black'
                    }
                },
                
                splitLine: {
                    lineStyle: {
                        color: 'black'
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: 'black'
                    }
                }
            },
            dataZoom:{
                type:'inside',
                start:50,
                end:100
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

        return {
            chart
        };
    }
};
</script>