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

        let color = [
            "#FF0000",
            "#00CA69"
        ];

        let xAxisData = ["5", "10", "15", "20", "25", "30", "35", "40","45","50","55","60"];
        let yAxisData1 = [100, 138, 187, 173, 180, 150, 180, 230,213,200,178,169];
        let yAxisData2 = [45, 23, 14, 34, 22, 56, 44, 12,67,87,43,32];

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

        const updateChart = () => {
            const option = {
            //backgroundColor: '#fff',
            color: color,
            legend: {
            top: 20,
            
            },
            tooltip: {
                trigger: "axis",
                formatter: function(params) {
                    let html = '';
                    params.forEach(v => {
                        html += `<div style="color: #666;font-size: 14px;line-height: 24px">
                        <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color[v.componentIndex]};"></span>
                        ${v.seriesName}2020.${v.name}  
                        <span style="color:${color[v.componentIndex]};font-weight:700;font-size: 18px;margin-left:5px">${v.value}</span>
                        次`;
                    })
                    return html
                },
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
                top: 100,
                containLabel: true
            },
            xAxis: [{
                type: "category",
                boundaryGap: false,
                axisLabel: {
                    formatter: '{value}',
                    textStyle: {
                        color: "#333"
                    }//,
                    //rotate:20
                },
                axisLine: {
                    lineStyle: {
                        color: "#D9D9D9"
                    }
                },
                data: xAxisData,
            }],
            yAxis: [{
                type: "value",
                name: '心率',
                axisLabel: {
                    textStyle: {
                        color: "#666"
                    }
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
                        color: "#E9E9E9"
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
                data: yAxisData1
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