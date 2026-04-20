<template>
    <div class="chart-container">
        <div class="nowData">
            <span class="title">当前心率</span>
            <div class="dataBox">
                <span class="data">{{ nowData }}</span>
                <span class="unit">bpm</span>
            </div>
        </div>
        <div ref="chart" style="width: 100%; height: 100%;">
            <div v-if="loading" class="loading-overlay">加载中...</div>
            <div v-else-if="error" class="error-overlay">数据加载失败</div>
        </div>
        <ModernHealthAlert v-if="analysisResult && isMountedFlag" :analysis-result="analysisResult" data-type="heart"
            position="top-right" @export-data="handleExportData" />
    </div>
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
    TransformComponent,
    DataZoomComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import healthAnalyzer from '../utils/healthAnalyzer';
import ModernHealthAlert from './ModernHealthAlert.vue';
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

const nowData = ref(0);
const data = ref([]);
const formattedTime = ref([]);
const rawTimeData = ref([]);
const chart = ref(null);
let myChart = null;
let isMountedFlag = false;
let chartInitialized = false;
const analysisResult = ref(null);
const color = ["#FF0000", "#00CA69"];
const loading = ref(false);
const error = ref(false);
let isFetching = false;

const MAX_DISPLAY = 15;
const INSERT_INTERVAL = 1000;
const BATCH_SIZE_MIN = 5;
const BATCH_SIZE_MAX = 10;
const BATCH_DELAY_MIN = 3000;
const BATCH_DELAY_MAX = 6000;

let simulationTimer = null;
let batchTimer = null;
let simulationStartTime = null;
let dataIndexCounter = 0;
let isSimulating = false;

const generateHeartRate = (prevValue) => {
    const base = prevValue || 72;
    const drift = (Math.random() - 0.5) * 3;
    const noise = (Math.random() - 0.5) * 1.5;
    let value = base + drift + noise;
    if (Math.random() < 0.03) {
        value += (Math.random() - 0.5) * 8;
    }
    return Math.round(Math.max(55, Math.min(110, value)));
};

