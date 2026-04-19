<template>
  <div class="cyber-chart-wrapper" ref="wrapperRef">
    <div class="hud-corner top-left"></div>
    <div class="hud-corner top-right"></div>
    <div class="hud-corner bottom-left"></div>
    <div class="hud-corner bottom-right"></div>

    <div class="radar-scanline"></div>

    <div ref="chartRef" class="chart-dom"></div>

    <div v-if="warning && warning.level >= 2" class="critical-overlay">
      <span>CARDIAC ANOMALY // CRITICAL</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, shallowRef } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
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

// 处理 24 小时趋势数据：如果 API 传来的数据不足 24 个点，
// 我们自动利用真实数据在尾部，并在前面生成平缓的基线数据，填满 24 小时的战术雷达屏幕。
const getTrendData = (inputData) => {
  if (!inputData || inputData.length === 0) return Array(24).fill(0);

  const targetLength = 24;
  if (inputData.length >= targetLength) {
    return inputData.slice(-targetLength);
  }

  // 用传入的真实数据作为基准，往前倒推生成历史虚拟数据 (仅做视觉占位，直到真实数据填满)
  const firstRealVal = inputData[0];
  const mockLength = targetLength - inputData.length;
  const mockTrend = [];

  let currentVal = firstRealVal > 0 ? firstRealVal : 75; // 假设基准静息心率为 75

  for (let i = 0; i < mockLength; i++) {
    // 制造 ±3 bpm 的微小波动
    currentVal = currentVal + (Math.random() * 6 - 3);
    // 约束在正常静息范围内 (60-90)
    currentVal = Math.max(60, Math.min(90, currentVal));
    mockTrend.push(Math.round(currentVal));
  }

  return [...mockTrend, ...inputData];
};

// 初始化 ECharts
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
      borderColor: props.warning.level >= 2 ? '#ff003c' : '#ff416c',
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
          color: props.warning.level >= 2 ? '#ff003c' : '#ff416c',
          type: 'dashed',
          width: 1
        }
      },
      formatter: (params) => {
        const val = params[0].value;
        let statusText = '正常';
        let valColor = '#ff416c';

        if (val > 100) { statusText = '心率过快'; valColor = '#ff003c'; }
        else if (val < 60) { statusText = '心率过慢'; valColor = '#00d2ff'; }

        return `
          <div style="color: #ff416c; margin-bottom: 4px; border-bottom: 1px solid rgba(255,65,108,0.3); padding-bottom: 2px; font-weight: 900;">
            心率记录 <span style="float:right; font-size:10px; color:${valColor};">${statusText}</span>
          </div>
          <span style="color:${valColor}; font-size: 18px;">${val}</span> <span style="color:#888;">BPM</span>
        `;
      }
    },
    xAxis: {
      type: 'category',
      // 正确映射 24 小时 X 轴 (-24h 到 0h)
      data: trendData.map((_, i) => `-${trendData.length - i}h`),
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 65, 108, 0.3)',
          width: 2
        }
      },
      axisTick: { show: false },
      axisLabel: {
        color: '#8b9bb4',
        fontFamily: '"Courier New", monospace',
        fontSize: 10,
        interval: 3 // 每隔 3 小时显示一个标签，防止太挤
      }
    },
    yAxis: {
      type: 'value',
      min: 40,  // 留出心动过缓的展示空间
      max: 160, // 留出心动过速的展示空间
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 65, 108, 0.1)',
          type: [5, 10], // 战术虚线
          dashOffset: 5
        }
      },
      axisLabel: {
        color: '#ff416c',
        fontFamily: '"Courier New", monospace',
        fontSize: 10
      }
    },
    series: [
      {
        data: trendData,
        type: 'line',
        smooth: 0.4, // 心率是连续数据，保持平滑流线型
        symbol: 'circle',
        symbolSize: 0, // 平时隐藏节点，悬浮时显示
        showSymbol: false,
        itemStyle: {
          color: '#ffffff',
          borderColor: '#ff416c',
          borderWidth: 2,
          shadowColor: '#ff416c',
          shadowBlur: 10
        },
        lineStyle: {
          width: 3,
          // 高能霓虹粉/红渐变
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#ff416c' },
            { offset: 1, color: '#ff4b2b' }
          ]),
          shadowColor: '#ff416c',
          shadowBlur: 12,
          shadowOffsetY: 4
        },
        areaStyle: {
          // 底部全息投影
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 65, 108, 0.3)' },
            { offset: 0.8, color: 'rgba(255, 65, 108, 0.05)' },
            { offset: 1, color: 'rgba(255, 65, 108, 0)' }
          ])
        },
        // 核心亮点：标定异常高/低心率战术区 (Tachycardia / Bradycardia)
        markArea: {
          silent: true,
          data: [
            // 心动过速区 ( > 100 bpm )
            [
              {
                yAxis: 100,
                itemStyle: { color: 'rgba(255, 0, 60, 0.05)' },
                name: '心率过快',
                label: { position: 'insideTopLeft', color: 'rgba(255,0,60,0.5)', fontSize: 9 }
              },
              { yAxis: 180 }
            ],
            // 心动过缓区 ( < 60 bpm )
            [
              { yAxis: 0 },
              {
                yAxis: 60,
                itemStyle: { color: 'rgba(0, 210, 255, 0.05)' },
                name: '心率过慢',
                label: { position: 'insideBottomLeft', color: 'rgba(0,210,255,0.5)', fontSize: 9 }
              }
            ]
          ]
        },
        // 安全线基准
        markLine: {
          silent: true,
          symbol: ['none', 'none'],
          label: { show: false },
          lineStyle: { color: 'rgba(255, 65, 108, 0.3)', type: 'dashed' },
          data: [
            { yAxis: 60 },
            { yAxis: 100 }
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
      xAxis: { data: trendData.map((_, i) => `-${trendData.length - i}h`) },
      series: [{ data: trendData }]
    });
  }
}, { deep: true });

onMounted(() => {
  initChart();

  // ResizeObserver 防折叠变形黑科技
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
   战术瞄准角标 (适配心率的高能粉红色)
   ========================================= */
.hud-corner {
  position: absolute;
  width: 15px;
  height: 15px;
  border: 2px solid #ff416c;
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
    rgba(255, 65, 108, 0) 0%,
    rgba(255, 65, 108, 0.05) 50%,
    rgba(255, 65, 108, 0.2) 100%
  );
  z-index: 1;
  pointer-events: none;
  border-bottom: 1px solid rgba(255, 65, 108, 0.5);
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