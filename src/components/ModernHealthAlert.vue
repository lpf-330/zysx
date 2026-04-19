<template>
  <!-- 浮动警告图标 -->
  <div v-if="showAlertIcon" class="alert-icon-container">
    <div 
      class="alert-icon"
      :class="[alertLevelClass, { pulse: shouldPulse }]"
      @click="toggleModal"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
    >
      <span class="icon-text">{{ iconText }}</span>
      <span v-if="alertCount > 0" class="badge">{{ alertCount }}</span>
      <!-- 悬停提示 -->
      <transition name="fade">
        <div v-if="showTooltip && !isModalOpen" class="tooltip">
          <div class="tooltip-content">
            <div class="tooltip-title">{{ tooltipTitle }}</div>
            <div class="tooltip-message">{{ tooltipMessage }}</div>
          </div>
          <div class="tooltip-arrow"></div>
        </div>
      </transition>
    </div>
    <!-- 悬浮模态框 -->
    <transition name="modal-slide">
      <div v-if="isModalOpen" class="alert-modal-overlay" @click.self="closeModal">
        <div class="alert-modal" :class="dataType">
          <div class="modal-header">
            <div class="modal-title">
              <div class="title-icon" :style="{ backgroundColor: alertColor }">
                {{ modalIcon }}
              </div>
              <div>
                <h3>{{ modalTitle }}</h3>
                <p class="subtitle">{{ modalSubtitle }}</p>
              </div>
            </div>
            <button class="close-btn" @click="closeModal">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="modal-content">
            <!-- 异常总数概览卡片 -->
            <div class="alert-summary">
              <div class="summary-item">
                <span class="summary-label">数据点数</span>
                <span class="summary-value">{{ totalPoints }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">异常点数</span>
                <span class="summary-value severe-count">{{ severeCount }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">异常比例</span>
                <span class="summary-value">{{ abnormalPercentage }}%</span>
              </div>
            </div>

            <!-- 风险等级提示 -->
            <div class="risk-card" :style="{ borderColor: alertColor }">
              <div class="risk-level">
                <span class="level-badge" :style="{ backgroundColor: alertColor }">
                  {{ riskLevelText }}
                </span>
                <span class="risk-description">{{ riskDescription }}</span>
              </div>
            </div>

            <!-- 趋势分析 -->
            <div v-if="hasTrendAnalysis" class="trend-section">
              <h4>📈 趋势分析</h4>
              <div class="trend-info">
                <span class="trend-label">当前趋势:</span>
                <span class="trend-value">{{ trendText }}</span>
              </div>
            </div>

            <!-- 异常数据点详情列表 -->
            <div v-if="severePoints.length > 0" class="alert-list">
              <h4>⚠️ 异常数据详情</h4>
              <div
                v-for="(point, index) in severePoints"
                :key="index"
                class="alert-item"
                :style="{ '--status-color': point.color || alertColor }"
              >
                <div class="alert-item-header">
                  <div class="alert-item-title">
                    <svg class="alert-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <span class="alert-item-name">{{ getPointTypeName(point) }}</span>
                  </div>
                  <span class="alert-severity">{{ getSeverityText(point.level) }}</span>
                </div>
                <div class="alert-item-body">
                  <div class="alert-message">
                    {{ point.message || getDefaultMessage(point) }}
                  </div>
                  <div v-if="getSuggestions(point).length" class="alert-suggestion">
                    <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                    <span>{{ getSuggestions(point)[0] }}</span>
                  </div>
                </div>
                <div class="alert-item-footer">
                  <div class="value-badge">
                    <span class="value-label">测量值</span>
                    <span class="value-display" :style="{ color: point.color || alertColor }">
                      {{ getPointValue(point) }}
                    </span>
                  </div>
                  <div class="time-badge">
                    <svg class="time-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {{ formatTime(point.timestamp) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 建议 -->
            <div class="suggestions">
              <h4>💡 健康建议</h4>
              <div class="suggestions-list">
                <div v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item">
                  <div class="suggestion-bullet" :style="{ backgroundColor: alertColor }"></div>
                  <div class="suggestion-text">{{ suggestion }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-btn secondary" @click="closeModal">
              关闭
            </button>
            <button class="action-btn primary" @click="exportData">
              导出数据
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  // 控制显示
  showAlertIcon: {
    type: Boolean,
    default: true
  },
  isModalOpen: {
    type: Boolean,
    default: false
  },
  // 警报数据
  dataType: String,
  alertLevel: {
    type: Number,
    default: 0
  },
  alertCount: {
    type: Number,
    default: 0
  },
  warningData: Object,
  // 原始数据
  heartData: Array,
  bloodData: Array,
  pressureData: Array,
  oxygenData: [Number, Array],
  piData: Array,
  sleepData: Array,
  // 旧版props保留兼容
  analysisResult: Object,
  position: {
    type: String,
    default: 'top-right',
    validator: value => ['top-right', 'top-left'].includes(value)
  }
});

const emit = defineEmits(['close', 'export-data']);

// 状态 - 使用props传入的值
const showTooltip = ref(false);

// 如果传入了isModalOpen则使用它，否则使用内部状态
const isModalOpen = computed(() => props.isModalOpen);

// 安全访问分析结果
const getSafeValue = (obj, path, defaultValue) => {
  if (!obj) return defaultValue;
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  return value !== undefined ? value : defaultValue;
};

// 计算属性
const showAlertIcon = computed(() => {
  return props.analysisResult && props.analysisResult.summary?.maxLevel > 0;
});

const analysisSummary = computed(() => {
  return props.analysisResult?.summary || {};
});

const totalPoints = computed(() => {
  return analysisSummary.value.totalPoints || 0;
});

const severeCount = computed(() => {
  return analysisSummary.value.severeCount || 0;
});

const abnormalPercentage = computed(() => {
  const value = analysisSummary.value.abnormalPercentage || 0;
  return value.toFixed(1);
});

const avgSystolic = computed(() => {
  let value = getSafeValue(props.analysisResult, 'summary.average', null);
  if (value === null && props.dataType === 'pressure') {
    value = getSafeValue(props.analysisResult, 'summary.avgSystolic', 0);
  }
  return value.toFixed(1);
});

const avgDiastolic = computed(() => {
  if (props.dataType === 'pressure') {
    const value = getSafeValue(props.analysisResult, 'summary.avgDiastolic', 0);
    return value.toFixed(1);
  }
  return 'N/A';
});

const averageValue = computed(() => {
  if (props.dataType === 'pressure') {
    const sys = parseFloat(avgSystolic.value);
    const dia = parseFloat(avgDiastolic.value);
    return ((sys + dia) / 2).toFixed(1);
  }
  const value = getSafeValue(props.analysisResult, 'summary.average', 0);
  return value.toFixed(1);
});

const unit = computed(() => {
  const units = {
    blood: 'mmol/L',
    heart: 'bpm',
    pressure: 'mmHg'
  };
  return units[props.dataType] || '';
});

const hasTrendAnalysis = computed(() => {
  return props.analysisResult && (props.analysisResult.trendAnalysis || props.analysisResult.analyses);
});

const trendText = computed(() => {
  if (!props.analysisResult) return '暂无数据';
  
  if (props.analysisResult.trendAnalysis) {
    return props.analysisResult.trendAnalysis.trend || '暂无趋势数据';
  }
  
  if (props.analysisResult.analyses && props.analysisResult.analyses.length > 0) {
    return props.analysisResult.summary?.overallRisk === 'high' ? '波动剧烈' : '相对稳定';
  }
  
  return '暂无趋势数据';
});

const severePoints = computed(() => {
  if (!props.analysisResult) return [];
  
  let analyses = [];
  
  if (props.analysisResult.singleAnalyses) {
    analyses = props.analysisResult.singleAnalyses;
  } 
  else if (props.analysisResult.analyses) {
    analyses = props.analysisResult.analyses;
  }
  else if (Array.isArray(props.analysisResult)) {
    analyses = props.analysisResult;
  }
  
  return analyses
    .filter(a => a && a.level >= 2)
    .slice(0, 3);
});

const suggestions = computed(() => {
  if (!props.analysisResult) return ['暂无建议'];
  
  if (props.analysisResult.recommendations && Array.isArray(props.analysisResult.recommendations)) {
    return props.analysisResult.recommendations
      .map(rec => rec.message || rec)
      .slice(0, 3);
  }
  
  const maxLevel = analysisSummary.value.maxLevel || 0;
  const suggestionsMap = {
    0: ['数据正常，继续保持'],
    1: ['注意监测变化趋势', '保持健康生活方式'],
    2: ['建议调整生活习惯', '增加监测频率', '关注身体反应'],
    3: ['请尽快就医咨询', '避免剧烈运动', '保持充分休息']
  };
  
  return suggestionsMap[maxLevel] || suggestionsMap[0];
});

// 警告级别和样式
const alertLevel = computed(() => {
  // 如果通过props传入alertLevel，直接使用
  if (props.alertLevel !== undefined && props.alertLevel !== 0) {
    return props.alertLevel;
  }
  // 否则使用分析结果
  return analysisSummary.value.maxLevel || 0;
});

const alertLevelClass = computed(() => {
  return `level-${alertLevel.value}`;
});

const shouldPulse = computed(() => {
  return alertLevel.value >= 2;
});

const iconText = computed(() => {
  const icons = {
    0: '✓',
    1: 'ℹ',
    2: '⚠',
    3: '⚡'
  };
  return icons[alertLevel.value] || icons[0];
});

const alertCount = computed(() => {
  // 如果通过props传入alertCount，直接使用
  if (props.alertCount !== undefined && props.alertCount > 0) {
    return props.alertCount;
  }
  // 否则使用分析结果
  return severeCount.value;
});

const tooltipTitle = computed(() => {
  const titles = {
    0: '状态正常',
    1: '需要注意',
    2: '发现警告',
    3: '严重警告'
  };
  return titles[alertLevel.value] || titles[0];
});

const tooltipMessage = computed(() => {
  if (alertCount.value > 0) {
    return `发现 ${alertCount.value} 个异常数据点`;
  }
  return '点击查看详细分析';
});

const alertColor = computed(() => {
  const colors = {
    0: '#52c41a',
    1: '#faad14',
    2: '#fa8c16',
    3: '#f5222d'
  };
  return colors[alertLevel.value] || colors[0];
});

const modalIcon = computed(() => {
  const icons = {
    0: '✅',
    1: '📋',
    2: '⚠️',
    3: '🚨'
  };
  return icons[alertLevel.value] || icons[0];
});

const modalTitle = computed(() => {
  const titles = {
    blood: '血糖分析报告',
    heart: '心率分析报告',
    pressure: '血压分析报告'
  };
  return titles[props.dataType] || '健康分析报告';
});

const modalSubtitle = computed(() => {
  const subtitles = {
    0: '所有数据均在正常范围内',
    1: '有轻微异常数据需要关注',
    2: '发现异常数据，请注意',
    3: '存在严重异常数据，建议处理'
  };
  return subtitles[alertLevel.value] || subtitles[0];
});

const riskLevelText = computed(() => {
  const texts = {
    0: '低风险',
    1: '注意',
    2: '警告',
    3: '高风险'
  };
  return texts[alertLevel.value] || texts[0];
});

const riskDescription = computed(() => {
  if (severeCount.value === 0) {
    return '所有数据正常';
  }
  return `在 ${totalPoints.value} 个数据点中发现 ${severeCount.value} 个异常`;
});

// 方法
const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value;
  showTooltip.value = false;
};

