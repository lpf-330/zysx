<template>
    <div class="nowData">
        <span class="title">灌注指数</span>
        <div class="dataBox">
            <span class="data">{{ nowData }}</span>
            <span class="unit">mmol/L</span>
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
import { color } from 'echarts'; // 不再需要
import  useUserInfoStore  from '../stores/user'; // 导入函数
import { useCalendarSelectionStore } from '../stores/calendarSelection'; // 导入新的 Store
import { storeToRefs } from 'pinia';
import dateFormatter from '../utils/dateFormatter';

// 导入基础数据API（后端无聚合API，使用基础接口在前端聚合）
import { 
    getAllPiData
} from '../api/healthData';

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

const nowData = ref(0); // 用于显示最新PI值
const data = ref([]);
const formattedTime = ref([]);
const chart = ref(null);
let myChart = null;
let isMounted = false; // 添加挂载状态标志
const maxY = ref(100) // 默认最大值

const textColor = '#666'

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

// --- 修改的代码 START: fetchAggregatedData 使用基础数据接口 ---
const fetchAggregatedData = async () => {
    if (!isMounted) {
        console.warn("PiDataClear 组件已卸载，停止数据获取");
        return;
    }

    console.log("=== PiDataClear 开始获取数据 ===");

    if (!user_id) {
        console.warn("用户ID无效，无法获取数据");
        data.value = [];
        formattedTime.value = [];
        nowData.value = 0;
        updateChart();
        return;
    }

    try {
        const response = await getAllPiData(user_id);
        
        if (!isMounted) {
            console.warn("PiDataClear 组件在数据获取期间已卸载");
            return;
        }

        const apiResponse = response.data;
        let responseData;
        if (Array.isArray(apiResponse)) {
            responseData = apiResponse;
        } else if (apiResponse && apiResponse.code === 200 && Array.isArray(apiResponse.data)) {
            responseData = apiResponse.data;
        } else {
            responseData = null;
        }

        if (responseData && responseData.length > 0) {
            console.log('获取到灌注指数原始数据', responseData);
            
            const selection = calendarSelectionStore;
            let processedData = [];
            let processedTimes = [];

            // 获取日期部分（兼容 ISO 格式 '2024-01-15T21:00:00' 和普通格式 '2024-01-15 21:00:00'）
            const getDatePart = (recordTime) => {
                if (!recordTime) return '';
                return recordTime.split('T')[0].split(' ')[0];
            };

            if (selection.selectedDate) {
                const targetDate = formatDate(selection.selectedDate);
                const dayData = responseData.filter(item => {
                    const recordDate = getDatePart(item.recordTime);
                    return recordDate === targetDate;
                });
                processedData = dayData.map(item => item.piData || 0);
                processedTimes = dayData.map(item => dateFormatter.Formatter(item.recordTime));
            } else if (selection.selectedWeek) {
                const weekStart = new Date(selection.selectedWeek.startDate);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                const weekData = responseData.filter(item => {
                    if (!item.recordTime) return false;
                    const recordDate = new Date(getDatePart(item.recordTime));
                    return recordDate >= weekStart && recordDate <= weekEnd;
                });
                
                const dailyMap = new Map();
                weekData.forEach(item => {
                    const dateKey = getDatePart(item.recordTime);
                    if (!dailyMap.has(dateKey)) {
                        dailyMap.set(dateKey, []);
                    }
                    dailyMap.get(dateKey).push(item.piData || 0);
                });
                
                dailyMap.forEach((values, dateKey) => {
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    processedData.push(Math.round(avg * 100) / 100);
                    processedTimes.push(dateKey);
                });
                processedTimes.sort();
                processedData = processedTimes.map(d => {
                    const vals = dailyMap.get(d);
                    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 100) / 100;
                });
            } else if (selection.selectedMonth) {
                const targetYear = selection.selectedMonth.year;
                const targetMonth = selection.selectedMonth.month;
                
                const monthData = responseData.filter(item => {
                    if (!item.recordTime) return false;
                    const parts = getDatePart(item.recordTime).split('-');
                    return parseInt(parts[0]) === targetYear && parseInt(parts[1]) === targetMonth;
                });
                
                const dailyMap = new Map();
                monthData.forEach(item => {
                    const dateKey = getDatePart(item.recordTime);
                    if (!dailyMap.has(dateKey)) {
                        dailyMap.set(dateKey, []);
                    }
                    dailyMap.get(dateKey).push(item.piData || 0);
                });
                
                dailyMap.forEach((values, dateKey) => {
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    processedData.push(Math.round(avg * 100) / 100);
                    processedTimes.push(dateKey);
                });
                processedTimes.sort();
                processedData = processedTimes.map(d => {
                    const vals = dailyMap.get(d);
                    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 100) / 100;
                });
            } else if (selection.selectedYear) {
                const targetYear = selection.selectedYear;
                
                const yearData = responseData.filter(item => {
                    if (!item.recordTime) return false;
                    const year = parseInt(getDatePart(item.recordTime).split('-')[0]);
                    return year === targetYear;
                });
                
                const monthlyMap = new Map();
                yearData.forEach(item => {
                    const parts = getDatePart(item.recordTime).split('-');
                    const monthKey = `${parts[0]}-${parts[1]}`;
                    if (!monthlyMap.has(monthKey)) {
                        monthlyMap.set(monthKey, []);
                    }
                    monthlyMap.get(monthKey).push(item.piData || 0);
                });
                
                monthlyMap.forEach((values, monthKey) => {
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    processedData.push(Math.round(avg * 100) / 100);
                    processedTimes.push(monthKey);
                });
                processedTimes.sort();
                processedData = processedTimes.map(m => {
                    const vals = monthlyMap.get(m);
                    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 100) / 100;
                });
            } else {
                console.log("当前无选中日期/周期，显示最近数据");
                const sortedData = [...responseData].sort((a, b) => 
                    new Date(b.recordTime) - new Date(a.recordTime)
                );
                const recentData = sortedData.slice(0, 50);
                processedData = recentData.map(item => item.piData || 0);
                processedTimes = recentData.map(item => dateFormatter.Formatter(item.recordTime));
            }

            data.value = processedData;
            formattedTime.value = processedTimes;
            nowData.value = processedData[processedData.length - 1] || 0;

            if (processedData.length > 0) {
                maxY.value = Math.floor((Math.max(...processedData) + 10) / 10) * 10;
            } else {
                maxY.value = 100;
            }

            console.log('处理后的灌注指数数据:', data.value);
            console.log('处理后的时间:', formattedTime.value);
            console.log('最新灌注指数值:', nowData.value);

            updateChart();
        } else {
            console.warn("API返回的灌注指数数据格式不正确、为空数组或无数据", apiResponse);
            data.value = [];
            formattedTime.value = [];
            nowData.value = 0;
            updateChart();
        }
    } catch (error) {
        console.error("获取灌注指数数据失败", error);
        if (!isMounted) return;
        data.value = [];
        formattedTime.value = [];
        nowData.value = 0;
        updateChart();
    }

    console.log("=== PiDataClear 数据获取完成 ===");
};
// --- 修改的代码 END ---

