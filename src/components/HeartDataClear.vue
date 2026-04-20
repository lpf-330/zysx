<template>
  <div class="chart-container">
    <div class="nowData">
      <span class="title">当前心率</span>
      <div class="dataBox">
        <span class="data">{{ nowData }}</span>
        <span class="unit">bpm</span>
      </div>
    </div>
    <div ref="chart" style="width: 100%; height: 100%;"></div>
    <ModernHealthAlert
      v-if="analysisResult && isMountedFlag"
      :analysis-result="analysisResult"
      data-type="heart"
      position="top-right"
      @export-data="handleExportData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
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

const updateChartWithAnimation = () => {
    if (!isMountedFlag || !myChart) return;
    try {
        if (data.value.length === 0) {
            myChart.setOption({
                title: { text: '等待数据...', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } },
                xAxis: { show: false, data: [] },
                yAxis: { show: false },
                series: [{ data: [] }]
            });
            return;
        }

        const displayData = data.value;
        const displayTimes = formattedTime.value;
        const maxVal = Math.max(...displayData);
        const minVal = Math.min(...displayData);
        const yMax = Math.max(120, Math.ceil(maxVal * 1.15));
        const yMin = Math.min(40, Math.floor(minVal * 0.85));

        const totalPoints = displayData.length;
        let zoomStart = 0;
        let zoomEnd = 100;
        if (totalPoints > MAX_DISPLAY) {
            zoomEnd = 100;
            zoomStart = ((totalPoints - MAX_DISPLAY) / totalPoints) * 100;
        }

        myChart.setOption({
            animation: true,
            animationDuration: 500,
            animationEasing: 'cubicOut',
            xAxis: { data: displayTimes },
            yAxis: { min: yMin, max: yMax },
            dataZoom: [
                { type: 'inside', start: zoomStart, end: zoomEnd, zoomLock: false },
                { type: 'slider', show: true, bottom: 10, start: zoomStart, end: zoomEnd, height: 20, borderColor: '#ddd' }
            ],
            series: [{ data: displayData }]
        }, { notMerge: false, lazyUpdate: true });
    } catch (e) {
        console.error('更新图表动画失败:', e);
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
    if (!isMountedFlag || !chart.value) return;
    if (myChart && chartInitialized) {
        try { myChart.dispose(); } catch (e) {}
    }
    try {
        myChart = echarts.init(chart.value);
        chartInitialized = true;
        const option = {
            color,
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
                    formatter: function(value, index) {
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
    link.download = `心率数据_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
};

onMounted(() => {
    isMountedFlag = true;
    setTimeout(() => {
        if (isMountedFlag && chart.value) {
            initChart();
            setTimeout(() => {
                if (isMountedFlag) {
                    startSimulation();
                }
            }, 300);
        }
    }, 100);

    const handleResize = () => {
        if (myChart && isMountedFlag) {
            try { myChart.resize(); } catch (e) {}
        }
    };
    window.addEventListener('resize', handleResize);
    window.__heartChartResizeHandler = handleResize;
});

onUnmounted(() => {
    isMountedFlag = false;
    chartInitialized = false;
    stopSimulation();
    if (window.__heartChartResizeHandler) {
        window.removeEventListener('resize', window.__heartChartResizeHandler);
        delete window.__heartChartResizeHandler;
    }
    if (myChart) {
        try {
            myChart.dispose();
            myChart = null;
        } catch (e) {}
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
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
