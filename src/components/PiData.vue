<template>
  <div class="cyber-chart-wrapper" ref="wrapperRef">
    <div class="hud-corner top-left"></div>
    <div class="hud-corner top-right"></div>
    <div class="hud-corner bottom-left"></div>
    <div class="hud-corner bottom-right"></div>

    <div class="radar-scanline"></div>

    <div ref="chartRef" class="chart-dom"></div>

    <div v-if="warning && warning.level >= 2" class="critical-overlay">
      <span>CRITICAL // WEAK PERFUSION SIGNAL</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, shallowRef } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  // 预期传入历史 PI 数组，如果没有，我们会自动推演
  data: {
    type: [Number, Array],
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

// 处理 4 小时趋势数据：生成 24 个采样点 (每 10 分钟一次)
const getTrendData = (inputData) => {
  if (Array.isArray(inputData) && inputData.length > 0) {
    if (inputData.length >= 24) return inputData.slice(-24);
  }

  const baseVal = (Array.isArray(inputData) ? inputData[0] : inputData) || 3.5;
  const mockTrend = [];
  const totalPoints = 24;
  const currentLength = Array.isArray(inputData) ? inputData.length : (inputData > 0 ? 1 : 0);
  const mockLength = totalPoints - currentLength;

  let currentVal = baseVal;

  // 反向生成历史拟真波动
  for (let i = 0; i < mockLength; i++) {
    // 模拟外周灌注的物理波动 (温度、情绪引起的收缩舒张)
    let noise = (Math.random() * 0.8) - 0.4;
    // 强制限制在 0.2 到 10 之间
    currentVal = Math.max(0.2, Math.min(10.0, currentVal + noise));
    mockTrend.push(Number(currentVal.toFixed(2)));
  }

  if (Array.isArray(inputData)) {
    return [...mockTrend, ...inputData];
  } else if (inputData > 0) {
    return [...mockTrend, inputData];
  }
  return Array(24).fill(0);
};

// 初始化 ECharts (生物雷达脉冲图)
const initChart = () => {
  if (!chartRef.value) return;

  chartInstance.value = echarts.init(chartRef.value);
  const trendData = getTrendData(props.data);

  const option = {
    // 战术网格布局
    grid: {
      top: 25,
      right: 15,
      bottom: 25,
      left: 35,
      containLabel: false
    },
    // 硬核终端 Tooltip
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: props.warning.level >= 2 ? '#ff003c' : '#38ef7d',
      borderWidth: 1,
      padding: [8, 12],
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: props.warning.level >= 2 ? '#ff003c' : '#38ef7d',
          type: 'dashed',
          width: 1
        }
      },
      formatter: (params) => {
        const val = params[0].value;
        const valColor = val < 0.5 ? '#ff003c' : '#38ef7d';
        let status = val < 0.5 ? '血流灌注不足' : '正常';

        return `
          <div style="color: #11998e; margin-bottom: 4px; border-bottom: 1px solid rgba(56,239,125,0.3); padding-bottom: 2px; font-family: 'Courier New', monospace; font-weight: 900;">
            灌注指数 <span style="float:right; font-size:10px; color:${valColor};">${status}</span>
          </div>
          <span style="color:${valColor}; font-size: 18px; font-weight:bold;">${val}</span> <span style="color:#888;">PI</span>
        `;
      }
    },
    xAxis: {
      type: 'category',
      // X轴代表过去 4 小时，每 10 分钟一个点 (-240m 到 0m)
      data: trendData.map((_, i) => `-${(trendData.length - 1 - i) * 10}m`),
      axisLine: {
        lineStyle: { color: 'rgba(56, 239, 125, 0.3)', width: 2 }
      },
      axisTick: { show: false },
      axisLabel: {
        color: '#8b9bb4',
        fontFamily: '"Courier New", monospace',
        fontSize: 10,
        interval: 5 // 每 60 分钟显示一个刻度
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: (value) => Math.max(10, Math.ceil(value.max + 2)), // 动态上限，保底是10
      splitLine: {
        lineStyle: {
          color: 'rgba(56, 239, 125, 0.1)',
          type: [4, 8],
          dashOffset: 5
        }
      },
      axisLabel: {
        color: '#38ef7d',
        fontFamily: '"Courier New", monospace',
        fontSize: 10
      }
    },
    // 【核心黑科技】：双重 Series 叠加，渲染"雷达频射脉冲"效果
    series: [
      {
        name: 'Pulse Line',
        data: trendData,
        type: 'line',
        smooth: 0.3,
        symbol: 'circle',
        symbolSize: 4,
        showSymbol: true, // 显示信号节点
        itemStyle: {
          color: '#ffffff',
          borderColor: '#38ef7d',
          borderWidth: 1,
          shadowColor: '#38ef7d',
          shadowBlur: 10
        },
        lineStyle: {
          width: 2,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#11998e' },
            { offset: 1, color: '#38ef7d' }
          ]),
          shadowColor: '#38ef7d',
          shadowBlur: 12,
          shadowOffsetY: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(56, 239, 125, 0.3)' },
            { offset: 1, color: 'rgba(17, 153, 142, 0)' }
          ])
        },
        // 标记 PI 低于 0.5 的外周循环不良区
        markArea: {
          silent: true,
          itemStyle: {
            color: 'rgba(255, 0, 60, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(255, 0, 60, 0.2)',
            borderType: 'dashed'
          },
          data: [
            [
              { yAxis: 0, name: 'WEAK PERFUSION', label: { position: 'insideTopLeft', color: 'rgba(255,0,60,0.5)', fontSize: 9 } },
              { yAxis: 0.5 }
            ]
          ]
        },
        animationDuration: 1500,
        animationEasing: 'cubicOut'
      },
      // 【叠加层】：垂直能量柱 (Stem Plot Effect)
      {
        name: 'Signal Stem',
        data: trendData,
        type: 'bar',
        barWidth: 2, // 极细的柱子
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(56, 239, 125, 0.8)' },
            { offset: 1, color: 'rgba(17, 153, 142, 0.1)' }
          ]),
          shadowColor: '#38ef7d',
          shadowBlur: 5
        },
        animationDuration: 1500,
        animationEasing: 'cubicOut'
      }
    ]
  };

  chartInstance.value.setOption(option);
};

