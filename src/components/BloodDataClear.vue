<template>
  <div class="chart-container">
    <div class="nowData">
      <span class="title">当前血糖浓度</span>
      <div class="dataBox">
        <span class="data">{{ nowData }}</span>
        <span class="unit">mmol/L</span>
      </div>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">数据加载失败</div>
    <div v-else ref="chart" style="width: 100%; height: 100%;"></div>
    
    <!-- 添加警告组件 -->
    <ModernHealthAlert
      v-if="analysisResult && isMounted"
      :analysis-result="analysisResult"
      data-type="blood"
      position="top-right"
      @export-data="handleExportData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import useUserInfoStore from '../stores/user';
import { useCalendarSelectionStore } from '../stores/calendarSelection';
import { storeToRefs } from 'pinia';
import { 
    getBloodDataByDate, 
    getBloodDataByWeek, 
    getBloodDataByMonth, 
    getBloodDataByYear 
} from '../api/healthData';
// 导入健康分析工具
import healthAnalyzer from '../utils/healthAnalyzer';
// 导入警告组件
import ModernHealthAlert from './ModernHealthAlert.vue';

// 注册 ECharts 组件
echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LabelLayout, UniversalTransition, CanvasRenderer]);

const userInfoStore = storeToRefs(useUserInfoStore());
const user_id = userInfoStore.user_id.value;
const calendarSelectionStore = useCalendarSelectionStore();
const nowData = ref(0);
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
const color = ["#1890FF", "#52C41A"];
// 添加健康分析结果
const analysisResult = ref(null);

// 时间格式化函数
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

