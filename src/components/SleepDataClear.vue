<!-- SleepDataClear.vue -->
<template>
    <div class="nowData">
        <span class="title">平均时长</span>
        <div class="dataBox">
            <!-- 关键修改：处理最新数据 -->
            <span class="data">{{ Math.floor(data[data.length - 1] / 60) }}&nbsp;</span>
            <span class="unit">h&nbsp;</span>
            <span class="data">{{ data[data.length - 1] % 60 }}&nbsp;</span>
            <span class="unit">min&nbsp;</span>
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
import useUserInfoStore from '../stores/user';
import { useCalendarSelectionStore } from '../stores/calendarSelection';
import { storeToRefs } from 'pinia';


// 导入基础数据API（后端无聚合API，使用基础接口在前端聚合）
import { 
    getAllSleepData
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

const userInfoStore = storeToRefs(useUserInfoStore());
const user_id = userInfoStore.user_id.value;
const calendarSelectionStore = useCalendarSelectionStore(); // 获取新的 Store 实例

// 数据
const data = ref([]);
const date = ref([]);
const chart = ref(null);
let myChart = null;
let isMounted = false; // 添加挂载状态标志

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
        console.warn("SleepDataClear 组件已卸载，停止数据获取");
        return;
    }

    console.log("=== SleepDataClear 开始获取数据 ===");

    if (!user_id) {
        console.warn("用户ID无效，无法获取数据");
        data.value = [];
        date.value = [];
        updateChart();
        return;
    }

    try {
        const response = await getAllSleepData(user_id);
        
        if (!isMounted) {
            console.warn("SleepDataClear 组件在数据获取期间已卸载");
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
            console.log('获取到睡眠原始数据', responseData);
            
            const selection = calendarSelectionStore;
            let processedData = [];
            let processedDates = [];

            // 获取日期部分（兼容 ISO 格式 '2024-01-15T21:00:00' 和普通格式 '2024-01-15 21:00:00'）
            const getDatePart = (recordTime) => {
                if (!recordTime) return '';
                return recordTime.split('T')[0].split(' ')[0];
            };

            // 获取时间部分（兼容两种格式）
            const getTimePart = (recordTime) => {
                if (!recordTime) return '';
                const parts = recordTime.split('T')[0].split(' ');
                if (parts.length > 1) {
                    return parts[1].substring(0, 5);
                }
                // ISO 格式：'2024-01-15T21:00:00'
                const tParts = recordTime.split('T');
                if (tParts.length > 1) {
                    return tParts[1].substring(0, 5);
                }
                return '';
            };

            if (selection.selectedDate) {
                const targetDate = formatDate(selection.selectedDate);
                const dayData = responseData.filter(item => {
                    const recordDate = getDatePart(item.recordTime);
                    return recordDate === targetDate;
                });
                processedData = dayData.map(item => item.sleepData || 0);
                processedDates = dayData.map(item => getTimePart(item.recordTime));
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
                    dailyMap.get(dateKey).push(item.sleepData || 0);
                });
                
                dailyMap.forEach((values, dateKey) => {
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    processedData.push(Math.round(avg));
                    processedDates.push(dateKey);
                });
                processedDates.sort();
                processedData = processedDates.map(d => {
                    const vals = dailyMap.get(d);
                    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
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
                    dailyMap.get(dateKey).push(item.sleepData || 0);
                });
                
                dailyMap.forEach((values, dateKey) => {
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    processedData.push(Math.round(avg));
                    processedDates.push(dateKey);
                });
                processedDates.sort();
                processedData = processedDates.map(d => {
                    const vals = dailyMap.get(d);
                    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
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
                    monthlyMap.get(monthKey).push(item.sleepData || 0);
                });
                
                monthlyMap.forEach((values, monthKey) => {
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    processedData.push(Math.round(avg));
                    processedDates.push(monthKey);
                });
                processedDates.sort();
                processedData = processedDates.map(m => {
                    const vals = monthlyMap.get(m);
                    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
                });
            } else {
                console.log("当前无选中日期/周期，显示最近7天数据");
                const sortedData = [...responseData].sort((a, b) => 
                    new Date(b.recordTime) - new Date(a.recordTime)
                );
                const recentData = sortedData.slice(0, 50);
                processedData = recentData.map(item => item.sleepData || 0);
                processedDates = recentData.map(item => {
                    if (item.recordTime) {
                        return item.recordTime.split(' ')[0];
                    }
                    return '';
                });
            }

            data.value = processedData;
            date.value = processedDates;

            console.log('处理后的睡眠数据:', data.value);
            console.log('处理后的日期:', date.value);

            updateChart();
        } else {
            console.warn("API返回的睡眠数据格式不正确、为空数组或无数据", apiResponse);
            data.value = [];
            date.value = [];
            updateChart();
        }
    } catch (error) {
        console.error("获取睡眠数据失败", error);
        if (!isMounted) return;
        data.value = [];
        date.value = [];
        updateChart();
    }

    console.log("=== SleepDataClear 数据获取完成 ===");
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
        // 不再在这里调用 updateChart，因为数据获取由 watch 触发
    }
};

// --- 修改的代码 START: updateChart ---
const updateChart = () => {
    if (!isMounted) {
        console.warn("SleepDataClear 组件已卸载，停止图表更新");
        return;
    }

    console.log("=== SleepDataClear 开始更新图表 ===");
    console.log("data.value:", data.value);
    console.log("date.value:", date.value);

    if (!myChart || !chart.value) {
        console.warn("图表实例不存在或DOM未挂载");
        return;
    }

    const option = {
        tooltip: {
            trigger: 'axis',
            textStyle: {
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
            show: false,
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
            top: '2%',
            bottom: '10%',
            left: '10%',
            containLabel: true
        },
        xAxis: {
            data: date.value, // 使用 date.value
            type: 'category',
            boundaryGap: true,
            offset: 20,
            axisLabel: {
                textStyle: {
                    fontSize: 16
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
            offset: 20,
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
                    fontSize: 16
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
                },
                // 添加一个空数据系列以保持图表结构（可选，取决于设计）
                data: [] // 可以留空或提供占位数据
            },
            {
                name: '平均时长', // 添加系列名称
                smooth: true,
                type: 'line',
                showSymbol: false,
                symbolSize: 4,
                itemStyle: {
                    color: 'rgba(26, 119, 221, 1)'
                },
                 data:data.value, // 使用 data.value
                areaStyle: {
                    color: 'rgba(0,0,0,0)' // 将阴影颜色设置为透明
                }
            }
        ]
    };

    myChart.setOption(option);
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
        console.log("SleepDataClear: CalendarSelectionStore 状态变化，重新获取聚合数据");
        fetchAggregatedData();
    }
);

onMounted(() => {
    isMounted = true;
    console.log("=== SleepDataClear.vue 组件已挂载 ===");
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
    console.log("=== SleepDataClear.vue 组件已卸载 ===");
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
    width: 40%;
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