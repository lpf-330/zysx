<template>
    <div class="nowData">
        <span class="title">血氧浓度</span>
        <div class="dataBox">
            <span class="data">{{ nowData }}&nbsp;</span>
            <span class="unit">%</span>
        </div>
    </div>
    <div ref="chart" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'; 
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
import  useUserInfoStore  from '../stores/user'; 
import { useCalendarSelectionStore } from '../stores/calendarSelection'; 
import { storeToRefs } from 'pinia';
import dateFormatter from '../utils/dateFormatter';


// 导入新的聚合API
import { 
    getOxygenDataByDate, 
    getOxygenDataByWeek, 
    getOxygenDataByMonth, 
    getOxygenDataByYear 
} from '../api/healthData'; // 假设您已将这些函数添加到 healthData.js

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

const userInfoStore = storeToRefs(useUserInfoStore()); // 使用 storeToRefs
const user_id = userInfoStore.user_id.value;
const calendarSelectionStore = useCalendarSelectionStore(); // 获取新的 Store 实例

const nowData = ref(0); // 用于显示最新血氧值
const data = ref([]);
const formattedTime = ref([]);
const chart = ref(null);
let myChart = null;
let isMounted = false; // 添加挂载状态标志

// 颜色定义
const color = ['rgba(0, 190, 250)', 'rgba(0,61,150)', 'rgba(0,0,225)'];
// const maxDataPoints = 30; // 移除轮询逻辑后，不再需要限制数据点数量