// --- 数据获取函数 ---
const fetchAggregatedData = async () => {
    if (!isMounted) {
        console.warn("BloodDataClear 组件已卸载，停止数据获取");
        return;
    }
    console.log("=== BloodDataClear 开始获取数据 ===");
    // 设置获取标志
    isFetching = true;
    if (!user_id) {
        console.warn("用户ID无效，无法获取数据");
        data.value = [];
        formattedTime.value = [];
        rawTimeData.value = [];
        nowData.value = 0;
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
            response = await getBloodDataByDate(user_id, dateStr);
            console.log(`获取单日血糖数据: ${dateStr}`, response);
        } else if (selection.selectedWeek) {
            const dateInWeekStr = formatDate(selection.selectedWeek.startDate);
            response = await getBloodDataByWeek(user_id, dateInWeekStr);
            console.log(`获取周血糖数据: ${dateInWeekStr}`, response);
        } else if (selection.selectedMonth) {
            response = await getBloodDataByMonth(user_id, selection.selectedMonth.year, selection.selectedMonth.month);
            console.log(`获取月血糖数据: ${selection.selectedMonth.year}-${selection.selectedMonth.month}`, response);
        } else if (selection.selectedYear) {
            response = await getBloodDataByYear(user_id, selection.selectedYear);
            console.log(`获取年血糖数据: ${selection.selectedYear}`, response);
        } else {
            console.log("当前无选中日期/周期");
            resetData();
            isFetching = false;
            return;
        }
        // 检查组件是否已卸载
        if (!isMounted) {
            console.warn("BloodDataClear 组件在数据获取期间已卸载");
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
                processedData = sortedData.map(item => item.bloodData);
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
            // 更新响应式变量
            data.value = processedData;
            formattedTime.value = processedTimes;
            rawTimeData.value = rawTimes;
            // 更新 nowData 为最后一个数据点的值
            nowData.value = processedData[processedData.length - 1] || 0;
            console.log('处理后的数据详情:', {
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
            console.warn("API返回的血糖聚合数据格式不正确、为空数组或无数据", apiResponse);
            resetData();
        }
    } catch (err) {
        console.error("获取血糖聚合数据失败", err);
        error.value = true;
        resetData();
    } finally {
        loading.value = false;
        isFetching = false;
    }
    console.log("=== BloodDataClear 数据获取完成 ===");
};

const resetData = () => {
    data.value = [];
    formattedTime.value = [];
    rawTimeData.value = [];
    nowData.value = 0;
    analysisResult.value = null;
    updateChart();
};

// --- 图表更新函数 ---
const updateChart = () => {
    console.log("=== BloodDataClear 开始更新图表 ===");
    console.log("组件挂载状态:", isMounted);
    console.log("图表实例存在:", !!myChart);
    console.log("DOM引用存在:", !!chart.value);
    console.log("数据长度:", data.value.length);
    console.log("时间长度:", formattedTime.value.length);
    if (!isMounted) {
        console.warn("BloodDataClear 组件已卸载，停止图表更新");
        return;
    }
    if (!myChart || !chart.value) {
        console.warn("图表实例不存在或DOM未挂载，尝试重新初始化");
        // 尝试重新初始化
        setTimeout(() => {
            if (isMounted && chart.value) {
                initChart();
                // 延迟更新数据
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
        // 检查数据是否有效
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
        // 确保数据一致性
        const displayData = data.value.slice(0, Math.min(data.value.length, formattedTime.value.length));
        const displayTimes = formattedTime.value.slice(0, Math.min(data.value.length, formattedTime.value.length));
        // 计算合适的Y轴最大值
        const maxDataValue = Math.max(...displayData.filter(d => typeof d === 'number' && !isNaN(d)));
        const minDataValue = Math.min(...displayData.filter(d => typeof d === 'number' && !isNaN(d)));
        
        // 添加安全余量（10%）
        const yMax = Math.max(10, Math.ceil(maxDataValue * 1.1));
        const yMin = Math.min(0, Math.floor(minDataValue * 0.9));
        
        // 获取当前选项并更新
        const currentOption = myChart.getOption() || {};
        myChart.setOption({
            animation: true,
            animationDuration: 800,
            animationEasing: 'quadraticOut',
            xAxis: {
                ...(currentOption.xAxis?.[0] || {}),
                data: displayTimes,
                axisLabel: {
                    ...(currentOption.xAxis?.[0]?.axisLabel || {}),
                    rotate: displayTimes.length > 10 ? 45 : 0
                }
            },
            yAxis: {
                ...(currentOption.yAxis?.[0] || {}),
                min: yMin,
                max: yMax
            },
            series: [{
                ...(currentOption.series?.[0] || {}),
                data: displayData
            }, {
                ...(currentOption.series?.[1] || {}),
                data: displayData
            }]
        }, {
            notMerge: false, // 使用 merge 模式，只更新数据部分
            lazyUpdate: true
        });
        // 延迟重绘，确保DOM更新完成
        setTimeout(() => {
            if (myChart && isMounted) {
                try {
                    myChart.resize();
                } catch (e) {
                    console.error("图表重绘失败:", e);
                }
            }
        }, 50);
        console.log("=== BloodDataClear 图表更新完成 ===");
    } catch (error) {
        console.error("更新图表时发生错误:", error);
        // 如果更新失败，尝试重新初始化图表
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
        
        // 添加健康分析信息
        let analysisInfo = '';
        if (analysisResult.value) {
            const analysis = analysisResult.value.singleAnalyses?.[index];
            if (analysis && analysis.level > 0) {
                analysisInfo = `<div style="margin-top:4px; color:${analysis.color}">${analysis.message}</div>`;
            }
        }
        
        // 血糖正常范围判断
        let status = '';
        let statusColor = '#333';
        if (value < 3.9) {
            status = '低血糖';
            statusColor = '#ff4d4f';
        } else if (value > 10.0) {
            status = '高血糖';
            statusColor = '#ff4d4f';
        } else {
            status = '正常';
            statusColor = '#52c41a';
        }
        
        return `
            <div style="margin-bottom:5px; font-weight:bold;">${timeStr}</div>
            <div>${params[0].marker} 血糖: <span style="font-weight:bold; color:${color[0]}">${value} mmol/L</span></div>
            <div>状态: <span style="font-weight:bold; color:${statusColor}">${status}</span></div>
            ${analysisInfo}
        `;
    };
};

// --- 图表初始化 ---
const initChart = () => {
    if (!isMounted || !chart.value) {
        console.warn("BloodDataClear 组件未挂载或DOM不存在，无法初始化图表");
        return;
    }
    // 如果图表已经初始化且实例存在，则先清理
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
                axisLine: {
                    lineStyle: {
                        color: '#333'
                    }
                },
                axisLabel: {
                    color: '#666',
                    fontSize: 12,
                    rotate: 0
                },
                axisTick: {
                    alignWithLabel: true
                },
                splitLine: { show: false },
                boundaryGap: true,
                data: formattedTime.value
            },
            yAxis: {
                type: 'value',
                name: '血糖 (mmol/L)',
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
                },
                // 添加血糖参考线
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: [
                            'rgba(82, 196, 26, 0.05)', // 正常区域
                            'rgba(255, 77, 79, 0.05)'  // 高血糖区域
                        ]
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
            series: [
                {
                    name: '血糖',
                    type: 'bar',
                    barWidth: 20,
                    showBackground: true,
                    backgroundStyle: { color: 'rgba(21, 136, 209, 0.05)' },
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 1, color: 'rgb(127, 255, 212)' },
                            { offset: 0.75, color: 'rgb(127, 253, 255)' },
                            { offset: 0.5, color: 'rgb(127, 246, 255)' },
                            { offset: 0.25, color: 'rgb(127, 229, 255)' },
                            { offset: 0, color: 'rgb(127, 202, 255)' }
                        ]),
                    },
                    data: data.value,
                    z: 0,
                    zlevel: 0,
                    emphasis: {
                        focus: 'series',
                        itemStyle: {
                            shadowBlur: 8,
                            shadowColor: 'rgba(24, 144, 255, 0.5)'
                        }
                    }
                },
                {
                    type: 'pictorialBar',
                    barWidth: 20,
                    itemStyle: { color: '#fff' },
                    symbolRepeat: 'true',
                    symbolMargin: 3,
                    symbol: 'rect',
                    symbolSize: [20, 2],
                    data: data.value,
                    z: 1,
                    zlevel: 0,
                    label: { show: false }
                }
            ],
            // 添加血糖参考线标记
            graphic: [
                {
                    type: 'line',
                    z: 100,
                    shape: {
                        x1: 0,
                        y1: 3.9,
                        x2: 100,
                        y2: 3.9
                    },
                    style: {
                        stroke: '#52c41a',
                        lineWidth: 1,
                        lineDash: [5, 5]
                    },
                    position: ['0%', '0%']
                },
                {
                    type: 'line',
                    z: 100,
                    shape: {
                        x1: 0,
                        y1: 10.0,
                        x2: 100,
                        y2: 10.0
                    },
                    style: {
                        stroke: '#ff4d4f',
                        lineWidth: 1,
                        lineDash: [5, 5]
                    },
                    position: ['0%', '0%']
                }
            ]
        };
        myChart.setOption(option);
        // 监听图表点击事件，可用于调试
        myChart.on('click', (params) => {
            console.log('图表点击事件:', params);
            console.log('点击位置数据索引:', params.dataIndex);
            console.log('原始时间数据:', rawTimeData.value[params.dataIndex]);
        });
        console.log("=== BloodDataClear 图表初始化成功 ===");
    } catch (error) {
        console.error("初始化图表失败:", error);
        chartInitialized = false;
    }
};

