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


// 导入新的聚合API
import { 
    getSlpDataByDate, 
    getSlpDataByWeek, 
    getSlpDataByMonth, 
    getSlpDataByYear 
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

// --- 修改的代码 START: fetchAggregatedData 替代 fetchSleepData ---
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

    const selection = calendarSelectionStore;
    let response = null;

    try {
        if (selection.selectedDate) {
            const dateStr = formatDate(selection.selectedDate);
            response = await getSlpDataByDate(user_id, dateStr);
            console.log(`获取单日睡眠数据: ${dateStr}`, response);
        } else if (selection.selectedWeek) {
            const dateInWeekStr = formatDate(selection.selectedWeek.startDate);
            response = await getSlpDataByWeek(user_id, dateInWeekStr);
            console.log(`获取周睡眠数据: ${dateInWeekStr}`, response);
        } else if (selection.selectedMonth) {
            response = await getSlpDataByMonth(user_id, selection.selectedMonth.year, selection.selectedMonth.month);
            console.log(`获取月睡眠数据: ${selection.selectedMonth.year}-${selection.selectedMonth.month}`, response);
        } else if (selection.selectedYear) {
            response = await getSlpDataByYear(user_id, selection.selectedYear);
            console.log(`获取年睡眠数据: ${selection.selectedYear}`, response);
        } else {
            console.log("当前无选中日期/周期");
            data.value = [];
            date.value = [];
            updateChart();
            return;
        }

        // 检查组件是否已卸载
        if (!isMounted) {
            console.warn("SleepDataClear 组件在数据获取期间已卸载");
            return;
        }

        const apiResponse = response.data; // 假设 httpService.post 返回 {  {...} }
        const responseData = apiResponse.data; // 业务数据数组

        if (apiResponse && apiResponse.code === 200 && Array.isArray(responseData) && responseData.length > 0) {
            console.log(`响应${calendarSelectionStore.currentViewType}聚合睡眠数据`, responseData);

            let processedData = [];
            let processedDates = [];

            if (calendarSelectionStore.currentViewType === 'day') {
                // 处理单日原始数据: [{"sleepData": 420, "recordTime": "2025-12-20 22:30:00"}] (假设 sleepData 是分钟数)
                processedData = responseData.map(item => item.sleepData);
                processedDates = responseData.map(item => dateFormatter.Formatter(item.recordTime)); // 使用您的格式化工具
            } else {
                // 处理周/月/年聚合数据: [{"avgDuration": 480, "date": "2025-12-20"}, ...] (假设 avgDuration 是分钟数)
                processedData = responseData.map(item => item.avgDuration);
                processedDates = responseData.map(item => item.date || item.weekStart || item.month || item.yearMonth);
            }

            // --- 关键：更新响应式变量 ---
            data.value = processedData;
            date.value = processedDates;

            console.log('处理后的聚合睡眠数据:', data.value);
            console.log('处理后的聚合日期:', date.value);

            updateChart();
        } else {
            console.warn("API返回的睡眠聚合数据格式不正确、为空数组或无数据", apiResponse);
            data.value = [];
            date.value = [];
            updateChart();
        }
    } catch (error) {
        console.error("获取睡眠聚合数据失败", error);
        if (!isMounted) return; // 检查组件是否已卸载
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
    },
    { immediate: true } // 组件挂载时立即获取一次数据
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