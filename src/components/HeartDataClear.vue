<template>
    <div class="chart-container">
        <div class="nowData">
            <span class="title">当前心率</span>
            <div class="dataBox">
                <span class="data">{{ latestData }}</span>
                <span class="unit">bpm</span>
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
    getHeartDataByDate,
    getHeartDataByWeek,
    getHeartDataByMonth,
    getHeartDataByYear
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

const color = ["#FF0000", "#00CA69"];

const formatRecordTime = (timeStr, viewType = 'day') => {
    if (!timeStr) return 'N/A';
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
    } catch (error) {
        console.error('时间格式化错误:', error);
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
        console.warn("用户ID无效或组件已卸载，无法获取最新心率数据");
        return;
    }
    
    try {
        const today = new Date();
        const todayStr = formatDate(today);
        
        const response = await getHeartDataByDate(user_id, todayStr);
        
        if (!isMountedFlag) return;
        
        const apiResponse = response.data;
        const responseData = apiResponse.data;
        
        if (apiResponse && apiResponse.code === 200 && Array.isArray(responseData) && responseData.length > 0) {
            const sortedData = [...responseData].sort((a, b) => 
                new Date(b.recordTime) - new Date(a.recordTime)
            );
            latestData.value = sortedData[0].heartData || sortedData[0].avgValue || 0;
        } else {
            latestData.value = 0;
        }
    } catch (err) {
        console.error("获取最新心率数据失败", err);
        if (isMountedFlag) {
            latestData.value = 0;
        }
    }
};

const fetchAggregatedData = async () => {
    if (!isMountedFlag) {
        console.warn("HeartDataClear 组件已卸载，停止数据获取");
        return;
    }
    
    isFetching = true;
    console.log("=== HeartDataClear 开始获取历史聚合数据 ===");
    
    if (!user_id) {
        console.warn("用户ID无效，无法获取数据");
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
        
        let response;
        let responseData;
        
        if (viewType === 'day' && selection.selectedDate) {
            const dateStr = formatDate(selection.selectedDate);
            response = await getHeartDataByDate(user_id, dateStr);
            responseData = response.data.data;
        } else if (selection.selectedWeek) {
            const dateInWeekStr = formatDate(selection.selectedWeek.startDate);
            response = await getHeartDataByWeek(user_id, dateInWeekStr);
            responseData = response.data.data;
        } else if (selection.selectedMonth) {
            response = await getHeartDataByMonth(user_id, selection.selectedMonth.year, selection.selectedMonth.month);
            responseData = response.data.data;
        } else if (selection.selectedYear) {
            response = await getHeartDataByYear(user_id, selection.selectedYear);
            responseData = response.data.data;
        } else {
            response = await getHeartDataByDate(user_id, formatDate(new Date()));
            responseData = response.data.data;
        }
        
        if (!isMountedFlag) {
            console.warn("HeartDataClear 组件在数据获取期间已卸载");
            return;
        }
        
        if (responseData && Array.isArray(responseData)) {
            const isRawFormat = responseData[0].heartData !== undefined;
            
            let processedData, rawTimes;
            
            if (isRawFormat) {
                const sortedData = [...responseData].sort((a, b) => 
                    new Date(a.recordTime) - new Date(b.recordTime)
                );
                processedData = sortedData.map(item => item.heartData);
                rawTimes = sortedData.map(item => item.recordTime);
            } else {
                const sortedData = responseData.sort((a, b) => {
                    const dateA = a.date || a.weekStart || a.month || a.yearMonth;
                    const dateB = b.date || b.weekStart || b.month || b.yearMonth;
                    return new Date(dateA) - new Date(dateB);
                });
                processedData = sortedData.map(item => item.avgHeart || item.avgValue);
                rawTimes = sortedData.map(item => item.date || item.weekStart || item.month || item.yearMonth);
            }
            
            const processedTimes = rawTimes.map(time => formatRecordTime(time, viewType));
            
            if (!isMountedFlag) {
                console.warn("HeartDataClear 组件在数据处理期间已卸载");
                return;
            }
            
            data.value = processedData;
            formattedTime.value = processedTimes;
            
            updateChart();
        } else {
            console.warn("API返回的心率聚合数据格式不正确或为空", response.data);
            if (isMountedFlag) {
                data.value = [];
                formattedTime.value = [];
                updateChart();
            }
        }
    } catch (err) {
        console.error("获取心率聚合数据失败", err);
        if (isMountedFlag) {
            error.value = true;
            data.value = [];
            formattedTime.value = [];
        }
    } finally {
        if (isMountedFlag) {
            loading.value = false;
        }
        isFetching = false;
    }
    console.log("=== HeartDataClear 历史聚合数据获取完成 ===");
};