const closeModal = () => {
  emit('close');
};

const formatTime = (timestamp) => {
  if (!timestamp) return '--:--';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return '--:--';
    }
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '--:--';
  }
};

const getPointValue = (point) => {
  if (!point) return 'N/A';

  if (props.dataType === 'pressure' && point.systolic !== undefined && point.diastolic !== undefined) {
    return `${point.systolic}/${point.diastolic} mmHg`;
  }

  if (point.value !== undefined) {
    return `${point.value.toFixed(1)}${unit.value}`;
  }

  return 'N/A';
};

const getPointTypeName = (point) => {
  const typeNames = {
    blood: '血糖异常',
    heart: '心率异常',
    pressure: '血压异常',
    oxygen: '血氧异常',
    sleep: '睡眠异常',
    pi: '脉搏异常'
  };
  return typeNames[props.dataType] || '健康指标异常';
};

const getSeverityText = (level) => {
  const texts = {
    1: '轻度',
    2: '中度',
    3: '重度'
  };
  return texts[level] || '异常';
};

const getDefaultMessage = (point) => {
  const messages = {
    blood: '血糖值超出正常范围',
    heart: '心率数值异常',
    pressure: '血压值超出正常范围',
    oxygen: '血氧饱和度偏低',
    sleep: '睡眠数据异常',
    pi: '脉搏频率异常'
  };
  return messages[props.dataType] || '检测到健康指标异常';
};

