<template>
  <div class="cyber-chart-wrapper" ref="wrapperRef">
    <div class="hud-corner top-left"></div>
    <div class="hud-corner top-right"></div>
    <div class="hud-corner bottom-left"></div>
    <div class="hud-corner bottom-right"></div>

    <div class="radar-scanline"></div>

    <div ref="chartRef" class="chart-dom"></div>

    <div v-if="warning && warning.level >= 2" class="critical-overlay">
      <span>CRITICAL // SLEEP DEPRIVATION</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, shallowRef } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  // 预期传入历史睡眠分钟数数组，例如 [420, 380, 480...]
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  warning: {
    type: Object,
    default: () => ({ level: 0 })
  }
});

const chartRef = ref(null);
const wrapperRef = ref(null);
const chartInstance = shallowRef(null);
let resizeObserver = null;

// 处理 7 天趋势数据：将分钟转换为小时，并补齐 7 天
const getTrendData = (inputData) => {
  const targetLength = 7;
  let rawData = [];

  if (Array.isArray(inputData) && inputData.length > 0) {
    rawData = inputData.map(val => Number((val / 60).toFixed(2))); // 分钟转小时
    if (rawData.length >= targetLength) return rawData.slice(-targetLength);
  }

  // 如果数据不足 7 天，根据现有数据基准倒推虚拟占位数据
  const baseVal = rawData.length > 0 ? rawData[0] : 7.5;
  const mockLength = targetLength - rawData.length;
  const mockTrend = [];

  for (let i = 0; i < mockLength; i++) {
    // 制造 ±1.5 小时的随机波动
    let noise = (Math.random() * 3) - 1.5;
    let val = Math.max(3.0, Math.min(12.0, baseVal + noise));
    mockTrend.push(Number(val.toFixed(2)));
  }

  return [...mockTrend, ...rawData];
};

// 格式化小时数为 Hh Mm 格式 (用于 Tooltip)
const formatTime = (hoursDecimal) => {
  const h = Math.floor(hoursDecimal);
  const m = Math.round((hoursDecimal - h) * 60);
  return `${h}h ${m}m`;
};

// 初始化 ECharts (休眠重载矩阵)
const initChart = () => {
  if (!chartRef.value) return;

  chartInstance.value = echarts.init(chartRef.value);
  const trendData = getTrendData(props.data);

  const option = {
    // 战术网格布局
    grid: {
      top: 30,
      right: 15,
      bottom: 25,
      left: 35,
      containLabel: false
    },
    // 硬核解析面板提示框
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: props.warning.level >= 2 ? '#ff003c' : '#a29bfe',
      borderWidth: 1,
      padding: [10, 14],
      axisPointer: {
        type: 'shadow',
        shadowStyle: { color: 'rgba(162, 155, 254, 0.05)' }
      },
      formatter: (params) => {
        const val = params[0].value;
        const formattedTime = formatTime(val);
        const valColor = val < 6 ? '#ff003c' : (val >= 7 && val <= 9 ? '#38ef7d' : '#a29bfe');
        let status = val < 6 ? 'CRITICAL DEPLETION' : (val >= 7 && val <= 9 ? 'OPTIMAL RECOVERY' : 'ACCEPTABLE');

        return `
          <div style="color: #6c5ce7; margin-bottom: 4px; border-bottom: 1px solid rgba(162,155,254,0.3); padding-bottom: 4px; font-family: 'Courier New', monospace; font-weight: 900; letter-spacing: 1px;">
            SYS.REBOOT_LOG <span style="float:right; font-size:10px; color:${valColor};">${status}</span>
          </div>
          <div style="margin-top: 6px;">
            <span style="color:#8b9bb4; font-size: 10px;">UPTIME SUSPENDED: </span>
            <span style="color:${valColor}; font-size: 16px; font-weight:bold; font-family: 'Courier New', monospace;">${formattedTime}</span>
          </div>
        `;
      }
    },
    xAxis: {
      type: 'category',
      // X轴代表过去 7 天
      data: trendData.map((_, i) => `D-${trendData.length - 1 - i}`),
      axisLine: {
        lineStyle: { color: 'rgba(162, 155, 254, 0.3)', width: 2 }
      },
      axisTick: { show: false },
      axisLabel: {
        color: '#8b9bb4',
        fontFamily: '"Courier New", monospace',
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 12, // 睡眠图表最大刻度设为 12 小时
      splitLine: {
        lineStyle: {
          color: 'rgba(162, 155, 254, 0.1)',
          type: [4, 8],
          dashOffset: 5
        }
      },
      axisLabel: {
        color: '#a29bfe',
        fontFamily: '"Courier New", monospace',
        fontSize: 10,
        formatter: '{value} h'
      }
    },
    series: [
      // 1. 全息能量柱 (Energy Cell Array)
      {
        name: 'Reboot Duration',
        type: 'bar',
        data: trendData,
        barWidth: 14,
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(162, 155, 254, 0.05)',
          borderRadius: [4, 4, 0, 0]
        },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#b28dff' },
            { offset: 0.5, color: '#6c5ce7' },
            { offset: 1, color: 'rgba(108, 92, 231, 0.1)' }
          ]),
          borderRadius: [4, 4, 0, 0],
          shadowColor: '#6c5ce7',
          shadowBlur: 10
        },
        // 核心亮点：标定最佳恢复区 (7-9小时) 和 剥夺红线 (6小时)
        markArea: {
          silent: true,
          itemStyle: {
            color: 'rgba(56, 239, 125, 0.05)', // 微弱的治愈绿底色
            borderWidth: 1,
            borderColor: 'rgba(56, 239, 125, 0.2)',
            borderType: 'dashed'
          },
          data: [
            [
              { yAxis: 7, name: 'OPTIMAL ZONE', label: { position: 'insideTopLeft', color: 'rgba(56,239,125,0.5)', fontSize: 9 } },
              { yAxis: 9 }
            ]
          ]
        },
        markLine: {
          silent: true,
          symbol: ['none', 'none'],
          label: { show: false },
          lineStyle: { color: 'rgba(255, 0, 60, 0.5)', type: 'dashed', width: 1 },
          data: [
            { yAxis: 6, name: 'CRITICAL THRESHOLD' }
          ]
        },
        animationDuration: 1500,
        animationEasing: 'cubicOut'
      },
      // 2. 能量封顶节点 (发光的柱子顶部)
      {
        type: 'scatter',
        data: trendData,
        symbol: 'rect',
        symbolSize: [14, 3],
        symbolOffset: [0, -2],
        itemStyle: {
          color: '#ffffff',
          shadowColor: '#b28dff',
          shadowBlur: 8
        },
        z: 3
      },
      // 3. 重载效能趋势线 (贯穿柱状图的流线)
      {
        type: 'line',
        data: trendData,
        smooth: 0.4,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: 'rgba(162, 155, 254, 0.4)',
          type: 'dashed' // 虚线趋势，不喧宾夺主
        },
        z: 4
      }
    ]
  };

  chartInstance.value.setOption(option);
};

