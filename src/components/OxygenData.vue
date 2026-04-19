<template>
  <div class="cyber-chart-wrapper" ref="wrapperRef">
    <div class="hud-corner top-left"></div>
    <div class="hud-corner top-right"></div>
    <div class="hud-corner bottom-left"></div>
    <div class="hud-corner bottom-right"></div>

    <div class="radar-scanline"></div>

    <div ref="chartRef" class="chart-dom"></div>

    <div v-if="warning && warning.level >= 2" class="critical-overlay">
      <span>HYPOXIA ALERT // LOW O2</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, shallowRef } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  // 修正：期望传入一个历史数据数组，而不是单点数值
  // 格式例如：[0.98, 0.99, 0.97, 0.95, 0.98...]
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

// 处理数据：如果是单点数值，为了演示趋势，我们自动帮它生成一段前置历史数据
// 在实际对接真实 API 时，父组件应该直接传入历史数组
const getTrendData = (inputData) => {
  if (Array.isArray(inputData) && inputData.length > 0) {
    return inputData;
  }

  // 如果父组件目前只能传单点 (例如 0.98)，我们模拟 24 个历史采样点
  const baseVal = typeof inputData === 'number' && inputData > 0 ? inputData : 0.98;
  const mockTrend = [];
  for (let i = 0; i < 24; i++) {
    // 制造微小的历史波动 (±1-2%)
    let noise = (Math.random() * 0.04) - 0.02;
    // 确保值在 0.85 到 1.0 之间
    let val = Math.max(0.85, Math.min(1.0, baseVal + noise));
    mockTrend.push(Number(val.toFixed(3)));
  }
  // 确保最后一个点是当前的真实值
  if (mockTrend.length > 0 && typeof inputData === 'number') {
      mockTrend[mockTrend.length - 1] = baseVal;
  }
  return mockTrend;
};


// 初始化 ECharts (战术阶梯趋势图)
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
    // 硬核十字准星提示框
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: props.warning.level >= 2 ? '#ff003c' : '#00c6ff',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: '#5c5c5c',
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: 12,
        fontWeight: 'bold'
      },
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: props.warning.level >= 2 ? '#ff003c' : '#00c6ff',
          type: 'dashed',
          width: 1
        }
      },
      formatter: (params) => {
        const val = params[0].value;
        const percentVal = (val * 100).toFixed(1);
        const valColor = val < 0.95 ? '#ff003c' : '#00c6ff';
        return `<div style="color: #0072ff; margin-bottom: 4px; border-bottom: 1px solid rgba(0,198,255,0.3); padding-bottom: 2px;">血氧记录</div>
                <span style="color:${valColor}; font-size: 16px;">${percentVal}</span> <span style="color:#888;">%</span>`;
      }
    },
    xAxis: {
      type: 'category',
      // 模拟 X 轴时间数据 (24小时)
      data: trendData.map((_, i) => `-${trendData.length - i}h`),
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 198, 255, 0.3)',
          width: 2
        }
      },
      axisTick: { show: false },
      axisLabel: {
        color: '#8b9bb4',
        fontFamily: '"Courier New", monospace',
        fontSize: 10,
        // 如果点太多，间隔显示标签
        interval: Math.floor(trendData.length / 6)
      }
    },
    yAxis: {
      type: 'value',
      min: 0.85, // 血氧很少低于85%，留出下限
      max: 1.0,
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 198, 255, 0.1)',
          type: [5, 10], // 战术虚线
          dashOffset: 5
        }
      },
      axisLabel: {
        color: '#00c6ff',
        fontFamily: '"Courier New", monospace',
        fontSize: 10,
        formatter: (val) => `${(val * 100).toFixed(0)}%`
      }
    },
    series: [
      {
        data: trendData,
        type: 'line',
        step: 'middle', // 【核心】使用阶梯图展现离散采样的硬核感
        symbol: 'circle',
        symbolSize: 4,
        showSymbol: true, // 显示采样点
        itemStyle: {
          color: '#ffffff',
          borderColor: '#00c6ff',
          borderWidth: 1,
          shadowColor: '#0072ff',
          shadowBlur: 8
        },
        lineStyle: {
          width: 2,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#00c6ff' },
            { offset: 1, color: '#0072ff' }
          ]),
          shadowColor: '#00c6ff',
          shadowBlur: 10,
          shadowOffsetY: 2
        },
        areaStyle: {
          // 底部全息投影
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 198, 255, 0.3)' },
            { offset: 0.8, color: 'rgba(0, 198, 255, 0.05)' },
            { offset: 1, color: 'rgba(0, 198, 255, 0)' }
          ])
        },
        // 危险区标定 (95% 以下)
        markArea: {
          silent: true,
          itemStyle: {
            color: 'rgba(255, 0, 60, 0.05)', // 淡淡的危险红底色
            borderWidth: 1,
            borderColor: 'rgba(255, 0, 60, 0.2)',
            borderType: 'dashed'
          },
          data: [
            [
              { yAxis: 0, name: 'CRITICAL ZONE', label: { position: 'insideTopLeft', color: 'rgba(255,0,60,0.5)', fontSize: 9 } },
              { yAxis: 0.95 }
            ]
          ]
        },
        animationDuration: 1500,
        animationEasing: 'cubicOut'
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
        data: trendData.map((_, i) => `-${trendData.length - i}h`),
        axisLabel: { interval: Math.floor(trendData.length / 6) }
      },
      series: [{ data: trendData }]
    });
  }
}, { deep: true });

onMounted(() => {
  initChart();

  if (wrapperRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if (chartInstance.value) {
        chartInstance.value.resize();
      }
    });
    resizeObserver.observe(wrapperRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver && wrapperRef.value) {
    resizeObserver.unobserve(wrapperRef.value);
  }
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }
});
</script>

<style scoped>
/* 外部战术容器，高度必须与其它图表对齐，比如 200px */
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
   战术瞄准角标 (青蓝色调)
   ========================================= */
.hud-corner {
  position: absolute;
  width: 15px;
  height: 15px;
  border: 2px solid #00c6ff;
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
    rgba(0, 198, 255, 0) 0%,
    rgba(0, 198, 255, 0.05) 50%,
    rgba(0, 198, 255, 0.2) 100%
  );
  z-index: 1;
  pointer-events: none;
  border-bottom: 1px solid rgba(0, 198, 255, 0.5);
  animation: radar-sweep 4s linear infinite;
  opacity: 0.5;
}

@keyframes radar-sweep {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

/* =========================================
   缺氧异常警报蒙版
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