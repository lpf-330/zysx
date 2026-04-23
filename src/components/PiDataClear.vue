<template>
  <div class="chart-container">
    <div class="nowData">
      <span class="title">灌注指数</span>
      <div class="dataBox">
        <span class="data">{{ latestData }}</span>
        <span class="unit">mmol/L</span>
      </div>
    </div>
    <div ref="chart" style="width: 100%; flex: 1; min-height: 0;">
      <div v-if="loading" class="loading-overlay">加载中...</div>
      <div v-else-if="error" class="error-overlay">数据加载失败</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    DataZoomComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import useUserInfoStore from '../stores/user';
import { useCalendarSelectionStore } from '../stores/calendarSelection';
import { storeToRefs } from 'pinia';
import {
    getPiDataByDate,
    getPiDataByWeek,
    getPiDataByMonth,
    getPiDataByYear
} from '../api/healthData';

echarts.use([
    LineChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    DataZoomComponent,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
]);

const userInfoStore = storeToRefs(useUserInfoStore());
const user_id = userInfoStore.user_id.value;
const calendarSelectionStore = useCalendarSelectionStore();

const latestData = ref(0);
const data = ref([]);
const formattedTime = ref([]);
const loading = ref(false);
const error = ref(false);
const chart = ref(null);
let myChart = null;
let isMountedFlag = false;
let fetchTimeout = null;
let isFetching = false;
const maxY = ref(100);

const color = '#5487FF';

const formatRecordTime = (timeStr, viewType = 'day') => {
    if (!timeStr) return 'N/A';
    if (typeof timeStr === 'string' && timeStr.includes('第') && timeStr.includes('周')) {
        return timeStr;
    }
    if (typeof timeStr === 'string' && timeStr.includes('月') && !timeStr.includes('-')) {
        return timeStr;
    }
    try {
        const date = new Date(timeStr);
        if (isNaN(date.getTime())) {
            return timeStr;
        }
        switch (viewType) {
            case 'day':
                return date.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
            case 'week':
            case 'month':
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            case 'year':
                const year = date.getFullYear();
                const yearMonth = date.getMonth() + 1;
                return `${year}-${yearMonth.toString().padStart(2, '0')}`;
            default:
                return date.toLocaleDateString('zh-CN');
        }
    } catch (e) {
        console.error('时间格式化错误:', e);
        return timeStr;
    }
};