// 监听数据更新图表
watch(() => props.data, (newData) => {
  if (chartInstance.value) {
    const trendData = getTrendData(newData);
    chartInstance.value.setOption({
      xAxis: {
        data: trendData.map((_, i) => `D-${trendData.length - 1 - i}`)
      },
      series: [
        { data: trendData },
        { data: trendData },
        { data: trendData }
      ]
    });
  }
}, { deep: true });

onMounted(() => {
  initChart();

  // ResizeObserver 防折叠变形黑科技
  if (wrapperRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if (chartInstance.value) chartInstance.value.resize();
    });
    resizeObserver.observe(wrapperRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver && wrapperRef.value) {
    resizeObserver.unobserve(wrapperRef.value);
  }
  if (chartInstance.value) chartInstance.value.dispose();
});
</script>

<style scoped>
/* 外部战术容器，统一高度为 200px */
.cyber-chart-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  background: #fffbf5;
  border: 1px solid #e5e0d8;
  border-radius: 8px;
  overflow: hidden;
}

.chart-dom {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
}

/* =========================================
   战术瞄准角标 (霓虹紫)
   ========================================= */
.hud-corner {
  position: absolute;
  width: 15px;
  height: 15px;
  border: 2px solid #a29bfe;
  z-index: 3;
  pointer-events: none;
  opacity: 0.7;
}

.hud-corner.top-left { top: -1px; left: -1px; border-right: none; border-bottom: none; }
.hud-corner.top-right { top: -1px; right: -1px; border-left: none; border-bottom: none; }
.hud-corner.bottom-left { bottom: -1px; left: -1px; border-right: none; border-top: none; }
.hud-corner.bottom-right { bottom: -1px; right: -1px; border-left: none; border-top: none; }

/* =========================================
   全息雷达扫描线动画 (紫色系)
   ========================================= */
.radar-scanline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(162, 155, 254, 0) 0%,
    rgba(162, 155, 254, 0.05) 50%,
    rgba(108, 92, 231, 0.2) 100%
  );
  z-index: 1;
  pointer-events: none;
  border-bottom: 1px solid rgba(162, 155, 254, 0.5);
  animation: radar-sweep 4s linear infinite;
  opacity: 0.5;
}

@keyframes radar-sweep {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

/* =========================================
   数据异常警报蒙版 (严重缺觉时触发)
   ========================================= */
.critical-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 0, 60, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
  pointer-events: none;
  animation: alert-flash 1s steps(2, start) infinite;
}

.critical-overlay span {
  font-family: '"Courier New", Courier, monospace';
  font-size: 14px;
  font-weight: 900;
  color: #ff003c;
  letter-spacing: 2px;
  text-shadow: 0 0 10px #ff003c;
  border: 1px solid #ff003c;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.5);
}

@keyframes alert-flash {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}
</style>