// --- 健康数据分析师 ---
const analyzeHealthData = (dataPoints, timePoints) => {
    if (dataPoints.length === 0 || !healthAnalyzer.BloodSugarRules) {
        analysisResult.value = null;
        return;
    }
    
    try {
        // 使用 BloodSugarRules 分析血糖数据
        analysisResult.value = healthAnalyzer.BloodSugarRules.analyzeComprehensive(dataPoints, timePoints);
        console.log('血糖分析结果:', analysisResult.value);
        
        // 如果图表已初始化，添加异常点标记
        if (myChart && chartInitialized) {
            updateChartWithAnalysis();
        }
    } catch (error) {
        console.error('血糖分析失败:', error);
        analysisResult.value = null;
    }
};

// 基于分析结果更新图表
const updateChartWithAnalysis = () => {
    if (!myChart || !analysisResult.value) return;
    
    const singleAnalyses = analysisResult.value.singleAnalyses;
    const markPoints = [];
    
    // 添加单点异常标记
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
    
    // 添加快速变化标记
    const rapidChanges = analysisResult.value.rapidChanges || [];
    rapidChanges.forEach(change => {
        const index = rawTimeData.value.findIndex(t => new Date(t).getTime() === new Date(change.timestamp).getTime());
        if (index !== -1) {
            markPoints.push({
                name: change.message,
                coord: [index, data.value[index]],
                symbolSize: 15,
                itemStyle: {
                    color: change.color,
                    opacity: 0.9
                },
                label: {
                    show: true,
                    formatter: change.change > 0 ? '↑' : '↓',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });
        }
    });
    
    // 添加持续异常标记
    const sustainedAbnormal = analysisResult.value.sustainedAbnormal || [];
    sustainedAbnormal.forEach(period => {
        const startIndex = Math.max(0, period.startIdx - 1);
        const endIndex = Math.min(data.value.length - 1, period.endIdx + 1);
        
        if (startIndex < endIndex) {
            // 添加持续异常区域
            myChart.setOption({
                series: [{
                    markArea: {
                        silent: true,
                        itemStyle: {
                            color: period.type === 'low' ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 77, 79, 0.2)',
                            borderType: 'dashed'
                        },
                        data: [[{
                            xAxis: startIndex,
                            yAxis: period.type === 'low' ? 0 : 10
                        }, {
                            xAxis: endIndex,
                            yAxis: period.type === 'low' ? 3.9 : 15
                        }]]
                    }
                }]
            });
        }
    });
    
    // 更新图表选项
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
  
  // 创建CSV内容
  const headers = ['时间', '血糖值(mmol/L)', '状态', '建议'];
  const rows = analysisResult.value.singleAnalyses.map(analysis => [
    new Date(analysis.timestamp).toLocaleString('zh-CN'),
    analysis.value,
    analysis.message || '正常',
    analysis.suggestion || ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');
  
  // 创建并下载文件
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `血糖数据_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
};

// --- 防抖逻辑 ---
let fetchTimeout = null;
const debouncedFetchData = () => {
    if (fetchTimeout) {
        clearTimeout(fetchTimeout);
    }
    // 如果已经在获取中，则跳过
    if (isFetching) {
        console.log("数据获取中，跳过重复请求");
        return;
    }
    fetchTimeout = setTimeout(() => {
        fetchAggregatedData();
    }, 150); // 适当增加延迟
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
        // 如果值没有实际变化，则不触发获取
        if (JSON.stringify(newVal) === JSON.stringify(oldVal)) {
            return;
        }
        console.log("BloodDataClear: CalendarSelectionStore 状态变化", {
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
    console.log("=== BloodDataClear.vue 组件开始挂载 ===");
    isMounted = true;
    // 等待DOM完全渲染
    setTimeout(() => {
        if (isMounted && chart.value) {
            console.log("开始初始化图表...");
            initChart();
            // 稍等片刻再获取数据，确保图表初始化完成
            setTimeout(() => {
                if (isMounted) {
                    console.log("开始获取数据...");
                    fetchAggregatedData();
                }
            }, 300);
        }
    }, 100);
    // 添加resize监听
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
    // 保存清理函数
    window.__bloodChartResizeHandler = handleResize;
});

onUnmounted(() => {
    console.log("=== BloodDataClear.vue 组件开始卸载 ===");
    isMounted = false;
    isFetching = false;
    chartInitialized = false;
    if (fetchTimeout) {
        clearTimeout(fetchTimeout);
        fetchTimeout = null;
    }
    // 清理resize监听
    if (window.__bloodChartResizeHandler) {
        window.removeEventListener('resize', window.__bloodChartResizeHandler);
        delete window.__bloodChartResizeHandler;
    }
    // 清理图表实例
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
    color: #1890FF; /* 血糖使用蓝色主题 */
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