const formatDate = (dateObj) => {
    if (!(dateObj instanceof Date)) return '';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const fetchLatestData = async () => {
    if (!user_id || !isMountedFlag) {
        console.log("PiDataClear: 用户ID无效或组件已卸载，无法获取最新数据");
        return;
    }
    
    try {
        const today = new Date();
        const todayStr = formatDate(today);
        
        const response = await getPiDataByDate(user_id, todayStr);
        
        if (!isMountedFlag) return;
        
        const apiResponse = response.data;
        const responseData = apiResponse.data;
        
        if (apiResponse && apiResponse.code === 200 && Array.isArray(responseData) && responseData.length > 0) {
            const sortedData = [...responseData].sort((a, b) => 
                new Date(b.recordTime) - new Date(a.recordTime)
            );
            latestData.value = sortedData[0].piData || sortedData[0].avgPi || sortedData[0].avgValue || 0;
        } else {
            latestData.value = 0;
        }
    } catch (err) {
        console.error("PiDataClear: 获取最新数据失败", err);
        if (isMountedFlag) {
            latestData.value = 0;
        }
    }
};

const fetchAggregatedData = async () => {
    if (!isMountedFlag) {
        console.log("PiDataClear: 组件已卸载，停止数据获取");
        return;
    }
    
    isFetching = true;
    console.log("=== PiDataClear 开始获取数据 ===");
    
    if (!user_id) {
        console.log("PiDataClear: 用户ID无效，无法获取数据");
        if (isMountedFlag) {
            data.value = [];
            formattedTime.value = [];
            updateChart();
        }
        isFetching = false;
        return;
    }
    
    if (isMountedFlag) {
        loading.value = true;
        error.value = false;
    }
    
    try {
        const selection = calendarSelectionStore;
        const viewType = selection.currentViewType;
        
        console.log("PiDataClear: 当前视图类型 =", viewType);
        console.log("PiDataClear: selectedDate =", selection.selectedDate);
        console.log("PiDataClear: selectedWeek =", selection.selectedWeek);
        console.log("PiDataClear: selectedMonth =", selection.selectedMonth);
        console.log("PiDataClear: selectedYear =", selection.selectedYear);
        
        let response;
        let responseData;
        
        if (viewType === 'day' && selection.selectedDate) {
            const dateStr = formatDate(selection.selectedDate);
            console.log("PiDataClear: 调用 getPiDataByDate, user_id =", user_id, ", dateStr =", dateStr);
            response = await getPiDataByDate(user_id, dateStr);
            console.log("PiDataClear: getPiDataByDate 返回 =", response);
            responseData = response.data.data;
        } else if (selection.selectedWeek) {
            const dateInWeekStr = formatDate(selection.selectedWeek.startDate);
            console.log("PiDataClear: 调用 getPiDataByWeek, user_id =", user_id, ", dateInWeekStr =", dateInWeekStr);
            response = await getPiDataByWeek(user_id, dateInWeekStr);
            console.log("PiDataClear: getPiDataByWeek 返回 =", response);
            responseData = response.data.data;
        } else if (selection.selectedMonth) {
            console.log("PiDataClear: 调用 getPiDataByMonth, user_id =", user_id, ", year =", selection.selectedMonth.year, ", month =", selection.selectedMonth.month);
            response = await getPiDataByMonth(user_id, selection.selectedMonth.year, selection.selectedMonth.month);
            console.log("PiDataClear: getPiDataByMonth 返回 =", response);
            responseData = response.data.data;
        } else if (selection.selectedYear) {
            console.log("PiDataClear: 调用 getPiDataByYear, user_id =", user_id, ", year =", selection.selectedYear);
            response = await getPiDataByYear(user_id, selection.selectedYear);
            console.log("PiDataClear: getPiDataByYear 返回 =", response);
            responseData = response.data.data;
        } else {
            const dateStr = formatDate(new Date());
            console.log("PiDataClear: 默认调用 getPiDataByDate, user_id =", user_id, ", dateStr =", dateStr);
            response = await getPiDataByDate(user_id, dateStr);
            console.log("PiDataClear: getPiDataByDate 返回 =", response);
            responseData = response.data.data;
        }
        
        console.log("PiDataClear: responseData =", responseData);
        console.log("PiDataClear: responseData 类型 =", typeof responseData, ", 是否数组 =", Array.isArray(responseData), ", 长度 =", responseData?.length);
        
        if (!isMountedFlag) {
            console.log("PiDataClear: 组件在数据获取期间已卸载");
            return;
        }
        
        if (responseData && Array.isArray(responseData) && responseData.length > 0) {
            const isRawFormat = responseData[0] && responseData[0].piData !== undefined;
            
            let processedData, rawTimes;
            
            if (isRawFormat) {
                const sortedData = [...responseData].sort((a, b) => 
                    new Date(a.recordTime) - new Date(b.recordTime)
                );
                processedData = sortedData.map(item => item.piData);
                rawTimes = sortedData.map(item => item.recordTime);
            } else {
                const sortedData = [...responseData].sort((a, b) => {
                    let dateA, dateB;
                    if (a.date) {
                        dateA = new Date(a.date);
                    } else if (a.weekStart) {
                        dateA = new Date(a.weekStart);
                    } else if (a.week !== undefined) {
                        dateA = a.week;
                    } else if (a.month !== undefined) {
                        dateA = a.month;
                    } else if (a.yearMonth) {
                        dateA = new Date(a.yearMonth);
                    }
                    if (b.date) {
                        dateB = new Date(b.date);
                    } else if (b.weekStart) {
                        dateB = new Date(b.weekStart);
                    } else if (b.week !== undefined) {
                        dateB = b.week;
                    } else if (b.month !== undefined) {
                        dateB = b.month;
                    } else if (b.yearMonth) {
                        dateB = new Date(b.yearMonth);
                    }
                    return (dateA || 0) - (dateB || 0);
                });
                processedData = sortedData.map(item => item.avgPi || item.avgValue);
                rawTimes = sortedData.map(item => {
                    if (item.date) return item.date;
                    if (item.weekStart) return item.weekStart;
                    if (item.week !== undefined) return `第${item.week}周`;
                    if (item.month !== undefined) return `${item.month}月`;
                    if (item.yearMonth) return item.yearMonth;
                    return '';
                });
            }
            
            const processedTimes = rawTimes.map(time => formatRecordTime(time, viewType));
            
            if (!isMountedFlag) {
                return;
            }
            
            data.value = processedData;
            formattedTime.value = processedTimes;
            
            if (processedData.length > 0) {
                const maxVal = Math.max(...processedData.filter(d => typeof d === 'number' && !isNaN(d)));
                maxY.value = Math.max(10, Math.ceil(maxVal * 1.2));
                latestData.value = processedData[processedData.length - 1];
            } else {
                maxY.value = 10;
                latestData.value = 0;
            }
            
            updateChart();
            console.log("=== PiDataClear 数据获取完成 ===");
        } else {
            console.log("PiDataClear: API返回数据为空");
            if (isMountedFlag) {
                data.value = [];
                formattedTime.value = [];
                latestData.value = 0;
                updateChart();
            }
        }
    } catch (err) {
        console.error("PiDataClear: 获取数据失败", err);
        if (isMountedFlag) {
            error.value = true;
        }
    } finally {
        isFetching = false;
        if (isMountedFlag) {
            loading.value = false;
        }
    }
};

const updateChart = () => {
    if (!myChart || !isMountedFlag) {
        console.log("PiDataClear: 图表实例不存在或组件已卸载，跳过更新");
        return;
    }
    
    try {
        if (data.value.length === 0 || formattedTime.value.length === 0) {
            myChart.setOption({
                title: {
                    text: '暂无数据',
                    left: 'center',
                    top: 'center',
                    textStyle: { color: '#999', fontSize: 14 }
                },
                xAxis: { show: false, data: [] },
                yAxis: { show: false },
                series: [{ data: [] }]
            });
            return;
        }
        
        const displayData = data.value.slice(0, Math.min(data.value.length, formattedTime.value.length));
        const displayTimes = formattedTime.value.slice(0, Math.min(data.value.length, formattedTime.value.length));
        
        const totalPoints = displayData.length;
        let zoomStart = 0;
        let zoomEnd = 100;
        if (totalPoints > 15) {
            zoomStart = ((totalPoints - 15) / totalPoints) * 100;
        }
        
        myChart.setOption({
            title: { show: false },
            xAxis: {
                show: true,
                data: displayTimes,
                axisLabel: { rotate: displayTimes.length > 10 ? 30 : 0 }
            },
            yAxis: { show: true, max: maxY.value },
            dataZoom: [{ type: 'inside', start: zoomStart, end: zoomEnd, zoomLock: false }],
            series: [{ data: displayData }]
        });
        
        setTimeout(() => {
            if (myChart && isMountedFlag) {
                try {
                    myChart.resize();
                } catch (e) {
                    console.error("PiDataClear: 图表重绘失败", e);
                }
            }
        }, 50);
        
        console.log("=== PiDataClear 图表更新完成 ===");
    } catch (e) {
        console.error('PiDataClear: 更新图表失败', e);
    }
};

const initChart = () => {
    console.log("=== PiDataClear 开始初始化图表 ===");
    if (!isMountedFlag || !chart.value) {
        console.log("PiDataClear: 组件未挂载或DOM不存在，无法初始化图表");
        return;
    }
    
    try {
        myChart = echarts.init(chart.value);
        console.log("PiDataClear: 图表实例创建成功");
        
        const option = {
            color: [color],
            title: { show: false },
            animation: true,
            animationDuration: 800,
            animationEasing: 'cubicOut',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#ccc',
                borderWidth: 1,
                textStyle: { color: '#333', fontSize: 14 },
                formatter: (params) => {
                    const index = params[0].dataIndex;
                    const timeStr = formattedTime.value[index] || '';
                    const value = params[0].value;
                    return `
                        <div style="margin-bottom:5px; font-weight:bold;">${timeStr}</div>
                        <div>${params[0].marker} 灌注指数: <span style="font-weight:bold; color:${color}">${value}</span></div>
                    `;
                }
            },
            grid: {
                top: '8%',
                bottom: '8%',
                left: '8%',
                right: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                axisLine: { lineStyle: { color: '#333' } },
                axisLabel: {
                    color: '#666',
                    fontSize: 16,
                    rotate: 30,
                    formatter: function (value, index) {
                        if (formattedTime.value.length > 10) {
                            return index % 2 === 0 ? value : '';
                        }
                        return value;
                    }
                },
                axisTick: { alignWithLabel: true },
                data: formattedTime.value
            },
            yAxis: {
                type: 'value',
                name: '灌注指数',
                nameTextStyle: { color: '#666', fontSize: 18, padding: [0, 0, 5, 0] },
                axisLine: { lineStyle: { color: '#333' } },
                axisLabel: { color: '#666', fontSize: 16 },
                splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
                min: 0,
                max: maxY.value
            },
            dataZoom: [{
                type: 'inside',
                start: 0,
                end: 100,
                zoomLock: false
            }],
            series: [{
                name: '灌注指数',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                showSymbol: true,
                itemStyle: {
                    color: color,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                lineStyle: {
                    color: color,
                    width: 2
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(84, 135, 255, 0.2)' },
                        { offset: 1, color: 'rgba(84, 135, 255, 0.05)' }
                    ])
                },
                emphasis: {
                    focus: 'series',
                    itemStyle: {
                        borderWidth: 3,
                        shadowBlur: 8,
                        shadowColor: color
                    }
                },
                data: data.value
            }]
        };
        
        myChart.setOption(option);
        console.log("=== PiDataClear 图表初始化成功 ===");
    } catch (error) {
        console.error('PiDataClear: 初始化图表失败', error);
    }
};

