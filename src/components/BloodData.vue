<template>
  <div class="cyber-chart-wrapper" ref="wrapperRef">
    <div class="hud-corner top-left"></div>
    <div class="hud-corner top-right"></div>
    <div class="hud-corner bottom-left"></div>
    <div class="hud-corner bottom-right"></div>

    <div class="radar-scanline"></div>

    <div ref="chartRef" class="chart-dom"></div>

    <div v-if="warning && warning.level >= 2" class="critical-overlay">
      <span>血糖过高</span>
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

// 初始化 ECharts
const initChart = () => {
  if (!chartRef.value) return;

  chartInstance.value = echarts.init(chartRef.value);

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
      borderColor: props.warning.level >= 2 ? '#ff003c' : '#f7971e',
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
          color: props.warning.level >= 2 ? '#ff003c' : '#f7971e',
          type: 'dashed',
          width: 1
        }
      },
      formatter: (params) => {
        const val = params[0].value;
        // 动态判断当前值是否在安全区间内外，改变文字颜色
        const valColor = (val < 3.9 || val > 10.0) ? '#ff003c' : '#ffd200';
        return `<div style="color: #f7971e; margin-bottom: 4px; border-bottom: 1px solid rgba(247,151,30,0.3); padding-bottom: 2px;">血糖记录</div>
                <span style="color:${valColor}; font-size: 16px;">${val}</span> <span style="color:#888;">mmol/L</span>`;
      }
    },
    xAxis: {
      type: 'category',
      // 模拟7天趋势
      data: props.data.map((_, i) => `D-${props.data.length - i}`),
      axisLine: {
        lineStyle: {
          color: 'rgba(247, 151, 30, 0.3)',
          width: 2
        }
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
      min: (value) => Math.max(0, Math.floor(value.min - 2)), // 给底部留点空间
      max: (value) => Math.ceil(value.max + 3), // 给顶部留点空间
      splitLine: {
        lineStyle: {
          color: 'rgba(247, 151, 30, 0.1)',
          type: [5, 10], // 战术虚线
          dashOffset: 5
        }
      },
      axisLabel: {
        color: '#f7971e',
        fontFamily: '"Courier New", monospace',
        fontSize: 10
      }
    },
    series: [
      {
        data: props.data,
        type: 'line',
        smooth: 0.3, // 稍微平滑，保留数据的节点感
        symbol: 'circle',
        symbolSize: 6, // 血糖数据是离散的，显示发光的节点更酷
        showSymbol: true,
        itemStyle: {
          color: '#ffffff',
          borderColor: '#ffd200',
          borderWidth: 2,
          shadowColor: '#f7971e',
          shadowBlur: 10
        },
        lineStyle: {
          width: 3,
          // 橙金色霓虹渐变
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#f7971e' },
            { offset: 1, color: '#ffd200' }
          ]),
          shadowColor: '#f7971e',
          shadowBlur: 12,
          shadowOffsetY: 4
        },
        areaStyle: {
          // 底部投影
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(247, 151, 30, 0.3)' },
            { offset: 0.8, color: 'rgba(247, 151, 30, 0.05)' },
            { offset: 1, color: 'rgba(247, 151, 30, 0)' }
          ])
        },
        // 核心亮点：全息安全区投影 (Target Zone)
        markArea: {
          silent: true, // 鼠标不交互
          itemStyle: {
            color: 'rgba(247, 151, 30, 0.08)',
            borderWidth: 1,
            borderColor: 'rgba(247, 151, 30, 0.2)',
            borderType: 'dashed'
          },
          data: [
            [
              { yAxis: 3.9, name: 'SAFE ZONE', label: { position: 'insideTopLeft', color: 'rgba(247,151,30,0.5)', fontSize: 9 } },
              { yAxis: 7.8 }
            ]
          ]
        },
        // 临界值红色警告线
        markLine: {
          silent: true,
          symbol: ['none', 'none'],
          label: { show: false },
          lineStyle: {
            color: 'rgba(255, 0, 60, 0.4)',
            type: 'dotted',
            width: 1
          },
          data: [
            { yAxis: 3.9 }, // 低血糖临界
            { yAxis: 10.0 } // 高血糖临界
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
    chartInstance.value.setOption({
      xAxis: { data: newData.map((_, i) => `D-${newData.length - i}`) },
      series: [{ data: newData }]
    });
  }
}, { deep: true });

onMounted(() => {
  initChart();

  // ResizeObserver 防变形
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
/* 外部战术容器 */
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
   战术瞄准角标 (适配血糖橙金色)
   ========================================= */
.hud-corner {
  position: absolute;
  width: 15px;
  height: 15px;
  border: 2px solid #f7971e;
  z-index: 3;
  pointer-events: none;
  opacity: 0.7;
}

.hud-corner.top-left { top: -1px; left: -1px; border-right: none; border-bottom: none; }
.hud-corner.top-right { top: -1px; right: -1px; border-left: none; border-bottom: none; }
.hud-corner.bottom-left { bottom: -1px; left: -1px; border-right: none; border-top: none; }
.hud-corner.bottom-right { bottom: -1px; right: -1px; border-left: none; border-top: none; }

/* =========================================
   全息雷达扫描线动画 (橙金配色)
   ========================================= */
.radar-scanline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(247, 151, 30, 0) 0%,
    rgba(247, 151, 30, 0.05) 50%,
    rgba(247, 151, 30, 0.15) 100%
  );
  z-index: 1;
  pointer-events: none;
  border-bottom: 1px solid rgba(247, 151, 30, 0.4);
  animation: radar-sweep 4s linear infinite;
  opacity: 0.5;
}

@keyframes radar-sweep {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

/* =========================================
   数据异常警报蒙版 (严重越界时触发红框闪烁)
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