const getSuggestions = (point) => {
  const suggestionsMap = {
    blood: ['建议控制饮食', '适当增加运动', '定期监测血糖'],
    heart: ['注意休息', '避免情绪波动', '如有不适及时就医'],
    pressure: ['注意低盐饮食', '保持情绪稳定', '定期测量血压'],
    oxygen: ['保持室内通风', '进行深呼吸练习', '如有呼吸困难及时就医'],
    sleep: ['保持规律作息', '营造良好睡眠环境', '避免睡前刺激'],
    pi: ['注意休息', '避免剧烈运动', '如有不适及时就医']
  };
  return suggestionsMap[props.dataType] || ['注意休息', '如有不适及时就医'];
};

const exportData = () => {
  if (props.analysisResult && emit) {
    emit('export-data', props.analysisResult);
  }
  closeModal();
};

// 点击外部关闭模态框
const handleClickOutside = (event) => {
  if (isModalOpen.value && !event.target.closest('.alert-modal') && !event.target.closest('.alert-icon')) {
    closeModal();
  }
};

// 初始化事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

/* ================= 健康警报弹窗样式 (温馨森系呼吸绿) ================= */

/* --- 1. 深度沉浸式柔和毛玻璃背景 --- */
.alert-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 50, 30, 0.1);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* --- 2. 温馨圆润的主卡片 --- */
.alert-modal {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  max-width: 100%;
  max-height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  border: none;
  border-radius: 0;
  z-index: 10000;
  overflow: visible;
}