const updateChart = () => {
    if (!myChart || !isMountedFlag) {
        console.warn("图表实例不存在或组件已卸载，跳过更新");
        return;
    }
    
    try {
        if (data.value.length === 0 || formattedTime.value.length === 0) {
            myChart.setOption({
                title: {
                    text: '暂无数据',
                    left: 'center',
                    top: 'center',
                    textStyle: {
                        color: '#999',
                        fontSize: 14
                    }
                },
                xAxis: {
                    show: false,
                    data: []
                },
                yAxis: {
                    show: false
                },
                series: [{
                    data: []
                }]
            });
            return;
        }
        
        const displayData = data.value.slice(0, Math.min(data.value.length, formattedTime.value.length));
        const displayTimes = formattedTime.value.slice(0, Math.min(data.value.length, formattedTime.value.length));
        
        const maxVal = Math.max(...displayData.filter(d => typeof d === 'number' && !isNaN(d)));
        const minVal = Math.min(...displayData.filter(d => typeof d === 'number' && !isNaN(d)));
        const yMax = Math.max(120, Math.ceil(maxVal * 1.15));
        const yMin = Math.min(40, Math.floor(minVal * 0.85));
        
        const totalPoints = displayData.length;
        let zoomStart = 0;
        let zoomEnd = 100;
        if (totalPoints > 15) {
            zoomEnd = 100;
            zoomStart = ((totalPoints - 15) / totalPoints) * 100;
        }
        
        myChart.setOption({
            title: { show: false },
            xAxis: {
                show: true,
                data: displayTimes,
                axisLabel: {
                    rotate: displayTimes.length > 10 ? 30 : 0
                }
            },
            yAxis: {
                show: true,
                min: yMin,
                max: yMax
            },
            dataZoom: [
                { type: 'inside', start: zoomStart, end: zoomEnd, zoomLock: false }
            ],
            series: [{
                data: displayData
            }]
        });
        
        setTimeout(() => {
            if (myChart && isMountedFlag) {
                try {
                    myChart.resize();
                } catch (e) {
                    console.error("图表重绘失败:", e);
                }
            }
        }, 50);
        
        console.log("=== HeartDataClear 图表更新完成 ===");
    } catch (e) {
        console.error('更新图表失败:', e);
    }
};

const initChart = () => {
    console.log("=== HeartDataClear 开始初始化图表 ===");
    if (!isMountedFlag || !chart.value) {
        console.warn("HeartDataClear 组件未挂载或DOM不存在，无法初始化图表");
        return;
    }
    
    try {
        myChart = echarts.init(chart.value);
        console.log("图表实例创建成功");
        
        const option = {
            color,
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
                        <div>${params[0].marker} 心率: <span style="font-weight:bold; color:${color[0]}">${value} bpm</span></div>
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
                name: '心率 (bpm)',
                nameTextStyle: { color: '#666', fontSize: 18, padding: [0, 0, 5, 0] },
                axisLine: { lineStyle: { color: '#333' } },
                axisLabel: { color: '#666', fontSize: 16 },
                splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
                min: 40,
                max: 120
            },
            dataZoom: [{
                type: 'inside',
                start: 0,
                end: 100,
                zoomLock: false
            }],
            series: [{
                name: '心率',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                showSymbol: true,
                itemStyle: {
                    color: color[0],
                    borderColor: '#fff',
                    borderWidth: 2
                },
                lineStyle: {
                    color: color[0],
                    width: 2,
                    shadowBlur: 5,
                    shadowColor: 'rgba(255, 0, 0, 0.3)',
                    shadowOffsetY: 2
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(255, 0, 0, 0.2)' },
                        { offset: 1, color: 'rgba(255, 0, 0, 0.05)' }
                    ])
                },
                emphasis: {
                    focus: 'series',
                    itemStyle: {
                        borderWidth: 3,
                        shadowBlur: 8,
                        shadowColor: color[0]
                    }
                },
                data: data.value
            }]
        };
        
        myChart.setOption(option);
        console.log("=== HeartDataClear 图表初始化成功 ===");
    } catch (error) {
        console.error('初始化图表失败:', error);
    }
};

const handleResize = () => {
    if (myChart && isMountedFlag) {
        try {
            myChart.resize();
        } catch (e) {
            console.error("调整图表大小时出错:", e);
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
                console.log("HeartDataClear: setTimeout 回调执行时组件已卸载，跳过");
                return;
            }
            fetchAggregatedData();
        }, 150);
    },
    { deep: true }
);

onMounted(() => {
    console.log("=== HeartDataClear 组件已挂载 ===");
    isMountedFlag = true;
    
    initChart();
    fetchAggregatedData();
    fetchLatestData();
    
    window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
    console.log("=== HeartDataClear 组件开始卸载 ===");
    isMountedFlag = false;
    isFetching = false;
    
    if (stopCalendarWatch) {
        stopCalendarWatch();
        console.log("HeartDataClear: 已停止日历监听器");
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
            console.log("=== HeartDataClear 图表已销毁 ===");
        } catch (e) {
            console.warn("销毁图表实例时出错:", e);
        }
    }
    console.log("=== HeartDataClear 组件卸载完成 ===");
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