const formatDate = (dateObj) => {
    if (!(dateObj instanceof Date)) return '';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatMonth = (year, month) => {
    const monthStr = String(month).padStart(2, '0');
    return `${year}-${monthStr}`;
};

// --- 修改的代码 START: fetchAggregatedData 替代 fetchOxygenData ---
const fetchAggregatedData = async () => {
    if (!isMounted) {
        console.warn("OxygenDataClear 组件已卸载，停止数据获取");
        return;
    }

    console.log("=== OxygenDataClear 开始获取数据 ===");

    if (!user_id) {
        console.warn("用户ID无效，无法获取数据");
        data.value = [];
        formattedTime.value = [];
        nowData.value = 0; // 无数据时显示0
        updateChart();
        return;
    }

    const selection = calendarSelectionStore;
    let response = null;

    try {
        if (selection.selectedDate) {
            const dateStr = formatDate(selection.selectedDate);
            response = await getOxygenDataByDate(user_id, dateStr);
            console.log(`获取单日血氧数据: ${dateStr}`, response);
        } else if (selection.selectedWeek) {
            const dateInWeekStr = formatDate(selection.selectedWeek.startDate);
            response = await getOxygenDataByWeek(user_id, dateInWeekStr);
            console.log(`获取周血氧数据: ${dateInWeekStr}`, response);
        } else if (selection.selectedMonth) {
            response = await getOxygenDataByMonth(user_id, selection.selectedMonth.year, selection.selectedMonth.month);
            console.log(`获取月血氧数据: ${selection.selectedMonth.year}-${selection.selectedMonth.month}`, response);
        } else if (selection.selectedYear) {
            response = await getOxygenDataByYear(user_id, selection.selectedYear);
            console.log(`获取年血氧数据: ${selection.selectedYear}`, response);
        } else {
            console.log("当前无选中日期/周期");
            data.value = [];
            formattedTime.value = [];
            nowData.value = 0; // 无数据时显示0
            updateChart();
            return;
        }

        // 检查组件是否已卸载
        if (!isMounted) {
            console.warn("OxygenDataClear 组件在数据获取期间已卸载");
            return;
        }

        const apiResponse = response.data; // 假设 httpService.post 返回 {  {...} }
        const responseData = apiResponse.data; // 业务数据数组

        if (apiResponse && apiResponse.code === 200 && Array.isArray(responseData) && responseData.length > 0) {
            console.log(`响应${calendarSelectionStore.currentViewType}聚合血氧数据`, responseData);

            let processedData = [];
            let processedTimes = [];

            if (calendarSelectionStore.currentViewType === 'day') {
                // 处理单日原始数据: [{"oxygenData": 98, "recordTime": "2025-12-20 13:05:24"}]
                processedData = responseData.map(item => item.oxygenData);
                processedTimes = responseData.map(item => dateFormatter.Formatter(item.recordTime)); // 使用您的格式化工具
            } else {
                // 处理周/月/年聚合数据: [{"avgValue": 96.5, "date": "2025-12-20"}, ...]
                processedData = responseData.map(item => item.avgValue);
                processedTimes = responseData.map(item => item.date || item.weekStart || item.month || item.yearMonth);
            }

            // --- 更新响应式变量 ---
            data.value = processedData;
            formattedTime.value = processedTimes;

            // 更新 nowData 为最后一个数据点的值
            nowData.value = processedData[processedData.length - 1] || 0;

            console.log('处理后的聚合血氧数据:', data.value);
            console.log('处理后的聚合时间:', formattedTime.value);
            console.log('最新血氧值:', nowData.value);

            updateChart();
        } else {
            console.warn("API返回的血氧聚合数据格式不正确、为空数组或无数据", apiResponse);
            data.value = [];
            formattedTime.value = [];
            nowData.value = 0; // 无数据时显示0
            updateChart();
        }
    } catch (error) {
        console.error("获取血氧聚合数据失败", error);
        if (!isMounted) return; // 检查组件是否已卸载
        data.value = [];
        formattedTime.value = [];
        nowData.value = 0; // 错误时也显示0
        updateChart();
    }

    console.log("=== OxygenDataClear 数据获取完成 ===");
};
// --- 修改的代码 END ---

// --- 修改的代码 START: updateChart ---
const updateChart = () => {
    if (!isMounted) {
        console.warn("OxygenDataClear 组件已卸载，停止图表更新");
        return;
    }

    console.log("=== OxygenDataClear 开始更新图表 ===");
    console.log("data.value:", data.value);
    console.log("formattedTime.value:", formattedTime.value);

    if (!myChart || !chart.value) {
        console.warn("图表实例不存在或DOM未挂载");
        return;
    }

    // 更新数据点（局部更新）
    myChart.setOption({
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        xAxis: {
             data:dateFormatter.getTime(formattedTime.value)
        },
        series: [{
             data:data.value
        }]
    });
};
// --- 修改的代码 END ---

// --- 修改的代码 START: initChart ---
const initChart = () => {
    if (chart.value && isMounted) {
        if (myChart) {
            try {
                myChart.dispose();
            } catch (e) {
                console.warn("销毁图表实例时出错:", e);
            }
        }
        myChart = echarts.init(chart.value);

        // 启用数据动画效果
        const option = {
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicOut',
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
                data: [''],
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
                 data:dateFormatter.getTime(formattedTime.value), // 使用 formattedTime.value
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
                name: '浓度',
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
            series: [{
                name: '浓度',
                type: 'line',
                // 增强动画效果
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: {
                    color: color[0]
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            { offset: 0, color: 'rgba(0, 190, 250, 0.8)' },
                            { offset: 1, color: 'rgba(0, 190, 250, 0.1)' }
                        ]
                    ),
                },
                lineStyle: {
                    width: 2,
                    shadowBlur: 5,
                    shadowColor: 'rgba(0, 190, 250, 0.3)',
                    shadowOffsetY: 5
                },
                // 为数据点添加动画效果
                emphasis: {
                    focus: 'series',
                    itemStyle: {
                        borderWidth: 2,
                        borderColor: '#fff',
                        shadowBlur: 10,
                        shadowColor: color[0]
                    }
                },
                 data:data.value // 使用 data.value
            }]
        };

        myChart.setOption(option);
        console.log("=== OxygenDataClear 图表初始化完成 ===");
    }
};
// --- 修改的代码 END ---

// --- 添加 watch 监听 Store 状态 ---
watch(
    () => [
        calendarSelectionStore.selectedDate,
        calendarSelectionStore.selectedWeek,
        calendarSelectionStore.selectedMonth,
        calendarSelectionStore.selectedYear
    ],
    () => {
        console.log("OxygenDataClear: CalendarSelectionStore 状态变化，重新获取聚合数据");
        fetchAggregatedData();
    },
    { immediate: true } // 组件挂载时立即获取一次数据
);

onMounted(() => {
    isMounted = true;
    console.log("=== OxygenDataClear.vue 组件已挂载 ===");
    // fetchOxygenData(); // 移除旧的轮询获取
    initChart();
    window.addEventListener('resize', () => {
        if (myChart && isMounted) {
            try {
                myChart.resize();
            } catch (error) {
                console.error("调整图表大小时出错:", error);
            }
        }
    });
});

onUnmounted(() => {
    console.log("=== OxygenDataClear.vue 组件已卸载 ===");
    isMounted = false;

    // 移除事件监听器
    window.removeEventListener('resize', () => {
        if (myChart && isMounted) {
            myChart.resize();
        }
    });

    // 销毁图表实例
    if (myChart) {
        try {
            myChart.dispose();
        } catch (error) {
            console.warn("销毁图表实例时出错:", error);
        }
        myChart = null;
    }
});
</script>

<style scoped>
/* 保持原始样式不变 */
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