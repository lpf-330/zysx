<template>
    <div class="nowData">
        <div class="dataBox">
            <span class="classTitle" style="color: rgb(255, 105, 35);">高压</span>
            <div class="class">
                <span class="data">{{ avgData22.toFixed(1) }}</span>
                <span class="unit">mmHg</span>
            </div>
        </div>
        <span class="title">血压</span>
        <div class="dataBox">
            <span class="classTitle" style="color: rgba(35, 157, 250, 1);">低压</span>
            <div class="class">
                <span class="data">{{ avgData11.toFixed(1) }}</span>
                <span class="unit">mmHg</span>
            </div>
        </div>
    </div>
    <div ref="chart" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts'; // 使用 BarChart，与原图一致
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
import { useCalendarSelectionStore } from '../stores/calendarSelection'; // 引入新的 Store
import { storeToRefs } from 'pinia';

// 导入新的聚合API
import { 
    getPressureDataByDate, 
    getPressureDataByWeek, 
    getPressureDataByMonth, 
    getPressureDataByYear 
} from '../api/healthData'; // 假设您已将这些函数添加到 healthData.js

echarts.use([
    BarChart, // 使用 BarChart
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

// 高压数据 (负值)
const data1 = ref([]);
// 低压数据 (正值)
const data2 = ref([]);
// 日期/周期标签
const date = ref([]);

// 平均低压 (用于显示)
const avgData11 = ref(0);
// 平均高压 (用于显示)
const avgData22 = ref(0);

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

// --- 修改的代码 START: fetchAggregatedData 替代 fetchPressureData ---
const fetchAggregatedData = async () => {
    if (!isMounted) {
        console.warn("PressureDataClear 组件已卸载，停止数据获取");
        return;
    }

    console.log("=== PressureDataClear 开始获取数据 ===");

    if (!user_id) {
        console.warn("用户ID无效，无法获取数据");
        data1.value = [];
        data2.value = [];
        date.value = [];
        avgData11.value = 0;
        avgData22.value = 0;
        updateChart();
        return;
    }

    const selection = calendarSelectionStore;
    let response = null;

    try {
        if (selection.selectedDate) {
            const dateStr = formatDate(selection.selectedDate);
            response = await getPressureDataByDate(user_id, dateStr);
            console.log(`获取单日血压数据: ${dateStr}`, response);
        } else if (selection.selectedWeek) {
            const dateInWeekStr = formatDate(selection.selectedWeek.startDate);
            response = await getPressureDataByWeek(user_id, dateInWeekStr);
            console.log(`获取周血压数据: ${dateInWeekStr}`, response);
        } else if (selection.selectedMonth) {
            response = await getPressureDataByMonth(user_id, selection.selectedMonth.year, selection.selectedMonth.month);
            console.log(`获取月血压数据: ${selection.selectedMonth.year}-${selection.selectedMonth.month}`, response);
        } else if (selection.selectedYear) {
            response = await getPressureDataByYear(user_id, selection.selectedYear);
            console.log(`获取年血压数据: ${selection.selectedYear}`, response);
        } else {
            console.log("当前无选中日期/周期");
            data1.value = [];
            data2.value = [];
            date.value = [];
            avgData11.value = 0;
            avgData22.value = 0;
            updateChart();
            return;
        }

        // 检查组件是否已卸载
        if (!isMounted) {
            console.warn("PressureDataClear 组件在数据获取期间已卸载");
            return;
        }

        const apiResponse = response.data; // 假设 httpService.post 返回 {  {...} }
        const responseData = apiResponse.data; // 业务数据数组

        if (apiResponse && apiResponse.code === 200 && Array.isArray(responseData) && responseData.length > 0) {
            console.log(`响应${calendarSelectionStore.currentViewType}聚合血压数据`, responseData);

            let processedData1 = []; // 用于高压 (收缩压)
            let processedData2 = []; // 用于低压 (舒张压)
            let processedDates = [];

            if (calendarSelectionStore.currentViewType === 'day') {
                // 处理单日原始数据: [{"systolicBp": 120, "diastolicBp": 80, "recordTime": "2025-12-20 13:05:24"}]
                processedData1 = responseData.map(item => -item.systolicBp); // 高压取负值
                processedData2 = responseData.map(item => item.diastolicBp); // 低压取正值
                processedDates = responseData.map(item => dateFormatter.Formatter(item.recordTime)); // 使用您的格式化工具
            } else {
                // 处理周/月/年聚合数据: [{"avgSystolic": 125, "avgDiastolic": 82, "date": "2025-12-20"}, ...]
                processedData1 = responseData.map(item => -item.avgSystolic); // 高压取负值
                processedData2 = responseData.map(item => item.avgDiastolic); // 低压取正值
                processedDates = responseData.map(item => item.date || item.weekStart || item.month || item.yearMonth);
            }

            // --- 关键：更新响应式变量 ---
            data1.value = processedData1;
            data2.value = processedData2;
            date.value = processedDates;

            // 计算平均值
            const systolicValues = processedData1.map(val => -val); // 取正计算平均
            const diastolicValues = processedData2;
            avgData22.value = systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length;
            avgData11.value = diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length;

            console.log('处理后的聚合血压数据 (高压):', data1.value);
            console.log('处理后的聚合血压数据 (低压):', data2.value);
            console.log('处理后的聚合日期:', date.value);
            console.log('平均高压 (avgData22):', avgData22.value);
            console.log('平均低压 (avgData11):', avgData11.value);

            updateChart();
        } else {
            console.warn("API返回的血压聚合数据格式不正确、为空数组或无数据", apiResponse);
            data1.value = [];
            data2.value = [];
            date.value = [];
            avgData11.value = 0;
            avgData22.value = 0;
            updateChart();
        }
    } catch (error) {
        console.error("获取血压聚合数据失败", error);
        if (!isMounted) return; // 检查组件是否已卸载
        data1.value = [];
        data2.value = [];
        date.value = [];
        avgData11.value = 0;
        avgData22.value = 0;
        updateChart();
    }

    console.log("=== PressureDataClear 数据获取完成 ===");
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
        console.warn("PressureDataClear 组件已卸载，停止图表更新");
        return;
    }

    console.log("=== PressureDataClear 开始更新图表 ===");
    console.log("data1.value:", data1.value);
    console.log("data2.value:", data2.value);
    console.log("date.value:", date.value);

    if (!myChart || !chart.value) {
        console.warn("图表实例不存在或DOM未挂载");
        return;
    }

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
                textStyle: {
                    color: '#fff',
                },
            },
            formatter: (params) => {
                return `<span>${params[0].axisValue}</span>` + params
                    .map(param => {
                        const value = Array.isArray(param.value) ? param.value : param.value;
                        return `
              <div style="color: ${param.color};">         
                ${param.marker} 
                ${param.seriesName}: 
                <strong>${Math.abs(value).toFixed(1)}</strong> <!-- 取绝对值 -->
              </div>
            `;
                    })
                    .join('');
            }
        },
        grid: {
            top: '2%',
            bottom: '10%',
            left: '10%',
            containLabel: true,
            textStyle: {
                color: '#fff',
            },
        },
        calculable: true,
        xAxis: [
            {
                type: 'category',
                splitLine: { show: false },
                axisTick: { show: false },
                splitArea: { show: false },
                axisLabel: { interval: 0, fontSize: 15 },
                 data:date.value, // 使用 date.value
            },
        ],
        yAxis: [
            {
                type: 'value',
                offset: 15,
                splitLine: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    interval: 0,
                    fontSize: 18,
                    formatter: (m) => {
                        return Math.abs(m); // Y轴标签显示绝对值
                    },
                },
                splitArea: { show: false },
            },
        ],
        series: [
            {
                name: '低压',
                type: 'bar',
                barWidth: 20,
                gridIndex: 0,
                yAxisIndex: 0,
                label: {
                    show: true,
                    position: 'top',
                    formatter: (m) => {
                        return Math.abs(m.value).toFixed(1); // 标签显示绝对值
                    },
                },
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(35, 157, 250, 1)' },
                        { offset: 1, color: 'rgba(35, 157, 250, 0.32)' },
                    ]),
                },
                data: data2.value, // 使用 data2.value
            },
            {
                name: '高压',
                type: 'bar',
                barWidth: 20,
                barGap: '-100%',
                gridIndex: 0,
                yAxisIndex: 0,
                label: {
                    show: true,
                    position: 'bottom',
                    formatter: (m) => {
                        return Math.abs(m.value).toFixed(1); // 标签显示绝对值
                    },
                },
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgb(255, 105, 35)' },
                        { offset: 1, color: 'rgb(255, 105, 35, 0.32)' },
                    ]),
                    barBorderRadius: 0,
                },
                 data:data1.value, // 使用 data1.value
            },
        ],
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
        console.log("PressureDataClear: CalendarSelectionStore 状态变化，重新获取聚合数据");
        fetchAggregatedData();
    },
    { immediate: true } // 组件挂载时立即获取一次数据
);

onMounted(() => {
    isMounted = true;
    console.log("=== PressureDataClear.vue 组件已挂载 ===");
    initChart();
    // fetchPressureData(); // 移除旧的轮询获取，由 watch 触发
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
    console.log("=== PressureDataClear.vue 组件已卸载 ===");
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
    width: 30%;
    height: 65%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-left: 3%;
    margin-right: 3%;
}

.unit {
    font-size: 0.08rem;
    font-family: 'PuHuiTi';
    color: #8E9AAB;
}

.class {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.classTitle {
    font-size: 0.1rem;
    font-family: 'PuHuiTi';
}
</style>