/* 高级动态：卡片内部隐约流动的绿色极光 */
.alert-modal::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(167, 243, 208, 0.25) 0%, transparent 50%);
  animation: ambient-rotate 15s linear infinite;
  z-index: 0;
  pointer-events: none;
}

/* --- 3. 清新明亮的头部 --- */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 40px;
  background: linear-gradient(135deg, #e6f9ed 0%, #d1f4e0 100%);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #c6ebd5;
}

.modal-header-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.modal-alert-icon {
  width: 32px;
  height: 32px;
  color: #ff4d4f;
  animation: gentle-heartbeat 2s ease-in-out infinite;
}

.modal-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #115e59;
  font-family: sans-serif;
  letter-spacing: 1px;
}

/* 温馨的圆形关闭按钮 */
.close-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #a7f3d0;
  color: #115e59;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(16, 80, 40, 0.05);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.close-btn:hover {
  background: #10b981;
  color: #fff;
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2);
}

/* --- 4. 内部滚动区域 --- */
.modal-content {
  flex: 1;
  padding: 35px 40px;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

/* 清新风滚动条 */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(16, 185, 129, 0.05);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.3);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 185, 129, 0.5);
}

/* --- 5. 异常总数概览卡片 (柔光浮雕效果) --- */
.alert-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 35px;
}

.summary-item {
  flex: 1;
  padding: 25px 30px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #d1fae5;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.06);
  position: relative;
  overflow: hidden;
}

/* 高级动态：概览卡片内的悬浮光球 */
.summary-item::after {
  content: '';
  position: absolute;
  right: -20px;
  bottom: -30px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.summary-label {
  font-size: 15px;
  color: #059669;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 48px;
  font-weight: 800;
  color: #064e3b;
  line-height: 1;
  font-family: 'Share Tech Mono', sans-serif;
}

.severe-count {
  color: #e11d48;
}

/* --- 6. 独立警报详情项 (告别黑色) --- */
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 25px;
}

.alert-list h4 {
  color: #065f46;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.alert-item {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(167, 243, 208, 0.5);
  box-shadow: 0 8px 25px rgba(4, 120, 87, 0.04);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.alert-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(4, 120, 87, 0.08);
}

/* 左侧彩色指示条修饰 */
.alert-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background: var(--status-color, #10b981);
}

.alert-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 25px;
  border-bottom: 1px dashed #d1fae5;
}