// --- 修改的代码 START: updateChart ---
const updateChart = () => {
    if (!isMounted) {
        console.warn("PiDataClear 组件已卸载，停止图表更新");
        return;
    }

    console.log("=== PiDataClear 开始更新图表 ===");
    console.log("data.value:", data.value);
    console.log("formattedTime.value:", formattedTime.value);

    if (!myChart || !chart.value) {
        console.warn("图表实例不存在或DOM未挂载");
        return;
    }

    const option = {
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
        grid: {
            top: '2%',
            bottom: '10%',
            left: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
             data:dateFormatter.getTime(formattedTime.value), // 使用 formattedTime.value
            offset: 20,
            axisLabel: {
                // 坐标轴字体颜色
                color: textColor,
                fontSize: 18
            },
            axisLine: {
                lineStyle: {
                    color: textColor
                }
            },
            axisTick: {
                // y轴刻度线
                show: true
            },
            splitLine: {
                // 网格
                show: false
            },
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: maxY.value, // 使用 maxY.value
            name: '灌注指数',
            offset: 20,
            nameTextStyle: {
                color: '#333',
                fontSize: 25,
                padding: [0, 0, 0, 80]
            },
            axisLabel: {
                // 坐标轴字体颜色
                color: textColor,
                fontSize: 18
            },
            axisLine: {
                show: false
            },
            axisTick: {
                // y轴刻度线
                show: false
            },
            splitLine: {
                // 网格
                show: true,
                lineStyle: {
                    color: '#CCCCCC',
                    type: 'dashed'
                }
            }
        },
        series: [
            {
                name: '灌注指数',
                type: 'line',
                symbol: 'circle',
                symbolSize: 10,
                z: 1,
                itemStyle: {
                    color: '#5487FF'
                },
                lineStyle: {
                    color: '#5487FF'
                },
                 data:data.value // 使用 data.value
            }
        ]
    };

    myChart.setOption(option);
};
// --- 修改的代码 END ---

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
        updateChart();
        console.log("=== PiDataClear 图表初始化完成 ===");
    }
};

// --- 添加 watch 监听 Store 状态 ---
watch(
    () => [
        calendarSelectionStore.selectedDate,
        calendarSelectionStore.selectedWeek,
        calendarSelectionStore.selectedMonth,
        calendarSelectionStore.selectedYear
    ],
    () => {
        console.log("PiDataClear: CalendarSelectionStore 状态变化，重新获取聚合数据");
        fetchAggregatedData();
    }
);

onMounted(() => {
    isMounted = true;
    console.log("=== PiDataClear.vue 组件已挂载 ===");
    // initChart(); // 在 watch 的 immediate: true 时会触发 fetchAggregatedData，进而调用 updateChart，此时图表实例还未初始化
    initChart(); // 先初始化图表实例
    fetchAggregatedData(); // 然后获取初始数据
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
    console.log("=== PiDataClear.vue 组件已卸载 ===");
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