const generateTimeLabel = (offsetMs) => {
    const now = new Date(simulationStartTime.getTime() + offsetMs);
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const generateBatch = () => {
    const size = Math.floor(Math.random() * (BATCH_SIZE_MAX - BATCH_SIZE_MIN + 1)) + BATCH_SIZE_MIN;
    const batch = [];
    let prev = data.value.length > 0 ? data.value[data.value.length - 1] : null;
    for (let i = 0; i < size; i++) {
        dataIndexCounter++;
        const value = generateHeartRate(prev);
        const offsetMs = dataIndexCounter * 2000;
        batch.push({
            value,
            timeLabel: generateTimeLabel(offsetMs),
            timeRaw: new Date(simulationStartTime.getTime() + offsetMs).toISOString()
        });
        prev = value;
    }
    return batch;
};

const insertDataPoint = (item) => {
    if (!isMountedFlag) return;
    data.value.push(item.value);
    formattedTime.value.push(item.timeLabel);
    rawTimeData.value.push(item.timeRaw);
    nowData.value = item.value;

    if (data.value.length > MAX_DISPLAY) {
        const overflow = data.value.length - MAX_DISPLAY;
        data.value.splice(0, overflow);
        formattedTime.value.splice(0, overflow);
        rawTimeData.value.splice(0, overflow);
    }

    updateChartWithAnimation();
};

const startBatchInsert = (batch) => {
    let index = 0;
    const insertNext = () => {
        if (!isMountedFlag || index >= batch.length) {
            if (isMountedFlag && isSimulating) {
                scheduleNextBatch();
            }
            return;
        }
        insertDataPoint(batch[index]);
        index++;
        simulationTimer = setTimeout(insertNext, INSERT_INTERVAL);
    };
    insertNext();
};

const scheduleNextBatch = () => {
    if (!isMountedFlag || !isSimulating) return;
    const delay = Math.floor(Math.random() * (BATCH_DELAY_MAX - BATCH_DELAY_MIN + 1)) + BATCH_DELAY_MIN;
    batchTimer = setTimeout(() => {
        if (!isMountedFlag || !isSimulating) return;
        const batch = generateBatch();
        startBatchInsert(batch);
    }, delay);
};

const startSimulation = () => {
    if (isSimulating) return;
    isSimulating = true;
    simulationStartTime = new Date();
    dataIndexCounter = 0;
    data.value = [];
    formattedTime.value = [];
    rawTimeData.value = [];

    const initialBatch = generateBatch();
    startBatchInsert(initialBatch);
};

const stopSimulation = () => {
    isSimulating = false;
    if (simulationTimer) {
        clearTimeout(simulationTimer);
        simulationTimer = null;
    }
    if (batchTimer) {
        clearTimeout(batchTimer);
        batchTimer = null;
    }
};

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

const fetchAggregatedData = async () => {
    if (!isMountedFlag) {
        console.warn("HeartDataClear 组件已卸载，停止数据获取");
        return;
    }
    console.log("=== HeartDataClear 开始获取历史聚合数据 ===");
    isFetching = true;
    if (!user_id) {
        console.warn("用户ID无效，无法获取数据");
        data.value = [];
        formattedTime.value = [];
        rawTimeData.value = [];
        updateChartWithAnimation();
        isFetching = false;
        return;
    }
    const selection = calendarSelectionStore;
    const viewType = selection.currentViewType;

    if (viewType === 'day') {
        console.log("日视图使用模拟数据，跳过API请求");
        isFetching = false;
        return;
    }

    if (!myChart || !chartInitialized) {
        console.warn("图表未初始化，尝试重新初始化");
        if (chart.value) {
            initChart();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    let response = null;
    loading.value = true;
    error.value = false;
    try {
        if (selection.selectedWeek) {
            const dateInWeekStr = formatDate(selection.selectedWeek.startDate);
            response = await getHeartDataByWeek(user_id, dateInWeekStr);
            console.log(`获取周心率数据: ${dateInWeekStr}`, response);
        } else if (selection.selectedMonth) {
            response = await getHeartDataByMonth(user_id, selection.selectedMonth.year, selection.selectedMonth.month);
            console.log(`获取月心率数据: ${selection.selectedMonth.year}-${selection.selectedMonth.month}`, response);
        } else if (selection.selectedYear) {
            response = await getHeartDataByYear(user_id, selection.selectedYear);
            console.log(`获取年心率数据: ${selection.selectedYear}`, response);
        } else {
            console.log("当前无选中周期");
            resetData();
            isFetching = false;
            return;
        }

        if (!isMountedFlag) {
            console.warn("HeartDataClear 组件在数据获取期间已卸载");
            isFetching = false;
            return;
        }

        const apiResponse = response.data;
        const responseData = apiResponse.data;
        console.log(`原始响应数据 (${viewType}视图):`, responseData);

        if (apiResponse && apiResponse.code === 200 && Array.isArray(responseData) && responseData.length > 0) {
            const sortedData = responseData.sort((a, b) => {
                const dateA = a.date || a.weekStart || a.month || a.yearMonth;
                const dateB = b.date || b.weekStart || b.month || b.yearMonth;
                return new Date(dateA) - new Date(dateB);
            });

            const processedData = sortedData.map(item => item.avgValue);
            const rawTimes = sortedData.map(item => item.date || item.weekStart || item.month || item.yearMonth);
            const processedTimes = rawTimes.map(time => formatRecordTime(time, viewType));

            data.value = processedData;
            formattedTime.value = processedTimes;
            rawTimeData.value = rawTimes;

            console.log('处理后的数据详情:', {
                viewType,
                dataLength: data.value.length,
                timeLength: formattedTime.value.length,
                dataPoints: data.value,
                timePoints: formattedTime.value
            });

            updateChartWithAnimation();
            analyzeHealthData(processedData, rawTimes);
        } else {
            console.warn("API返回的心率聚合数据格式不正确、为空数组或无数据", apiResponse);
            resetData();
        }
    } catch (err) {
        console.error("获取心率聚合数据失败", err);
        error.value = true;
        resetData();
    } finally {
        loading.value = false;
        isFetching = false;
    }
    console.log("=== HeartDataClear 历史聚合数据获取完成 ===");
};

const resetData = () => {
    data.value = [];
    formattedTime.value = [];
    rawTimeData.value = [];
    analysisResult.value = null;
    updateChartWithAnimation();
};

const updateChartWithAnimation = () => {
    console.log("=== HeartDataClear 开始更新图表 ===");
    console.log("组件挂载状态:", isMountedFlag);
    console.log("图表实例存在:", !!myChart);
    console.log("DOM引用存在:", !!chart.value);
    console.log("数据长度:", data.value.length);
    console.log("时间长度:", formattedTime.value.length);

    if (!isMountedFlag) {
        console.warn("HeartDataClear 组件已卸载，停止图表更新");
        return;
    }
    if (!myChart || !chart.value) {
        console.warn("图表实例不存在或DOM未挂载，尝试重新初始化");
        setTimeout(() => {
            if (isMountedFlag && chart.value) {
                initChart();
                setTimeout(() => {
                    if (myChart) {
                        doUpdateChart();
                    }
                }, 50);
            }
        }, 100);
        return;
    }
    doUpdateChart();
};

const doUpdateChart = () => {
    try {
        if (data.value.length === 0 || formattedTime.value.length === 0) {
            console.log("无数据可显示，显示空图表");
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
        if (totalPoints > MAX_DISPLAY) {
            zoomEnd = 100;
            zoomStart = ((totalPoints - MAX_DISPLAY) / totalPoints) * 100;
        }

        const currentOption = myChart.getOption() || {};
        myChart.setOption({
            title: { show: false },
            animation: true,
            animationDuration: 500,
            animationEasing: 'cubicOut',
            xAxis: {
                ...(currentOption.xAxis?.[0] || {}),
                show: true,
                data: displayTimes,
                axisLabel: {
                    ...(currentOption.xAxis?.[0]?.axisLabel || {}),
                    rotate: displayTimes.length > 10 ? 30 : 0
                }
            },
            yAxis: {
                ...(currentOption.yAxis?.[0] || {}),
                show: true,
                min: yMin,
                max: yMax
            },
            dataZoom: [
                { type: 'inside', start: zoomStart, end: zoomEnd, zoomLock: false },
                { type: 'slider', show: true, bottom: 10, start: zoomStart, end: zoomEnd, height: 20, borderColor: '#ddd' }
            ],
            series: [{
                ...(currentOption.series?.[0] || {}),
                data: displayData
            }]
        }, {
            notMerge: false,
            lazyUpdate: true
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
        console.error('更新图表动画失败:', e);
        if (isMountedFlag) {
            setTimeout(() => {
                initChart();
            }, 200);
        }
    }
};

const getTooltipFormatter = () => {
    return (params) => {
        const index = params[0].dataIndex;
        let timeStr = formattedTime.value[index] || '';
        const value = params[0].value;
        let analysisInfo = '';
        if (analysisResult.value) {
            const analysis = analysisResult.value.analyses?.[index];
            if (analysis && analysis.level > 0) {
                analysisInfo = `<div style="margin-top:4px; color:${analysis.color}">${analysis.message}</div>`;
            }
        }
        return `
            <div style="margin-bottom:5px; font-weight:bold;">${timeStr}</div>
            <div>${params[0].marker} 心率: <span style="font-weight:bold; color:${color[0]}">${value} bpm</span></div>
            ${analysisInfo}
        `;
    };
};

const initChart = () => {
    console.log("=== HeartDataClear 开始初始化图表 ===");
    console.log("组件挂载状态:", isMountedFlag);
    console.log("DOM引用存在:", !!chart.value);
    if (!isMountedFlag || !chart.value) {
        console.warn("HeartDataClear 组件未挂载或DOM不存在，无法初始化图表");
        return;
    }
    if (myChart && chartInitialized) {
        try {
            myChart.dispose();
            console.log("已销毁旧图表实例");
        } catch (e) {
            console.warn("清理旧图表实例时出错:", e);
        }
    }
    try {
        myChart = echarts.init(chart.value);
        chartInitialized = true;
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
                formatter: getTooltipFormatter()
            },
            grid: {
                top: '10%',
                bottom: '18%',
                left: '10%',
                right: '5%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                axisLine: { lineStyle: { color: '#333' } },
                axisLabel: {
                    color: '#666',
                    fontSize: 12,
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
                nameTextStyle: { color: '#666', fontSize: 12 },
                axisLine: { lineStyle: { color: '#333' } },
                axisLabel: { color: '#666', fontSize: 12 },
                splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
                min: 40,
                max: 120
            },
            dataZoom: [{
                type: 'inside',
                start: 0,
                end: 100,
                zoomLock: false
            }, {
                type: 'slider',
                show: true,
                bottom: 10,
                start: 0,
                end: 100,
                height: 20,
                borderColor: '#ddd'
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
        chartInitialized = false;
    }
};

const analyzeHealthData = (dataPoints, timePoints) => {
    if (dataPoints.length === 0 || !healthAnalyzer.HeartRateRules) {
        analysisResult.value = null;
        return;
    }
    try {
        analysisResult.value = healthAnalyzer.HeartRateRules.analyzeHeartRate(dataPoints, timePoints);
    } catch (error) {
        console.error('心率分析失败:', error);
        analysisResult.value = null;
    }
};

const handleExportData = () => {
    if (!analysisResult.value) return;
    const headers = ['时间', '心率值(bpm)', '状态', '建议'];
    const rows = analysisResult.value.analyses.map(analysis => [
        new Date(analysis.timestamp).toLocaleString('zh-CN'),
        analysis.value,
        analysis.message || '正常',
        analysis.suggestion || ''
    ]);
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `心率数据_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
};

onMounted(() => {
    console.log("=== HeartDataClear.vue 组件开始挂载 ===");
    isMountedFlag = true;
    setTimeout(() => {
        if (isMountedFlag && chart.value) {
            initChart();
            setTimeout(() => {
                if (isMountedFlag) {
                    const viewType = calendarSelectionStore.currentViewType;
                    if (viewType === 'day' || viewType === null) {
                        startSimulation();
                    } else {
                        fetchAggregatedData();
                    }
                }
            }, 300);
        }
    }, 100);

    const handleResize = () => {
        if (myChart && isMountedFlag) {
            try { myChart.resize(); } catch (e) { }
        }
    };
    window.addEventListener('resize', handleResize);
    window.__heartChartResizeHandler = handleResize;
});

let fetchTimeout = null;
const debouncedFetchData = () => {
    if (fetchTimeout) {
        clearTimeout(fetchTimeout);
    }
    if (isFetching) {
        console.log("数据获取中，跳过重复请求");
        return;
    }
    fetchTimeout = setTimeout(() => {
        const viewType = calendarSelectionStore.currentViewType;
        stopSimulation();
        data.value = [];
        formattedTime.value = [];
        rawTimeData.value = [];

        if (viewType === 'day' || viewType === null) {
            startSimulation();
        } else {
            fetchAggregatedData();
        }
    }, 150);
};

watch(
    () => [
        calendarSelectionStore.selectedDate,
        calendarSelectionStore.selectedWeek,
        calendarSelectionStore.selectedMonth,
        calendarSelectionStore.selectedYear,
        calendarSelectionStore.currentViewType
    ],
    (newVal, oldVal) => {
        if (JSON.stringify(newVal) === JSON.stringify(oldVal)) {
            return;
        }
        console.log("HeartDataClear: CalendarSelectionStore 状态变化", {
            old: oldVal,
            new: newVal,
            viewType: calendarSelectionStore.currentViewType
        });
        debouncedFetchData();
    },
    { deep: true }
);

onUnmounted(() => {
    console.log("=== HeartDataClear.vue 组件开始卸载 ===");
    isMountedFlag = false;
    chartInitialized = false;
    stopSimulation();
    if (fetchTimeout) {
        clearTimeout(fetchTimeout);
        fetchTimeout = null;
    }
    if (window.__heartChartResizeHandler) {
        window.removeEventListener('resize', window.__heartChartResizeHandler);
        delete window.__heartChartResizeHandler;
    }
    if (myChart) {
        try {
            myChart.dispose();
            myChart = null;
        } catch (e) { }
    }
});
</script>

<style scoped>
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

.unit {
    font-size: 0.08rem;
    font-family: 'PuHuiTi';
    color: #8E9AAB;
    margin-left: 2px;
}

.chart-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.loading-overlay,
.error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.16rem;
    color: #666;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    z-index: 10;
}

.error-overlay {
    color: #ff4d4f;
}
</style>