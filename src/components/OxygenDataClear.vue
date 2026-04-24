<template>
  <div class="chart-container">
    <div class="nowData">
        <span class="title">血氧浓度</span>
        <div class="dataBox">
            <span class="data">{{ latestData }}&nbsp;</span>
            <span class="unit">%</span>
        </div>
    </div>
    <div ref="chart" style="width: 100%; flex: 1; min-height: 0;">
        <div v-if="loading" class="loading-overlay">加载中...</div>
        <div v-else-if="error" class="error-overlay">数据加载失败</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'; 
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent,
    DataZoomComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import useUserInfoStore from '../stores/user'; 
import { useCalendarSelectionStore } from '../stores/calendarSelection'; 
import { storeToRefs } from 'pinia';
import dateFormatter from '../utils/dateFormatter';

import { 
    getOxygenDataByDate,
    getOxygenDataByWeek,
    getOxygenDataByMonth,
    getOxygenDataByYear
} from '../api/healthData';

echarts.use([
    LineChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent,
    DataZoomComponent,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
]);

const userInfoStore = storeToRefs(useUserInfoStore());
const user_id = userInfoStore.user_id.value;
const calendarSelectionStore = useCalendarSelectionStore();

const nowData = ref(0);
const latestData = ref(0);
const data = ref([]);
const formattedTime = ref([]);
const chart = ref(null);
let myChart = null;
let isMountedFlag = false;
let chartInitialized = false;
const loading = ref(false);
const error = ref(false);
let isFetching = false;

let fetchTimeout = null;
let mountTimeout1 = null;
let mountTimeout2 = null;

const color = ['rgba(0, 190, 250)', 'rgba(0,61,150)', 'rgba(0,0,225)'];

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
    } catch (e) {
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
        return;
    }
    
    isFetching = true;
    
    if (!user_id) {
        if (isMountedFlag) {
            data.value = [];
            formattedTime.value = [];
            nowData.value = 0;
            updateChartWithAnimation();
        }
        isFetching = false;
        return;
    }
    
    const selection = calendarSelectionStore;
    const viewType = selection.currentViewType;

    if (!myChart || !chartInitialized) {
        if (chart.value) {
            initChart();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    let response = null;
    if (isMountedFlag) {
        loading.value = true;
        error.value = false;
    }
    
    try {
        if (viewType === 'day' && selection.selectedDate) {
            const dateStr = formatDate(selection.selectedDate);
            response = await getOxygenDataByDate(user_id, dateStr);
        } else if (selection.selectedWeek) {
            const dateInWeekStr = formatDate(selection.selectedWeek.startDate);
            response = await getOxygenDataByWeek(user_id, dateInWeekStr);
        } else if (selection.selectedMonth) {
            response = await getOxygenDataByMonth(user_id, selection.selectedMonth.year, selection.selectedMonth.month);
        } else if (selection.selectedYear) {
            response = await getOxygenDataByYear(user_id, selection.selectedYear);
        } else {
            resetData();
            isFetching = false;
            return;
        }

        if (!isMountedFlag) {
            isFetching = false;
            return;
        }

        const apiResponse = response.data;
        const responseData = apiResponse.data;

        if (apiResponse && apiResponse.code === 200 && Array.isArray(responseData) && responseData.length > 0) {
            const isRawFormat = responseData[0].oxygenData !== undefined;
            
            let processedData, rawTimes;
            
            if (isRawFormat) {
                const sortedData = [...responseData].sort((a, b) => 
                    new Date(a.recordTime) - new Date(b.recordTime)
                );
                processedData = sortedData.map(item => item.oxygenData);
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
                    return dateA - dateB;
                });
                processedData = sortedData.map(item => item.avgOxygen || item.avgValue);
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
                nowData.value = processedData[processedData.length - 1];
            }

            updateChartWithAnimation();
        } else {
            resetData();
        }
    } catch (err) {
        if (isMountedFlag) {
            error.value = true;
        }
        resetData();
    } finally {
        if (isMountedFlag) {
            loading.value = false;
        }
        isFetching = false;
    }
};

const fetchLatestData = async () => {
    if (!user_id || !isMountedFlag) {
        console.warn("用户ID无效或组件已卸载，无法获取最新血氧数据");
        latestData.value = 0;
        return;
    }
    
    try {
        const today = new Date();
        const todayStr = formatDate(today);
        
        const response = await getOxygenDataByDate(user_id, todayStr);
        
        if (!isMountedFlag) return;
        
        const apiResponse = response.data;
        const responseData = apiResponse.data;
        
        if (apiResponse && apiResponse.code === 200 && Array.isArray(responseData) && responseData.length > 0) {
            const sortedData = [...responseData].sort((a, b) => 
                new Date(b.recordTime) - new Date(a.recordTime)
            );
            latestData.value = sortedData[0].oxygenData || 0;
        } else {
            latestData.value = 0;
        }
    } catch (err) {
        console.error("获取最新血氧数据失败", err);
        if (isMountedFlag) {
            latestData.value = 0;
        }
    }
};

const resetData = () => {
    if (!isMountedFlag) return;
    data.value = [];
    formattedTime.value = [];
    nowData.value = 0;
    updateChartWithAnimation();
};