.alert-item-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.alert-item-icon {
  width: 24px;
  height: 24px;
  color: var(--status-color, #10b981);
}

.alert-item-name {
  font-size: 18px;
  font-weight: bold;
  color: #065f46;
}

.alert-severity {
  padding: 6px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: bold;
  background: var(--status-color);
  color: #fff;
  box-shadow: 0 4px 10px color-mix(in srgb, var(--status-color) 30%, transparent);
  letter-spacing: 1px;
}

/* --- 7. 温馨文本提示区 --- */
.alert-item-body {
  padding: 20px 25px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-message {
  font-size: 15px;
  color: #9a3412;
  font-weight: bold;
  padding: 15px 20px;
  background: #fff7ed;
  border-radius: 12px;
  border: 1px solid #ffedd5;
}

.alert-suggestion {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: #065f46;
  padding: 15px 20px;
  background: #f0fdf4;
  border-radius: 12px;
  border: 1px solid #bbf7d0;
}

.suggestion-icon {
  width: 20px;
  height: 20px;
  color: #10b981;
  flex-shrink: 0;
}

/* --- 8. 底部数据栏 (由纯黑改为亮绿渐变) --- */
.alert-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 25px;
  background: linear-gradient(90deg, #f0fdf4 0%, #e6f9ed 100%);
  border-top: 1px solid #d1fae5;
}

.value-badge {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.value-label {
  font-size: 13px;
  color: #047857;
  font-weight: bold;
}

.value-display {
  font-size: 22px;
  font-weight: 800;
  color: #064e3b;
}

.time-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #047857;
  font-weight: bold;
  background: #ffffff;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid #a7f3d0;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.05);
}

.time-icon {
  width: 16px;
  height: 16px;
  color: #10b981;
}

/* ================= 丝滑的高级入场动效 ================= */
@keyframes ambient-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes gentle-heartbeat {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 5px rgba(255, 77, 79, 0.3));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 12px rgba(255, 77, 79, 0.6));
  }
}

@keyframes float-bubble {
  100% {
    transform: translate(15px, -15px) scale(1.1);
  }
}

.modal-enter-active {
  animation: soft-slide-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
  filter: blur(5px);
}

@keyframes soft-slide-up {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(40px);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
}

/* 风险等级卡片 */
.risk-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 25px;
  border: 1px solid rgba(167, 243, 208, 0.5);
  box-shadow: 0 8px 25px rgba(4, 120, 87, 0.04);
}

.risk-level {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.risk-description {
  color: #065f46;
  font-size: 14px;
}

/* 趋势分析 */
.trend-section {
  margin-bottom: 25px;
}

.trend-section h4 {
  color: #065f46;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}

.trend-info {
  background: #f0fdf4;
  border-radius: 12px;
  padding: 15px 20px;
  border: 1px solid #bbf7d0;
}

.trend-label {
  color: #047857;
  margin-right: 8px;
  font-weight: 500;
}

.trend-value {
  font-weight: bold;
  color: #064e3b;
}

/* 建议区域 */
.suggestions {
  margin-top: 25px;
}

.suggestions h4 {
  color: #065f46;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: #f0fdf4;
  border-radius: 10px;
  border: 1px solid #bbf7d0;
}

.suggestion-bullet {
  min-width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  background: #10b981;
}

.suggestion-text {
  color: #065f46;
  font-size: 14px;
  line-height: 1.5;
}

/* 底部按钮区域 */
.modal-footer {
  padding: 20px 40px;
  border-top: 1px solid #d1fae5;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  background: linear-gradient(90deg, #f0fdf4 0%, #e6f9ed 100%);
}

.action-btn {
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: none;
  font-size: 14px;
}

.action-btn.secondary {
  background: #ffffff;
  color: #115e59;
  border: 1px solid #a7f3d0;
}

.action-btn.secondary:hover {
  background: #f0fdf4;
  transform: translateY(-2px);
}

.action-btn.primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* 浮动警告图标 */
.alert-icon-container {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  transition: all 0.3s ease;
}

.alert-icon {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
  transition: all 0.3s ease;
  font-weight: bold;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.alert-icon.level-0 {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}

.alert-icon.level-1 {
  background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
}

.alert-icon.level-2 {
  background: linear-gradient(135deg, #fa8c16 0%, #d46b08 100%);
}

.alert-icon.level-3 {
  background: linear-gradient(135deg, #f5222d 0%, #cf1322 100%);
}

.alert-icon.pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 34, 45, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(245, 34, 45, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 34, 45, 0);
  }
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #ff4d4f;
  color: white;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 0 0 2px white;
}

/* 悬停提示 */
.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 10px;
  z-index: 1001;
}

.tooltip-content {
  background: white;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 200px;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
  color: #065f46;
}

.tooltip-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
  color: #064e3b;
}

.tooltip-message {
  font-size: 13px;
  color: #047857;
}

.tooltip-arrow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid white;
}

/* 过渡动画 */
.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>