const handleResize = () => {
    if (myChart && isMountedFlag) {
        try {
            myChart.resize();
        } catch (e) {
            console.error("PiDataClear: 调整图表大小时出错", e);
        }
    }
};

const stopCalendarWatch = watch(
    () => [
        calendarSelectionStore.selectedDate,
        calendarSelectionStore.selectedWeek,
        calendarSelectionStore.selectedMonth,
        calendarSelectionStore.selectedYear,
        calendarSelectionStore.currentViewType
    ],
    (newVal, oldVal) => {
        if (!isMountedFlag) return;
        if (JSON.stringify(newVal) === JSON.stringify(oldVal)) {
            return;
        }
        if (fetchTimeout) {
            clearTimeout(fetchTimeout);
        }
        if (isFetching) {
            return;
        }
        fetchTimeout = setTimeout(() => {
            if (!isMountedFlag) {
                console.log("PiDataClear: setTimeout 回调执行时组件已卸载，跳过");
                return;
            }
            fetchAggregatedData();
        }, 150);
    },
    { deep: true }
);

onMounted(() => {
    console.log("=== PiDataClear 组件已挂载 ===");
    isMountedFlag = true;
    
    initChart();
    fetchAggregatedData();
    fetchLatestData();
    
    window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
    console.log("=== PiDataClear 组件开始卸载 ===");
    isMountedFlag = false;
    isFetching = false;
    
    if (stopCalendarWatch) {
        stopCalendarWatch();
        console.log("PiDataClear: 已停止日历监听器");
    }
    
    if (fetchTimeout) {
        clearTimeout(fetchTimeout);
        fetchTimeout = null;
    }
    
    window.removeEventListener('resize', handleResize);
    
    if (myChart) {
        try {
            myChart.dispose();
            myChart = null;
            console.log("=== PiDataClear 图表已销毁 ===");
        } catch (e) {
            console.warn("PiDataClear: 销毁图表实例时出错", e);
        }
    }
    console.log("=== PiDataClear 组件卸载完成 ===");
});
</script>

<style scoped>
.chart-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.nowData {
    height: 15%;
    width: 35%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: auto;
}

.title {
    font-size: 0.18rem;
    font-family: 'PuHuiTi';
    color: #333;
}

.data {
    font-size: 0.14rem;
    color: #F7819B;
    font-weight: bold;
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
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-overlay,
.error-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 0.16rem;
    color: #999;
}
</style>
