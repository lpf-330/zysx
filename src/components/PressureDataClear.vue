<template>
    <div class="chart-container">
        <div class="nowData">
            <div class="dataBox">
                <span class="classTitle" style="color: rgb(255, 105, 35);">高压</span>
                <div class="class">
                    <span class="data">{{ latestSystolic.toFixed(1) }}</span>
                    <span class="unit">mmHg</span>
                </div>
            </div>
            <span class="title">当前血压</span>
            <div class="dataBox">
                <span class="classTitle" style="color: rgba(35, 157, 250, 1);">低压</span>
                <div class="class">
                    <span class="data">{{ latestDiastolic.toFixed(1) }}</span>
                    <span class="unit">mmHg</span>
                </div>
            </div>
        </div>
        
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="error" class="error">数据加载失败</div>
        <div v-else ref="chart" style="width: 100%; height: 100%;"></div>
        
        <!-- 添加警告组件 -->
        <ModernHealthAlert
          v-if="analysisResult && isMounted"
          :analysis-result="formattedAnalysisResult"
          data-type="pressure"
          position="top-right"
          @export-data="handleExportData"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import useUserInfoStore from '../stores/user';
import { useCalendarSelectionStore } from '../stores/calendarSelection';
import { storeToRefs } from 'pinia';
// 导入血压聚合API和实时数据API
import {
  getPreDataByDate,
  getPreDataByWeek,
  getPreDataByMonth,
  getPreDataByYear,
  getPreData // 导入实时数据API
} from '../api/healthData';
// 导入健康分析工具
import healthAnalyzer from '../utils/healthAnalyzer';
// 导入警告组件
import ModernHealthAlert from './ModernHealthAlert.vue';

