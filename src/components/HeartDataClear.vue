<template>
  <div class="chart-container">
    <div class="nowData">
      <span class="title">当前心率</span>
      <div class="dataBox">
        <span class="data">{{ nowData }}</span> 
        <span class="unit">bmp</span>
      </div>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">数据加载失败</div>
    <div v-else ref="chart" style="width: 100%; height: 100%;"></div>
    
    <!-- 添加警告组件 -->
    <ModernHealthAlert
      v-if="analysisResult && isMounted"
      :analysis-result="analysisResult"
      data-type="heart"
      position="top-right"
      @export-data="handleExportData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
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
// 导入新的聚合API和实时数据API
import { 
    getHeartDataByDate, 
    getHeartDataByWeek, 
    getHeartDataByMonth, 
    getHeartDataByYear,
    getHeartData //导入实时数据API
} from '../api/healthData';
// 导入健康分析工具
import healthAnalyzer from '../utils/healthAnalyzer';
// 导入警告组件
import ModernHealthAlert from './ModernHealthAlert.vue';

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
const calendarSelectionStore = useCalendarSelectionStore();
// nowData 用于显示实时心率
const nowData = ref(0); 
// 用于图表的历史数据
const data = ref([]);
const formattedTime = ref([]);
const rawTimeData = ref([]); // 存储原始时间数据，用于tooltip显示
const chart = ref(null);
let myChart = null;
let isMounted = false;
let chartInitialized = false;
let isFetching = false;
const loading = ref(false);
const error = ref(false);
// 颜色定义
const color = ["#FF0000", "#00CA69"];
// 添加健康分析结果
const analysisResult = ref(null);