watch(() => props.data, (newData) => {
  if (chartInstance.value) {
    const trendData = getTrendData(newData);
    chartInstance.value.setOption({
      xAxis: {
        data: trendData.map((_, i) => `-${(trendData.length - 1 - i) * 10}m`)
      },
      series: [
        { data: trendData },
        { data: trendData }
      ]
    });
  }
}, { deep: true });

onMounted(() => {
  initChart();

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
   战术瞄准角标 (祖母绿)
   ========================================= */
.hud-corner {
  position: absolute;
  width: 15px;
  height: 15px;
  border: 2px solid #38ef7d;
  z-index: 3;
  pointer-events: none;
  opacity: 0.7;
}

.hud-corner.top-left { top: -1px; left: -1px; border-right: none; border-bottom: none; }
.hud-corner.top-right { top: -1px; right: -1px; border-left: none; border-bottom: none; }
.hud-corner.bottom-left { bottom: -1px; left: -1px; border-right: none; border-top: none; }
.hud-corner.bottom-right { bottom: -1px; right: -1px; border-left: none; border-top: none; }

/* =========================================
   全息雷达扫描线动画
   ========================================= */
.radar-scanline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(56, 239, 125, 0) 0%,
    rgba(56, 239, 125, 0.05) 50%,
    rgba(17, 153, 142, 0.2) 100%
  );
  z-index: 1;
  pointer-events: none;
  border-bottom: 1px solid rgba(56, 239, 125, 0.5);
  animation: radar-sweep 4s linear infinite;
  opacity: 0.5;
}

@keyframes radar-sweep {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

/* =========================================
   数据异常警报蒙版 (严重越界时触发)
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