echarts.use([
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

const userInfoStore = storeToRefs(useUserInfoStore());
const user_id = userInfoStore.user_id.value;
const calendarSelectionStore = useCalendarSelectionStore();

// 响应式数据
const systolicData = ref([]); // 高压数据 (用于图表)
const diastolicData = ref([]); // 低压数据 (用于图表)
const formattedTime = ref([]);
const rawTimeData = ref([]); // 存储原始时间数据，用于tooltip显示

// 当前血压 (实时数据)
const latestSystolic = ref(0); // 最新高压 (来自 WebSocket)
const latestDiastolic = ref(0); // 最新低压 (来自 WebSocket)

const chart = ref(null);
let myChart = null;
let isMounted = false;
let chartInitialized = false;
let isFetching = false;
const loading = ref(false);
const error = ref(false);

// 颜色定义
const systolicColor = "#FF6923"; // 高压颜色
const diastolicColor = "#239DFA"; // 低压颜色

// 健康分析结果
const analysisResult = ref(null);

// 格式化分析结果，适配ModernHealthAlert组件
const formattedAnalysisResult = computed(() => {
  if (!analysisResult.value) return null;
  
  const result = analysisResult.value;
  
  // 获取最大值、最小值、平均值
  const systolicPoints = systolicData.value;
  const diastolicPoints = diastolicData.value;
  
  let maxSystolic = 0;
  let minSystolic = 300;
  let maxDiastolic = 0;
  let minDiastolic = 300;
  
  systolicPoints.forEach(value => {
    const num = Number(value);
    if (!isNaN(num)) {
      maxSystolic = Math.max(maxSystolic, num);
      minSystolic = Math.min(minSystolic, num);
    }
  });
  
  diastolicPoints.forEach(value => {
    const num = Number(value);
    if (!isNaN(num)) {
      maxDiastolic = Math.max(maxDiastolic, num);
      minDiastolic = Math.min(minDiastolic, num);
    }
  });
  
  // 计算平均血压
  const avgSystolic = systolicPoints.length > 0 
    ? systolicPoints.reduce((sum, val) => sum + Number(val || 0), 0) / systolicPoints.length 
    : 0;
  const avgDiastolic = diastolicPoints.length > 0 
    ? diastolicPoints.reduce((sum, val) => sum + Number(val || 0), 0) / diastolicPoints.length 
    : 0;
  
  return {
    // 单点分析结果
    singleAnalyses: result.singleAnalyses || [],
    
    // 趋势分析
    trendAnalysis: result.trendAnalysis || {},
    
    // 总结信息 - 适配ModernHealthAlert的summary结构
    summary: {
      maxLevel: result.summary?.maxLevel || 0,
      severeCount: result.summary?.severeCount || 0,
      totalPoints: systolicPoints.length || 0,
      abnormalPercentage: result.summary?.abnormalPercentage || 0,
      avgSystolic: avgSystolic,
      avgDiastolic: avgDiastolic,
      average: (avgSystolic + avgDiastolic) / 2, // 平均压
      min: Math.min(minSystolic, minDiastolic),
      max: Math.max(maxSystolic, maxDiastolic),
      overallRisk: result.summary?.overallRisk || 'low'
    },
    
    // 建议
    recommendations: result.recommendations || [],
    
    // 其他数据，用于自定义显示
    systolicData: systolicPoints,
    diastolicData: diastolicPoints,
    timePoints: rawTimeData.value,
    
    // 血压特有字段
    bloodPressureAnalysis: {
      systolicRange: { min: minSystolic, max: maxSystolic },
      diastolicRange: { min: minDiastolic, max: maxDiastolic },
      pulsePressure: avgSystolic - avgDiastolic, // 脉压差
      meanArterialPressure: avgDiastolic + (avgSystolic - avgDiastolic) / 3 // 平均动脉压
    }
  };
});

// --- 时间格式化函数 ---
const formatRecordTime = (timeStr, viewType = 'day') => {
  if (!timeStr) return 'N/A';
  try {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid time string: ${timeStr}`);
      return timeStr;
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
    console.warn("PressureDataClear 组件已卸载，停止数据获取");
    return;
  }
  console.log("=== PressureDataClear 开始获取历史聚合数据 ===");
  
  isFetching = true;
  if (!user_id) {
    console.warn("用户ID无效，无法获取数据");
    resetData();
    isFetching = false;
    return;
  }
  
  const selection = calendarSelectionStore;
  const viewType = selection.currentViewType;
  let response = null;
  loading.value = true;
  error.value = false;
  
  try {
    let dateStr = '';
    if (selection.selectedDate) {
      dateStr = formatDate(selection.selectedDate);
      console.log('准备获取单日血压数据, dateStr:', dateStr);
      response = await getPreDataByDate(user_id, dateStr);
      console.log(`获取单日血压数据: ${dateStr}`, response);
    } else if (selection.selectedWeek) {
      const dateInWeekStr = formatDate(selection.selectedWeek.startDate);
      response = await getPreDataByWeek(user_id, dateInWeekStr);
      console.log(`获取周血压数据: ${dateInWeekStr}`, response);
    } else if (selection.selectedMonth) {
      response = await getPreDataByMonth(user_id, selection.selectedMonth.year, selection.selectedMonth.month);
      console.log(`获取月血压数据: ${selection.selectedMonth.year}-${selection.selectedMonth.month}`, response);
    } else if (selection.selectedYear) {
      response = await getPreDataByYear(user_id, selection.selectedYear);
      console.log(`获取年血压数据: ${selection.selectedYear}`, response);
    } else {
      console.log("当前无选中日期/周期");
      resetData();
      isFetching = false;
      return;
    }
    
    // 检查组件是否已卸载
    if (!isMounted) {
      console.warn("PressureDataClear 组件在数据获取期间已卸载");
      isFetching = false;
      return;
    }
    
    console.log('API响应状态:', response.status);
    console.log('API响应数据:', response.data);
    
    const apiResponse = response.data;
    let responseData = apiResponse.data;
    
    if (apiResponse && apiResponse.code === 200 && responseData) {
      // 确保responseData是数组
      if (!Array.isArray(responseData)) {
        responseData = [responseData];
      }
      
      console.log(`原始响应数据 (${viewType}视图):`, responseData);
      console.log(`数据长度: ${responseData ? responseData.length : 0}`);
      
      if (responseData.length > 0) {
        let processedSystolic = [];
        let processedDiastolic = [];
        let processedTimes = [];
        let rawTimes = [];
        
        if (viewType === 'day') {
          // 日视图: 按时间排序
          const sortedData = responseData.sort((a, b) => {
            return new Date(a.recordTime) - new Date(b.recordTime);
          });
          
          // 使用正确的字段名
          processedSystolic = sortedData.map(item => item.systolicBp || item.systolicBP || item.systolic || 0);
          processedDiastolic = sortedData.map(item => item.diastolicBp || item.diastolicBP || item.diastolic || 0);
          
          rawTimes = sortedData.map(item => item.recordTime);
          processedTimes = rawTimes.map(time => formatRecordTime(time, 'day'));
          
          console.log('日视图数据排序后:', {
            times: rawTimes,
            systolic: processedSystolic,
            diastolic: processedDiastolic
          });
        } else {
          // 周/月/年视图: 按日期排序
          const sortedData = responseData.sort((a, b) => {
            const dateA = a.date || a.weekStart || a.month || a.yearMonth;
            const dateB = b.date || b.weekStart || b.month || b.yearMonth;
            return new Date(dateA) - new Date(dateB);
          });
          
          processedSystolic = sortedData.map(item => {
            return item.avgSystolic || item.systolicBp || item.systolicBP || item.systolic || 0;
          });
          processedDiastolic = sortedData.map(item => {
            return item.avgDiastolic || item.diastolicBp || item.diastolicBP || item.diastolic || 0;
          });
          
          rawTimes = sortedData.map(item => item.date || item.weekStart || item.month || item.yearMonth);
          processedTimes = rawTimes.map(time => formatRecordTime(time, viewType));
          
          console.log(`${viewType}视图数据排序后:`, {
            times: rawTimes,
            systolic: processedSystolic,
            diastolic: processedDiastolic
          });
        }
        
        // 更新响应式变量 (用于图表)
        systolicData.value = processedSystolic;
        diastolicData.value = processedDiastolic;
        formattedTime.value = processedTimes;
        rawTimeData.value = rawTimes;
        
        console.log('处理后的数据详情:', {
          viewType,
          systolicDataLength: systolicData.value.length,
          diastolicDataLength: diastolicData.value.length,
          timeLength: formattedTime.value.length,
          systolicData: systolicData.value,
          diastolicData: diastolicData.value,
          formattedTime: formattedTime.value
        });
        
        // 更新图表
        updateChart();
        
        // 健康数据分析
        analyzeHealthData(processedSystolic, processedDiastolic, rawTimes);
      } else {
        console.warn("API返回的血压数据为空数组");
        resetData();
      }
    } else {
      console.warn("API返回的血压数据格式不正确或无数据", apiResponse);
      resetData();
    }
  } catch (err) {
    console.error("获取血压数据失败", err);
    error.value = true;
    resetData();
  } finally {
    loading.value = false;
    isFetching = false;
  }
  console.log("=== PressureDataClear 历史聚合数据获取完成 ===");
};

const resetData = () => {
  systolicData.value = [];
  diastolicData.value = [];
  formattedTime.value = [];
  rawTimeData.value = [];
  analysisResult.value = null;
  updateChart();
};

// --- 图表更新函数 ---
const updateChart = () => {
  console.log("=== PressureDataClear 开始更新图表 ===");
  console.log("组件挂载状态:", isMounted);
  console.log("图表实例存在:", !!myChart);
  console.log("DOM引用存在:", !!chart.value);
  
  if (!isMounted) {
    console.warn("PressureDataClear 组件已卸载，停止图表更新");
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
    // 检查数据是否有效
    if (systolicData.value.length === 0 || diastolicData.value.length === 0) {
      console.log("无数据可显示，显示空图表");
      myChart.setOption({
        title: {
          text: '暂无血压数据',
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
        series: []
      });
      return;
    }
    
    // 确保数据一致性
    const displaySystolic = systolicData.value.slice(0, Math.min(systolicData.value.length, formattedTime.value.length));
    const displayDiastolic = diastolicData.value.slice(0, Math.min(diastolicData.value.length, formattedTime.value.length));
    const displayTimes = formattedTime.value.slice(0, Math.min(systolicData.value.length, formattedTime.value.length));
    
    // 计算动态Y轴范围
    const maxSystolic = Math.max(...displaySystolic.filter(d => typeof d === 'number' && !isNaN(d)));
    const minDiastolic = Math.min(...displayDiastolic.filter(d => typeof d === 'number' && !isNaN(d)));
    
    // 设置Y轴范围，为血压值留出足够空间
    const yMax = Math.max(180, Math.ceil(maxSystolic * 1.1));
    const yMin = Math.min(40, Math.floor(minDiastolic * 0.9));
    
    // 获取当前选项并更新
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
      series: [
        {
          ...(currentOption.series?.[0] || {}),
          data: displaySystolic
        },
        {
          ...(currentOption.series?.[1] || {}),
          data: displayDiastolic
        }
      ]
    }, {
      notMerge: false,
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
    
    console.log("=== PressureDataClear 图表更新完成 ===");
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
    
    // 获取高压和低压值
    const systolicValue = params.find(p => p.seriesName === '高压')?.value || systolicData.value[index];
    const diastolicValue = params.find(p => p.seriesName === '低压')?.value || diastolicData.value[index];
    
    // 计算脉压差
    const pulsePressure = systolicValue - diastolicValue;
    
    // 添加健康分析信息
    let analysisInfo = '';
    if (analysisResult.value && analysisResult.value.singleAnalyses && analysisResult.value.singleAnalyses[index]) {
      const analysis = analysisResult.value.singleAnalyses[index];
      if (analysis && analysis.level > 0) {
        analysisInfo = `<div style="margin-top:4px; color:${analysis.color}">${analysis.message}</div>`;
      }
    }
    
    return `
      <div style="margin-bottom:5px; font-weight:bold;">${timeStr}</div>
      <div>${params[0].marker} 高压: <span style="font-weight:bold; color:${systolicColor}">${systolicValue} mmHg</span></div>
      <div>${params[1]?.marker || '●'} 低压: <span style="font-weight:bold; color:${diastolicColor}">${diastolicValue} mmHg</span></div>
      <div style="margin-top:3px; color:#666;">脉压差: <span style="font-weight:bold;">${pulsePressure.toFixed(1)} mmHg</span></div>
      ${analysisInfo}
    `;
  };
};

// --- 图表初始化 ---
const initChart = () => {
  if (!isMounted || !chart.value) {
    console.warn("PressureDataClear 组件未挂载或DOM不存在，无法初始化图表");
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
      color: [systolicColor, diastolicColor],
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
      legend: {
        data: ['高压', '低压'],
        top: 10,
        textStyle: {
          fontSize: 12
        }
      },
      grid: {
        top: '15%',
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
        name: '血压 (mmHg)',
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
      series: [
        {
          name: '高压',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: systolicData.value.length <= 30,
          itemStyle: {
            color: systolicColor,
            borderColor: '#fff',
            borderWidth: 2
          },
          lineStyle: {
            color: systolicColor,
            width: 2,
            shadowBlur: 5,
            shadowColor: 'rgba(255, 105, 35, 0.3)',
            shadowOffsetY: 2
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 105, 35, 0.2)' },
              { offset: 1, color: 'rgba(255, 105, 35, 0.05)' }
            ])
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              borderWidth: 3,
              shadowBlur: 8,
              shadowColor: systolicColor
            }
          },
          data: systolicData.value
        },
        {
          name: '低压',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: diastolicData.value.length <= 30,
          itemStyle: {
            color: diastolicColor,
            borderColor: '#fff',
            borderWidth: 2
          },
          lineStyle: {
            color: diastolicColor,
            width: 2,
            shadowBlur: 5,
            shadowColor: 'rgba(35, 157, 250, 0.3)',
            shadowOffsetY: 2
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(35, 157, 250, 0.2)' },
              { offset: 1, color: 'rgba(35, 157, 250, 0.05)' }
            ])
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              borderWidth: 3,
              shadowBlur: 8,
              shadowColor: diastolicColor
            }
          },
          data: diastolicData.value
        }
      ]
    };
    
    myChart.setOption(option);
    
    console.log("=== PressureDataClear 图表初始化成功 ===");
  } catch (error) {
    console.error("初始化图表失败:", error);
    chartInitialized = false;
  }
};

// --- 健康数据分析 ---
const analyzeHealthData = (systolicPoints, diastolicPoints, timePoints) => {
  if (!systolicPoints || systolicPoints.length === 0 || 
      !diastolicPoints || diastolicPoints.length === 0 || 
      systolicPoints.length !== diastolicPoints.length) {
    console.warn("血压数据无效，无法进行分析");
    analysisResult.value = null;
    return;
  }
  
  try {
    console.log('开始分析血压数据...');
    console.log('systolicPoints:', systolicPoints);
    console.log('diastolicPoints:', diastolicPoints);
    console.log('timePoints:', timePoints);
    
    // 根据healthAnalyzer代码，使用BloodPressureRules的analyzeComprehensive方法
    if (healthAnalyzer && healthAnalyzer.BloodPressureRules && 
        typeof healthAnalyzer.BloodPressureRules.analyzeComprehensive === 'function') {
      
      analysisResult.value = healthAnalyzer.BloodPressureRules.analyzeComprehensive(
        systolicPoints, 
        diastolicPoints, 
        timePoints
      );
      
      console.log('血压分析结果:', analysisResult.value);
      
    } else {
      console.error('BloodPressureRules或analyzeComprehensive方法不存在');
      
      // 如果没有健康分析模块，创建一个基本的分析结果
      const maxLevel = 0;
      const totalPoints = systolicPoints.length;
      const avgSystolic = systolicPoints.reduce((sum, val) => sum + Number(val || 0), 0) / totalPoints;
      const avgDiastolic = diastolicPoints.reduce((sum, val) => sum + Number(val || 0), 0) / totalPoints;
      
      // 创建基本分析结果
      const basicAnalyses = systolicPoints.map((systolic, index) => {
        const diastolic = diastolicPoints[index];
        let level = 0;
        let message = '正常';
        let color = '#52c41a';
        
        // 简单的血压分级
        if (systolic > 140 || diastolic > 90) {
          level = 3;
          message = '高血压';
          color = '#f5222d';
        } else if (systolic > 130 || diastolic > 85) {
          level = 2;
          message = '血压偏高';
          color = '#fa8c16';
        } else if (systolic > 120 || diastolic > 80) {
          level = 1;
          message = '正常高值';
          color = '#faad14';
        } else if (systolic < 90 || diastolic < 60) {
          level = 1;
          message = '血压偏低';
          color = '#faad14';
        }
        
        return {
          systolic,
          diastolic,
          value: systolic, // 为了兼容性
          timestamp: timePoints[index],
          level,
          message,
          color
        };
      });
      
      analysisResult.value = {
        singleAnalyses: basicAnalyses,
        trendAnalysis: { trend: '稳定' },
        summary: {
          maxLevel,
          severeCount: basicAnalyses.filter(a => a.level >= 2).length,
          totalPoints,
          abnormalPercentage: (basicAnalyses.filter(a => a.level >= 2).length / totalPoints * 100).toFixed(1),
          avgSystolic,
          avgDiastolic,
          average: (avgSystolic + avgDiastolic) / 2,
          overallRisk: maxLevel >= 2 ? 'medium' : 'low'
        },
        recommendations: [
          {
            type: maxLevel >= 2 ? 'check' : 'maintain',
            message: maxLevel >= 2 ? '发现血压异常，请关注' : '血压正常，继续保持'
          }
        ]
      };
    }
  } catch (error) {
    console.error('血压分析失败:', error);
    console.error('错误详情:', error.message);
    
    // 分析失败时创建一个空的分析结果
    analysisResult.value = null;
  }
};

// 处理导出数据
const handleExportData = () => {
  if (!analysisResult.value) return;
  
  try {
    // 创建CSV内容
    const headers = ['时间', '高压(mmHg)', '低压(mmHg)', '脉压差', '状态', '建议'];
    const rows = systolicData.value.map((systolic, index) => {
      const diastolic = diastolicData.value[index] || 0;
      const time = rawTimeData.value[index] || formattedTime.value[index] || '';
      const pulsePressure = systolic - diastolic;
      
      let status = '正常';
      let suggestion = '';
      
      // 尝试从分析结果中获取状态和建议
      if (analysisResult.value && analysisResult.value.singleAnalyses && 
          analysisResult.value.singleAnalyses[index]) {
        const analysis = analysisResult.value.singleAnalyses[index];
        status = analysis.message || '正常';
        suggestion = analysis.suggestion || '';
      }
      
      return [
        time ? new Date(time).toLocaleString('zh-CN') : 'N/A',
        systolic,
        diastolic,
        pulsePressure.toFixed(1),
        status,
        suggestion
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');
    
    // 创建并下载文件
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `血压数据_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('导出数据失败:', error);
    alert('导出数据失败，请稍后再试');
  }
};

// --- 新增：获取实时血压数据 (WebSocket) ---
let wsConnectionId = null;

const fetchRealTimeData = async () => {
  if (!isMounted || !user_id) return;

  console.log("=== PressureDataClear 开始订阅实时血压数据 ===");
  try {
    const realTimeData = await getPreData(user_id);
    console.log("收到实时血压数据:", realTimeData);

    // 假设 realTimeData 是一个数组，包含最新记录
    if (realTimeData && Array.isArray(realTimeData) && realTimeData.length > 0) {
      const latestRecord = realTimeData[0]; // 获取最新的一条记录
      // 根据您的API返回格式调整字段名，例如 systolicBp, diastolicBp
      latestSystolic.value = latestRecord.systolicBp || latestRecord.systolic || 0;
      latestDiastolic.value = latestRecord.diastolicBp || latestRecord.diastolic || 0;
      
      console.log(`更新实时血压值: 高压=${latestSystolic.value}, 低压=${latestDiastolic.value}`);
    }
  } catch (error) {
    console.error("获取实时血压数据失败:", error);
    // 可以考虑设置一个默认值或显示错误状态
    // latestSystolic.value = 0;
    // latestDiastolic.value = 0;
  }
};

// --- 防抖逻辑 ---
let fetchTimeout = null;
const debouncedFetchData = () => {
  if (fetchTimeout) {
    clearTimeout(fetchTimeout);
  }
  
  if (isFetching) {
    console.log("血压数据获取中，跳过重复请求");
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
    console.log("PressureDataClear: CalendarSelectionStore 状态变化", {
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
  console.log("=== PressureDataClear.vue 组件开始挂载 ===");
  isMounted = true;
  
  // 1. 初始化图表
  nextTick(() => {
    if (isMounted && chart.value) {
      initChart();
      
      // 2. 获取历史聚合数据用于图表
      setTimeout(() => {
        if (isMounted) {
          fetchAggregatedData();
        }
      }, 300); // 延迟一点，确保图表初始化完成
    }
  });

  // 3. 获取实时数据用于顶部显示 (关键：在挂载时调用一次)
  fetchRealTimeData(); 

  // 4. 添加resize监听
  const handleResize = () => {
    if (myChart && isMounted) {
      try {
        myChart.resize();
      } catch (error) {
        console.warn("调整血压图表大小时出错:", error);
      }
    }
  };
  
  window.addEventListener('resize', handleResize);
  window.__pressureChartResizeHandler = handleResize;
});

onUnmounted(() => {
  console.log("=== PressureDataClear.vue 组件开始卸载 ===");
  isMounted = false;
  isFetching = false;
  chartInitialized = false;
  
  if (fetchTimeout) {
    clearTimeout(fetchTimeout);
    fetchTimeout = null;
  }
  
  // 清理resize监听
  if (window.__pressureChartResizeHandler) {
    window.removeEventListener('resize', window.__pressureChartResizeHandler);
    delete window.__pressureChartResizeHandler;
  }
  
  // 清理图表实例
  if (myChart) {
    try {
      myChart.dispose();
      myChart = null;
      console.log("血压图表实例已清理");
    } catch (error) {
      console.warn("清理血压图表实例时出错:", error);
    }
  }
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
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.title {
  font-size: 0.18rem;
  font-family: 'PuHuiTi';
  color: #333;
  margin: 0 10px;
  white-space: nowrap;
}

.data {
  font-size: 0.14rem;
  font-weight: bold;
}

.dataBox {
  background-color: #fff;
  border-radius: 0.05rem;
  width: 25%;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 5px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 5px;
}

.unit {
  font-size: 0.08rem;
  font-family: 'PuHuiTi';
  color: #8E9AAB;
  margin-top: 2px;
}

.class {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.classTitle {
  font-size: 0.1rem;
  font-family: 'PuHuiTi';
  margin-bottom: 3px;
  font-weight: bold;
}

.loading,
.error {
  width: 100%;
  height: calc(100% - 70px);
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

/* 图表区域 */
.chart-container > div:last-child {
  flex: 1;
  height: calc(100% - 70px);
}
</style>