// --- 时间格式化函数 ---
const formatRecordTime = (timeStr, viewType = 'day') => {
    if (!timeStr) return 'N/A';
    try {
        const date = new Date(timeStr);
        if (isNaN(date.getTime())) {
            console.warn(`Invalid time string: ${timeStr}`);
            return timeStr; // 返回原字符串以便调试
        }
        // 根据视图类型返回不同格式
        switch(viewType) {
            case 'day':
                // 日视图: 显示 HH:mm
                return date.toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                });
            case 'week':
            case 'month':
                // 周/月视图: 显示 MM-DD
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            case 'year':
                // 年视图: 显示 YYYY-MM
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

// --- 获取实时心率数据 (WebSocket) ---
const fetchRealTimeData = async () => {
    if (!isMounted || !user_id) return;

    console.log("=== HeartDataClear 开始订阅实时心率数据 ===");
    try {
        const realTimeData = await getHeartData(user_id);
        console.log("收到实时心率数据:", realTimeData);

        // 假设 realTimeData 是一个数组，包含最新记录
        if (realTimeData && Array.isArray(realTimeData) && realTimeData.length > 0) {
            const latestRecord = realTimeData[0]; // 获取最新的一条记录
            // 根据您的API返回格式调整字段名，例如 heartData
            nowData.value = latestRecord.heartData || 0; 
            
            console.log(`更新实时心率值: ${nowData.value}`);
        }
    } catch (error) {
        console.error("获取实时心率数据失败:", error);
        // 可以考虑设置一个默认值或显示错误状态
        // nowData.value = 0;
    }
};

// --- 数据获取函数 (用于历史图表) ---
const fetchAggregatedData = async () => {
    if (!isMounted) {
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
        updateChart();
        isFetching = false;
        return;
    }
    const selection = calendarSelectionStore;
    const viewType = selection.currentViewType;
    let response = null;
    loading.value = true;
    error.value = false;
    try {
        if (selection.selectedDate) {
            const dateStr = formatDate(selection.selectedDate);
            response = await getHeartDataByDate(user_id, dateStr);
            console.log(`获取单日心率数据: ${dateStr}`, response);
        } else if (selection.selectedWeek) {
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
            console.log("当前无选中日期/周期");
            resetData();
            isFetching = false;
            return;
        }
        if (!isMounted) {
            console.warn("HeartDataClear 组件在数据获取期间已卸载");
            isFetching = false;
            return;
        }
        const apiResponse = response.data;
        const responseData = apiResponse.data;
        console.log(`原始响应数据 (${viewType}视图):`, responseData);
        console.log(`数据长度: ${responseData ? responseData.length : 0}`);
        if (apiResponse && apiResponse.code === 200 && Array.isArray(responseData) && responseData.length > 0) {
            let processedData = [];
            let processedTimes = [];
            let rawTimes = [];
            if (viewType === 'day') {
                // 日视图: 按时间排序
                const sortedData = responseData.sort((a, b) => {
                    return new Date(a.recordTime) - new Date(b.recordTime);
                });
                processedData = sortedData.map(item => item.heartData);
                rawTimes = sortedData.map(item => item.recordTime);
                processedTimes = rawTimes.map(time => formatRecordTime(time, 'day'));
                console.log('日视图数据排序后:', {
                    times: rawTimes,
                    values: processedData
                });
            } else {
                // 周/月/年视图: 按日期排序
                const sortedData = responseData.sort((a, b) => {
                    const dateA = a.date || a.weekStart || a.month || a.yearMonth;
                    const dateB = b.date || b.weekStart || b.month || b.yearMonth;
                    return new Date(dateA) - new Date(dateB);
                });
                processedData = sortedData.map(item => item.avgValue);
                rawTimes = sortedData.map(item => item.date || item.weekStart || item.month || item.yearMonth);
                processedTimes = rawTimes.map(time => formatRecordTime(time, viewType));
                console.log(`${viewType}视图数据排序后:`, {
                    times: rawTimes,
                    values: processedData
                });
            }
            // 更新响应式变量 (用于图表)
            data.value = processedData;
            formattedTime.value = processedTimes;
            rawTimeData.value = rawTimes;
            console.log('处理后的数据详情 (用于图表):', {
                viewType,
                dataLength: data.value.length,
                timeLength: formattedTime.value.length,
                dataPoints: data.value,
                timePoints: formattedTime.value,
                rawTimes: rawTimeData.value
            });
            
            // 更新图表
            updateChart();
            
            // 分析健康数据
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
    updateChart();
};

// --- 图表更新函数 ---
const updateChart = () => {
    console.log("=== HeartDataClear 开始更新图表 ===");
    console.log("组件挂载状态:", isMounted);
    console.log("图表实例存在:", !!myChart);
    console.log("DOM引用存在:", !!chart.value);
    console.log("数据长度:", data.value.length);
    console.log("时间长度:", formattedTime.value.length);
    if (!isMounted) {
        console.warn("HeartDataClear 组件已卸载，停止图表更新");
        return;
    }
    if (!myChart || !chart.value) {
        console.warn("图表实例不存在或DOM未挂载，尝试重新初始化");
        setTimeout(() => {
            if (isMounted && chart.value) {
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

// 实际的图表更新逻辑
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
        
        const maxDataValue = Math.max(...displayData.filter(d => typeof d === 'number' && !isNaN(d)));
        const minDataValue = Math.min(...displayData.filter(d => typeof d === 'number' && !isNaN(d)));
        
        const yMax = Math.max(120, Math.ceil(maxDataValue * 1.1));
        const yMin = Math.min(40, Math.floor(minDataValue * 0.9));
        
        const currentOption = myChart.getOption() || {};
        myChart.setOption({
            animation: true,
            animationDuration: 800,
            animationEasing: 'quadraticOut',
            xAxis: {
                ...(currentOption.xAxis?.[0] || {}),
                data: displayTimes
            },
            yAxis: {
                ...(currentOption.yAxis?.[0] || {}),
                min: yMin,
                max: yMax
            },
            series: [{
                ...(currentOption.series?.[0] || {}),
                data: displayData
            }]
        }, {
            notMerge: false,
            lazyUpdate: true
        });
        setTimeout(() => {
            if (myChart && isMounted) {
                try {
                    myChart.resize();
                } catch (e) {
                    console.error("图表重绘失败:", e);
                }
            }
        }, 50);
        console.log("=== HeartDataClear 图表更新完成 ===");
    } catch (error) {
        console.error("更新图表时发生错误:", error);
        if (isMounted) {
            setTimeout(() => {
                initChart();
            }, 200);
        }
    }
};

// --- tooltip显示 ---
const getTooltipFormatter = () => {
    return (params) => {
        const viewType = calendarSelectionStore.currentViewType;
        let timeStr = '';
        const index = params[0].dataIndex;
        if (rawTimeData.value && rawTimeData.value[index]) {
            const rawTime = rawTimeData.value[index];
            try {
                const date = new Date(rawTime);
                if (!isNaN(date.getTime())) {
                    switch(viewType) {
                        case 'day':
                            timeStr = date.toLocaleString('zh-CN', {
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            break;
                        case 'week':
                        case 'month':
                            timeStr = date.toLocaleDateString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            });
                            break;
                        case 'year':
                            timeStr = date.toLocaleDateString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit'
                            });
                            break;
                        default:
                            timeStr = rawTime;
                    }
                } else {
                    timeStr = rawTime;
                }
            } catch (e) {
                timeStr = rawTime;
            }
        } else {
            timeStr = formattedTime.value[index] || `点 ${index + 1}`;
        }
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
            <div>${params[0].marker} 心率: <span style="font-weight:bold; color:${color[0]}">${value} bmp</span></div>
            ${analysisInfo}
        `;
    };
};

// --- 图表初始化 ---
const initChart = () => {
    if (!isMounted || !chart.value) {
        console.warn("HeartDataClear 组件未挂载或DOM不存在，无法初始化图表");
        return;
    }
    if (myChart && chartInitialized) {
        try {
            myChart.dispose();
        } catch (e) {
            console.warn("清理旧图表实例时出错:", e);
        }
    }
    try {
        myChart = echarts.init(chart.value);
        chartInitialized = true;
        const option = {
            color,
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#ccc',
                borderWidth: 1,
                textStyle: {
                    color: '#333',
                    fontSize: 14
                },
                formatter: getTooltipFormatter()
            },
            grid: {
                top: '10%',
                bottom: '15%',
                left: '10%',
                right: '5%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                axisLine: {
                    lineStyle: {
                        color: '#333'
                    }
                },
                axisLabel: {
                    color: '#666',
                    fontSize: 12,
                    rotate: calendarSelectionStore.currentViewType === 'day' ? 45 : 0,
                    formatter: function(value, index) {
                        const viewType = calendarSelectionStore.currentViewType;
                        if (viewType === 'day' && formattedTime.value.length > 10) {
                            return index % 2 === 0 ? value : '';
                        }
                        return value;
                    }
                },
                axisTick: {
                    alignWithLabel: true
                },
                data: formattedTime.value
            },
            yAxis: {
                type: 'value',
                name: '心率 (bmp)',
                nameTextStyle: {
                    color: '#666',
                    fontSize: 12
                },
                axisLine: {
                    lineStyle: {
                        color: '#333'
                    }
                },
                axisLabel: {
                    color: '#666',
                    fontSize: 12
                },
                splitLine: {
                    lineStyle: {
                        color: '#f0f0f0',
                        type: 'dashed'
                    }
                }
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
                symbolSize: 6,
                showSymbol: data.value.length <= 30,
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
        myChart.on('click', (params) => {
            console.log('图表点击事件:', params);
            console.log('点击位置数据索引:', params.dataIndex);
            console.log('原始时间数据:', rawTimeData.value[params.dataIndex]);
        });
        console.log("=== HeartDataClear 图表初始化成功 ===");
    } catch (error) {
        console.error("初始化图表失败:", error);
        chartInitialized = false;
    }
};

// --- 健康数据分析师 ---
const analyzeHealthData = (dataPoints, timePoints) => {
    if (dataPoints.length === 0 || !healthAnalyzer.HeartRateRules) {
        analysisResult.value = null;
        return;
    }
    
    try {
        analysisResult.value = healthAnalyzer.HeartRateRules.analyzeHeartRate(dataPoints, timePoints);
        console.log('心率分析结果:', analysisResult.value);
        
        if (myChart && chartInitialized) {
            updateChartWithAnalysis();
        }
    } catch (error) {
        console.error('心率分析失败:', error);
        analysisResult.value = null;
    }
};

// 基于分析结果更新图表
const updateChartWithAnalysis = () => {
    if (!myChart || !analysisResult.value) return;
    
    const singleAnalyses = analysisResult.value.analyses;
    const markPoints = [];
    
    if (singleAnalyses) {
        singleAnalyses.forEach((analysis, index) => {
            if (analysis.level >= 2) {
                markPoints.push({
                    name: analysis.message,
                    coord: [index, analysis.value],
                    symbolSize: 12,
                    itemStyle: {
                        color: analysis.color,
                        opacity: 0.8
                    },
                    label: {
                        show: true,
                        formatter: '!',
                        color: '#fff',
                        fontWeight: 'bold'
                    }
                });
            }
        });
    }
    
    const suddenSpikes = analysisResult.value.suddenSpikes || [];
    suddenSpikes.forEach(spike => {
        const startIndex = rawTimeData.value.findIndex(t => new Date(t).getTime() === new Date(spike.startTime).getTime());
        const endIndex = rawTimeData.value.findIndex(t => new Date(t).getTime() === new Date(spike.endTime).getTime());
        
        if (startIndex !== -1 && endIndex !== -1) {
            markPoints.push({
                name: spike.message,
                coord: [endIndex, data.value[endIndex]],
                symbolSize: 15,
                itemStyle: {
                    color: spike.color,
                    opacity: 0.9
                },
                label: {
                    show: true,
                    formatter: '↑',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });
        }
    });
    
    const arrhythmiaPatterns = analysisResult.value.arrhythmiaPatterns || [];
    arrhythmiaPatterns.forEach(pattern => {
        const index = rawTimeData.value.findIndex(t => new Date(t).getTime() === new Date(pattern.timestamp).getTime());
        if (index !== -1) {
            markPoints.push({
                name: pattern.message,
                coord: [index, data.value[index]],
                symbolSize: 14,
                itemStyle: {
                    color: pattern.color,
                    opacity: 0.8
                },
                label: {
                    show: true,
                    formatter: '~',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });
        }
    });
    
    myChart.setOption({
        series: [{
            markPoint: {
                data: markPoints,
                symbol: 'circle'
            }
        }]
    });
};

// 处理导出数据
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
  link.download = `心率数据_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
};

// --- 防抖逻辑 ---
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
        fetchAggregatedData();
    }, 150);
};

// --- 监听日历选择变化 ---
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

// --- 组件生命周期 ---
onMounted(() => {
    console.log("=== HeartDataClear.vue 组件开始挂载 ===");
    isMounted = true;
    setTimeout(() => {
        if (isMounted && chart.value) {
            console.log("开始初始化图表...");
            initChart();
            setTimeout(() => {
                if (isMounted) {
                    console.log("开始获取历史聚合数据...");
                    fetchAggregatedData(); // 获取用于图表的历史数据
                }
            }, 300);
        }
    }, 100);
    
    // 获取实时数据用于顶部显示 (关键：在挂载时调用一次)
    fetchRealTimeData(); 

    const handleResize = () => {
        if (myChart && isMounted) {
            try {
                myChart.resize();
            } catch (error) {
                console.warn("调整图表大小时出错:", error);
            }
        }
    };
    window.addEventListener('resize', handleResize);
    window.__heartChartResizeHandler = handleResize;
});

onUnmounted(() => {
    console.log("=== HeartDataClear.vue 组件开始卸载 ===");
    isMounted = false;
    isFetching = false;
    chartInitialized = false;
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
            console.log("图表实例已清理");
        } catch (error) {
            console.warn("清理图表实例时出错:", error);
        }
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
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.unit {
    font-size: 0.08rem;
    font-family: 'PuHuiTi';
    color: #8E9AAB;
    margin-left: 2px;
}
.loading,
.error {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.16rem;
    color: #666;
    background: #f9f9f9;
    border-radius: 4px;
}
.error {
    color: #ff4d4f;
}
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>