<template>
  <div class="cyber-chart-wrapper" ref="wrapperRef">
    <div class="hud-corner top-left"></div>
    <div class="hud-corner top-right"></div>
    <div class="hud-corner bottom-left"></div>
    <div class="hud-corner bottom-right"></div>

    <div class="radar-scanline"></div>

    <div ref="chartRef" class="chart-dom"></div>

    <div v-if="warning && warning.level >= 2" class="critical-overlay">
      <span>血压异常</span>
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
    // data 预期结构: [systolic(收缩压), diastolic(舒张压)]
    default: () => [0, 0]
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

// 初始化 ECharts (赛博双轨动能弹道)
const initChart = () => {
  if (!chartRef.value) return;

  chartInstance.value = echarts.init(chartRef.value);

  const sysValue = props.data[0] || 0;
  const diaValue = props.data[1] || 0;

  const option = {
    // 战术网格布局 (水平条形图的边距)
    grid: {
      top: 30,
      right: 45,
      bottom: 25,
      left: 45,
      containLabel: false
    },
    // 硬核解析面板提示框
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: { color: 'rgba(0, 210, 255, 0.05)' }
      },
      backgroundColor: '#ffffff',
      borderColor: props.warning.level >= 2 ? '#ff003c' : '#8e2de2',
      borderWidth: 1,
      padding: [10, 14],
      formatter: () => {
        const sys = props.data[0] || '--';
        const dia = props.data[1] || '--';
        return `
          <div style="color: #8e2de2; margin-bottom: 8px; border-bottom: 1px solid rgba(0,210,255,0.3); padding-bottom: 4px; font-family: 'Courier New', monospace; font-weight: 900; letter-spacing: 1px;">
            血压诊断
          </div>
          <div style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 6px; font-family: 'Courier New', monospace;">
            <span style="color:#ff416c; font-weight:bold;">收缩压:</span>
            <span style="color:#5c5c5c; font-weight:bold; font-size: 14px;">${sys} <span style="color:#888; font-size:10px;">mmHg</span></span>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 20px; font-family: 'Courier New', monospace;">
            <span style="color:#00d2ff; font-weight:bold;">舒张压:</span>
            <span style="color:#5c5c5c; font-weight:bold; font-size: 14px;">${dia} <span style="color:#888; font-size:10px;">mmHg</span></span>
          </div>
        `;
      }
    },
    xAxis: {
      type: 'value',
      max: 200, // 血压常规上限设定为 200
      axisLine: {
        show: true,
        lineStyle: {
          color: 'rgba(142, 45, 226, 0.4)',
          width: 2
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(142, 45, 226, 0.1)',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#8b9bb4',
        fontFamily: '"Courier New", monospace',
        fontSize: 10
      }
    },
    yAxis: {
      type: 'category',
      data: ['DIA', 'SYS'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#e0e0e0',
        fontFamily: '"Courier New", monospace',
        fontSize: 12,
        fontWeight: 'bold',
        margin: 15
      }
    },
    series: [
      // 1. 底层暗槽 (轨道)
      {
        type: 'bar',
        barWidth: 16,
        data: [200, 200],
        itemStyle: {
          color: 'rgba(255, 255, 255, 0.03)',
          borderRadius: [0, 4, 4, 0]
        },
        barGap: '-100%',
        silent: true,
        z: 1
      },
      // 2. 动能数据条
      {
        name: 'BP Value',
        type: 'bar',
        barWidth: 16,
        z: 3,
        data: [
          // 舒张压 (DIA) - 等离子蓝
          {
            value: diaValue,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: 'rgba(58, 123, 213, 0.2)' },
                { offset: 1, color: '#00d2ff' }
              ]),
              borderRadius: [0, 4, 4, 0],
              shadowColor: '#00d2ff',
              shadowBlur: 15
            },
            label: {
              show: true,
              position: 'right',
              distance: 10,
              color: '#00d2ff',
              fontFamily: '"Courier New", monospace',
              fontWeight: 'bold',
              fontSize: 14,
              formatter: '{c}'
            }
          },
          // 收缩压 (SYS) - 激光粉紫
          {
            value: sysValue,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: 'rgba(142, 45, 226, 0.2)' },
                { offset: 1, color: '#ff416c' }
              ]),
              borderRadius: [0, 4, 4, 0],
              shadowColor: '#ff416c',
              shadowBlur: 15
            },
            label: {
              show: true,
              position: 'right',
              distance: 10,
              color: '#ff416c',
              fontFamily: '"Courier New", monospace',
              fontWeight: 'bold',
              fontSize: 14,
              formatter: '{c}'
            }
          }
        ],
        animationDuration: 1800,
        animationEasing: 'cubicOut'
      }
    ]
  };

  chartInstance.value.setOption(option);
};

// 监听数据更新图表
watch(() => props.data, (newData) => {
  if (chartInstance.value && newData.length >= 2) {
    const diaValue = newData[1];
    const sysValue = newData[0];

    chartInstance.value.setOption({
      series: [
        { /* 背景槽维持原样 */ },
        {
          data: [
            { value: diaValue, /* 维持 DIA 样式 */
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: 'rgba(58, 123, 213, 0.2)' },
                  { offset: 1, color: '#00d2ff' }
                ]),
                borderRadius: [0, 4, 4, 0], shadowColor: '#00d2ff', shadowBlur: 15
              },
              label: { show: true, position: 'right', distance: 10, color: '#00d2ff', fontWeight: 'bold', fontFamily: '"Courier New", monospace', fontSize: 14 }
            },
            { value: sysValue, /* 维持 SYS 样式 */
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: 'rgba(142, 45, 226, 0.2)' },
                  { offset: 1, color: '#ff416c' }
                ]),
                borderRadius: [0, 4, 4, 0], shadowColor: '#ff416c', shadowBlur: 15
              },
              label: { show: true, position: 'right', distance: 10, color: '#ff416c', fontWeight: 'bold', fontFamily: '"Courier New", monospace', fontSize: 14 }
            }
          ]
        }
      ]
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
   战术瞄准角标 (紫蓝色调)
   ========================================= */
.hud-corner {
  position: absolute;
  width: 15px;
  height: 15px;
  border: 2px solid #8e2de2;
  z-index: 3;
  pointer-events: none;
  opacity: 0.7;
}

.hud-corner.top-left { top: -1px; left: -1px; border-right: none; border-bottom: none; }
.hud-corner.top-right { top: -1px; right: -1px; border-left: none; border-bottom: none; }
.hud-corner.bottom-left { bottom: -1px; left: -1px; border-right: none; border-top: none; }
.hud-corner.bottom-right { bottom: -1px; right: -1px; border-left: none; border-top: none; }

/* =========================================
   全息雷达扫描线动画 (紫蓝配色)
   ========================================= */
.radar-scanline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(142, 45, 226, 0) 0%,
    rgba(142, 45, 226, 0.05) 50%,
    rgba(0, 210, 255, 0.1) 100%
  );
  z-index: 1;
  pointer-events: none;
  border-bottom: 1px solid rgba(0, 210, 255, 0.4);
  animation: radar-sweep 4s linear infinite;
  opacity: 0.5;
}

@keyframes radar-sweep {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

/* =========================================
   数据异常警报蒙版
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