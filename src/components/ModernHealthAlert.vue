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
            <!-- 风险等级卡片 -->
            <div class="risk-card" :style="{ borderColor: alertColor }">
              <div class="risk-level">
                <span class="level-badge" :style="{ backgroundColor: alertColor }">
                  {{ riskLevelText }}
                </span>
                <span class="risk-description">{{ riskDescription }}</span>
              </div>
            </div>
            <!-- 统计数据 -->
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-label">数据点数</div>
                <div class="stat-value">{{ totalPoints }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">异常点数</div>
                <div class="stat-value" :style="{ color: alertColor }">
                  {{ severeCount }}
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">异常比例</div>
                <div class="stat-value">
                  {{ abnormalPercentage }}%
                </div>
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
            <!-- 异常数据点 -->
            <div v-if="severePoints.length > 0" class="severe-points">
              <h4>⚠️ 异常数据点</h4>
              <div class="points-list">
                <div v-for="(point, index) in severePoints" :key="index" class="point-item">
                  <div class="point-time">{{ formatTime(point.timestamp) }}</div>
                  <div class="point-value" :style="{ color: point.color }">
                    {{ getPointValue(point) }}
                  </div>
                  <div class="point-status" :style="{ color: point.color }">
                    {{ point.message || '未知异常' }}
                  </div>
                </div>
              </div>
            </div>
            <!-- 建议 -->
            <div class="suggestions">
              <h4>💡 建议</h4>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  analysisResult: Object,
  dataType: String,
  position: {
    type: String,
    default: 'top-right',
    validator: value => ['top-right', 'top-left'].includes(value)
  }
});
const emit = defineEmits(['export-data']);

// 状态
const isModalOpen = ref(false);
const showTooltip = ref(false);

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
  isModalOpen.value = false;
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

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  font-weight: bold;
}

.alert-icon.level-0 {
  background: #52c41a;
  color: white;
}

.alert-icon.level-1 {
  background: #faad14;
  color: white;
}

.alert-icon.level-2 {
  background: #fa8c16;
  color: white;
}

.alert-icon.level-3 {
  background: #f5222d;
  color: white;
}

.alert-icon.pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(245, 34, 45, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(245, 34, 45, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 34, 45, 0); }
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #ff4d4f;
  color: white;
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 0 0 2px white;
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  z-index: 1001;
}

.tooltip-content {
  background: white;
  border: 1px solid #e0e7ff;
  border-radius: 8px;
  padding: 10px;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: #1e293b;
}

.tooltip-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
  color: #1e293b;
}

.tooltip-message {
  font-size: 13px;
  color: #64748b;
}

.tooltip-arrow {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid white;
}

.alert-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.alert-modal {
  background: white;
  border-radius: 16px;
  width: 95%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e7ff;
  transform: translateY(0);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* 自定义滚动条样式 */
.alert-modal::-webkit-scrollbar {
  width: 8px;
}

.alert-modal::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 4px;
}

.alert-modal::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
}

.alert-modal::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.alert-modal.blood {
  border-top: 4px solid #52c41a;
}

.alert-modal.heart {
  border-top: 4px solid #f5222d;
}

.alert-modal.pressure {
  border-top: 4px solid #1890ff;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  background: #f5222d;
}

.modal-title h3 {
  color: #1e293b;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.subtitle {
  color: #64748b;
  margin: 2px 0 0 0;
  font-size: 13px;
}

.close-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.modal-content {
  padding: 20px;
  color: #1e293b;
}

.risk-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  border-left-width: 3px;
  border-left-style: solid;
  border-color: #e2e8f0;
}

.risk-level {
  display: flex;
  align-items: center;
  gap: 10px;
}

.level-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.risk-description {
  color: #64748b;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  background: #f1f5f9;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #1e293b;
}

.trend-section {
  margin-bottom: 20px;
}

.trend-section h4 {
  color: #1e293b;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}

.trend-info {
  background: #f1f5f9;
  border-radius: 8px;
  padding: 12px;
}

.trend-label {
  color: #64748b;
  margin-right: 8px;
}

.trend-value {
  font-weight: bold;
  color: #1e293b;
}

.severe-points {
  margin-bottom: 20px;
}

.severe-points h4 {
  color: #1e293b;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}

.points-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.point-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e2e8f0;
}

.point-time {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.point-value {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 2px;
}

.point-status {
  font-size: 13px;
  font-style: italic;
  color: #64748b;
}

.suggestions {
  margin-bottom: 20px;
}

.suggestions h4 {
  color: #1e293b;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 6px;
}

.suggestion-bullet {
  min-width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  background: #f5222d;
}

.suggestion-text {
  color: #1e293b;
  font-size: 14px;
  line-height: 1.5;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f8fafc;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
}

.action-btn.secondary {
  background: #e2e8f0;
  color: #64748b;
}

.action-btn.secondary:hover {
  background: #cbd5e1;
}

.action-btn.primary {
  background: #1890ff;
  color: white;
  box-shadow: 0 4px 10px rgba(24, 144, 255, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(24, 144, 255, 0.4);
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: all 0.3s ease;
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
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