const updateChartWithAnimation = () => {
    if (!isMountedFlag) {
        return;
    }
    if (!myChart || !chart.value) {
        setTimeout(() => {
            if (isMountedFlag && chart.value) {
                initChart();
                setTimeout(() => {
                    if (myChart && isMountedFlag) {
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
    if (!myChart || !chart.value || !isMountedFlag) {
        return;
    }
    if (!document.body.contains(chart.value)) {
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
        const yMax = Math.max(100, Math.ceil(maxVal * 1.05));

        const totalPoints = displayData.length;
        let zoomStart = 0;
        let zoomEnd = 100;
        if (totalPoints > 15) {
            zoomEnd = 100;
            zoomStart = ((totalPoints - 15) / totalPoints) * 100;
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
                data: displayTimes
            },
            yAxis: {
                ...(currentOption.yAxis?.[0] || {}),
                show: true,
                max: yMax
            },
            dataZoom: [
                { type: 'inside', start: zoomStart, end: zoomEnd, zoomLock: false }
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
                } catch (e) {}
            }
        }, 50);
    } catch (e) {
        if (isMountedFlag) {
            setTimeout(() => {
                initChart();
            }, 200);
        }
    }
};

const initChart = () => {
    if (!isMountedFlag || !chart.value) {
        return;
    }
    if (myChart && chartInitialized) {
        try {
            myChart.dispose();
        } catch (e) {}
    }
    try {
        myChart = echarts.init(chart.value);
        chartInitialized = true;

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
                formatter: function (params) {
                    if (!params || params.length === 0) return '';
                    const index = params[0].dataIndex;
                    const timeStr = formattedTime.value[index] || '';
                    const value = params[0].value;
                    return `
                        <div style="margin-bottom:5px; font-weight:bold;">${timeStr}</div>
                        <div>${params[0].marker} 血氧: <span style="font-weight:bold; color:${color[0]}">${value} %</span></div>
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
                offset: 20,
                boundaryGap: false,
                axisLine: {
                    lineStyle: {
                        color: 'black'
                    }
                },
                axisLabel: {
                    color: '#666',
                    fontSize: 16,
                    formatter: function (params) {
                        return params.split(' ')[0];
                    }
                },
                data: formattedTime.value
            },
            yAxis: {
                name: '浓度',
                type: 'value',
                min: 80,
                max: 100,
                nameTextStyle: { color: '#666', fontSize: 18, padding: [0, 0, 5, 0] },
                axisLabel: {
                    formatter: '{value}',
                    color: 'black',
                    fontSize: 16
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#CCCCCC',
                        type: 'dashed'
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: 'black'
                    }
                }
            },
            dataZoom: [{
                type: 'inside',
                start: 0,
                end: 100,
                zoomLock: false
            }],
            series: [{
                name: '浓度',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: {
                    color: color[0]
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            { offset: 0, color: 'rgba(0, 190, 250, 0.8)' },
                            { offset: 1, color: 'rgba(0, 190, 250, 0.1)' }
                        ]
                    ),
                },
                lineStyle: {
                    width: 2,
                    shadowBlur: 5,
                    shadowColor: 'rgba(0, 190, 250, 0.3)',
                    shadowOffsetY: 5
                },
                emphasis: {
                    focus: 'series',
                    itemStyle: {
                        borderWidth: 2,
                        borderColor: '#fff',
                        shadowBlur: 10,
                        shadowColor: color[0]
                    }
                },
                data: data.value
            }]
        };

        myChart.setOption(option);
    } catch (e) {
        chartInitialized = false;
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
                console.log("OxygenDataClear: setTimeout 回调执行时组件已卸载，跳过");
                return;
            }
            data.value = [];
            formattedTime.value = [];
            fetchAggregatedData();
        }, 150);
    },
    { deep: true }
);

onMounted(async () => {
    isMountedFlag = true;
    fetchLatestData();
    await nextTick();
    if (!isMountedFlag || !chart.value) {
        return;
    }
    mountTimeout1 = setTimeout(() => {
        if (isMountedFlag && chart.value) {
            initChart();
            mountTimeout2 = setTimeout(() => {
                if (isMountedFlag) {
                    fetchAggregatedData();
                }
            }, 200);
        }
    }, 50);

    const handleResize = () => {
        if (myChart && isMountedFlag) {
            try { myChart.resize(); } catch (e) {}
        }
    };
    window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
    console.log("=== OxygenDataClear.vue 组件开始卸载 ===");
    isMountedFlag = false;
    chartInitialized = false;
    isFetching = false;
    
    if (stopCalendarWatch) {
        stopCalendarWatch();
        console.log("OxygenDataClear: 已停止日历监听器");
    }
    
    if (fetchTimeout) {
        clearTimeout(fetchTimeout);
        fetchTimeout = null;
    }
    if (mountTimeout1) {
        clearTimeout(mountTimeout1);
        mountTimeout1 = null;
    }
    if (mountTimeout2) {
        clearTimeout(mountTimeout2);
        mountTimeout2 = null;
    }
    
    if (myChart) {
        try {
            myChart.dispose();
            myChart = null;
        } catch (e) {
            console.warn("销毁图表实例时出错:", e);
        }
    }
    console.log("=== OxygenDataClear.vue 组件卸载完成 ===");
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
    width: 11%;
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
