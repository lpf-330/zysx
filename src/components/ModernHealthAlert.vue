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
                <div class="stat-value">{{ analysisResult?.summary?.totalPoints || 0 }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">异常点数</div>
                <div class="stat-value" :style="{ color: alertColor }">
                  {{ analysisResult?.summary?.severeCount || 0 }}
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">异常比例</div>
                <div class="stat-value">
                  {{ (analysisResult?.summary?.abnormalPercentage || 0).toFixed(1) }}%
                </div>
              </div>
            </div>
            
            <!-- 趋势分析 -->
            <div v-if="analysisResult?.trendAnalysis" class="trend-section">
              <h4>📈 趋势分析</h4>
              <div class="trend-info">
                <span class="trend-label">当前趋势:</span>
                <span class="trend-value">{{ analysisResult.trendAnalysis.trend }}</span>
              </div>
            </div>
            
            <!-- 异常数据点 -->
            <div v-if="severePoints.length > 0" class="severe-points">
              <h4>⚠️ 异常数据点</h4>
              <div class="points-list">
                <div v-for="(point, index) in severePoints" :key="index" class="point-item">
                  <div class="point-time">{{ formatTime(point.timestamp) }}</div>
                  <div class="point-value" :style="{ color: point.color }">
                    {{ point.value.toFixed(1) }}{{ dataType === 'blood' ? 'mmol/L' : 'bpm' }}
                  </div>
                  <div class="point-status" :style="{ color: point.color }">
                    {{ point.message }}
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
import { ref, computed } from 'vue';

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

// 计算属性
const showAlertIcon = computed(() => {
  return props.analysisResult && props.analysisResult.summary?.maxLevel > 0;
});

const alertLevelClass = computed(() => {
  const level = props.analysisResult?.summary?.maxLevel || 0;
  return `level-${level}`;
});

const shouldPulse = computed(() => {
  const level = props.analysisResult?.summary?.maxLevel || 0;
  return level >= 2;
});

const iconText = computed(() => {
  const level = props.analysisResult?.summary?.maxLevel || 0;
  const icons = {
    0: '✓',
    1: 'ℹ',
    2: '⚠',
    3: '⚡'
  };
  return icons[level] || icons[0];
});

const alertCount = computed(() => {
  return props.analysisResult?.summary?.severeCount || 0;
});

const tooltipTitle = computed(() => {
  const level = props.analysisResult?.summary?.maxLevel || 0;
  const titles = {
    0: '状态正常',
    1: '需要注意',
    2: '发现警告',
    3: '严重警告'
  };
  return titles[level] || titles[0];
});

const tooltipMessage = computed(() => {
  const severeCount = props.analysisResult?.summary?.severeCount || 0;
  if (severeCount > 0) {
    return `发现 ${severeCount} 个异常数据点`;
  }
  return '点击查看详细分析';
});

const alertColor = computed(() => {
  const level = props.analysisResult?.summary?.maxLevel || 0;
  const colors = {
    0: '#52c41a',
    1: '#faad14',
    2: '#fa8c16',
    3: '#f5222d'
  };
  return colors[level] || colors[0];
});

const modalIcon = computed(() => {
  const level = props.analysisResult?.summary?.maxLevel || 0;
  const icons = {
    0: '✅',
    1: '📋',
    2: '⚠️',
    3: '🚨'
  };
  return icons[level] || icons[0];
});

const modalTitle = computed(() => {
  const titles = {
    blood: '血糖分析报告',
    heart: '心率分析报告'
  };
  return titles[props.dataType] || '健康分析报告';
});

const modalSubtitle = computed(() => {
  const level = props.analysisResult?.summary?.maxLevel || 0;
  const subtitles = {
    0: '所有数据均在正常范围内',
    1: '有轻微异常数据需要关注',
    2: '发现异常数据，请注意',
    3: '存在严重异常数据，建议处理'
  };
  return subtitles[level] || subtitles[0];
});

const riskLevelText = computed(() => {
  const level = props.analysisResult?.summary?.maxLevel || 0;
  const texts = {
    0: '低风险',
    1: '注意',
    2: '警告',
    3: '高风险'
  };
  return texts[level] || texts[0];
});

const riskDescription = computed(() => {
  const severeCount = props.analysisResult?.summary?.severeCount || 0;
  const total = props.analysisResult?.summary?.totalPoints || 0;
  
  if (severeCount === 0) {
    return '所有数据正常';
  }
  
  return `在 ${total} 个数据点中发现 ${severeCount} 个异常`;
});

const severePoints = computed(() => {
  const result = props.analysisResult;
  if (!result) return [];
  
  if (result.singleAnalyses) {
    return result.singleAnalyses
      .filter(a => a.level >= 2)
      .slice(0, 3);
  }
  
  if (result.analyses) {
    return result.analyses
      .filter(a => a.level >= 2)
      .slice(0, 3);
  }
  
  return [];
});

const suggestions = computed(() => {
  const result = props.analysisResult;
  const suggestions = [];
  
  if (!result) {
    suggestions.push('暂无建议');
    return suggestions;
  }
  
  const level = result.summary?.maxLevel || 0;
  
  // 通用建议
  if (level >= 3) {
    suggestions.push('请及时就医检查');
    suggestions.push('保持休息，避免剧烈运动');
    suggestions.push('加强监测频率');
  } else if (level >= 2) {
    suggestions.push('建议调整生活习惯');
    suggestions.push('保持规律作息');
    suggestions.push('适当增加监测');
  } else if (level >= 1) {
    suggestions.push('注意观察变化趋势');
    suggestions.push('保持健康生活方式');
  } else {
    suggestions.push('继续保持良好习惯');
  }
  
  // 数据类型特定建议
  if (props.dataType === 'blood' && result.summary?.average > 8) {
    suggestions.push('注意控制碳水摄入');
  } else if (props.dataType === 'heart' && result.summary?.average > 90) {
    suggestions.push('避免咖啡因和刺激性饮料');
  }
  
  return suggestions.slice(0, 3);
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
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '--:--';
  }
};

const exportData = () => {
  emit('export-data');
  closeModal();
};

// 点击外部关闭模态框
const handleClickOutside = (event) => {
  if (isModalOpen.value && !event.target.closest('.alert-modal') && !event.target.closest('.alert-icon')) {
    closeModal();
  }
};

// 初始化事件监听
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* 警告图标容器 */
.alert-icon-container {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

/* 警告图标样式 */
.alert-icon {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  user-select: none;
}

.alert-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.alert-icon.level-0 {
  background: linear-gradient(135deg, #52c41a, #73d13d);
}

.alert-icon.level-1 {
  background: linear-gradient(135deg, #faad14, #ffc53d);
}

.alert-icon.level-2 {
  background: linear-gradient(135deg, #fa8c16, #ffa940);
}

.alert-icon.level-3 {
  background: linear-gradient(135deg, #f5222d, #ff4d4f);
}

.alert-icon.pulse {
  animation: pulse 2s infinite;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: white;
  color: #f5222d;
  font-size: 11px;
  font-weight: bold;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 2px solid currentColor;
}

/* 悬停提示 */
.tooltip {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 160px;
  z-index: 1001;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tooltip-content {
  position: relative;
  z-index: 2;
}

.tooltip-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.tooltip-message {
  font-size: 11px;
  color: #666;
  line-height: 1.4;
}

.tooltip-arrow {
  position: absolute;
  top: -6px;
  right: 16px;
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  transform: rotate(45deg);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

/* 模态框遮罩 */
.alert-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  z-index: 2000;
  padding-top: 60px;
  padding-right: 10px;
}

/* 模态框主体 */
.alert-modal {
  width: 350px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: modal-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.alert-modal.blood {
  border-top: 4px solid #1890FF;
}

.alert-modal.heart {
  border-top: 4px solid #FF6B6B;
}

/* 模态框头部 */
.modal-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.modal-title {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
}

.title-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  flex-shrink: 0;
}

.modal-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.close-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

/* 模态框内容 */
.modal-content {
  padding: 0 20px 20px;
  max-height: 60vh;
  overflow-y: auto;
}

/* 风险卡片 */
.risk-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 16px;
  border-left: 4px solid;
}

.risk-level {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-badge {
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.risk-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  flex: 1;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 趋势分析 */
.trend-section {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 14px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.trend-section h4 {
  margin: 0 0 10px 0;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 6px;
}

.trend-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend-label {
  font-size: 12px;
  color: #666;
}

.trend-value {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 严重数据点 */
.severe-points {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 14px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.severe-points h4 {
  margin: 0 0 10px 0;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 6px;
}

.points-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.point-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.point-time {
  font-size: 12px;
  color: #666;
  width: 55px;
}

.point-value {
  font-size: 13px;
  font-weight: 600;
  flex: 1;
  text-align: center;
}

.point-status {
  font-size: 12px;
  font-weight: 500;
  width: 70px;
  text-align: right;
}

/* 建议 */
.suggestions {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 14px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.suggestions h4 {
  margin: 0 0 10px 0;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 6px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.suggestion-bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.suggestion-text {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
  flex: 1;
}

/* 模态框底部 */
.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.action-btn.secondary {
  background: rgba(0, 0, 0, 0.05);
  color: #666;
}

.action-btn.secondary:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.action-btn.primary {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  color: white;
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #40a9ff, #69c0ff);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

/* 动画 */
@keyframes pulse {
  0% {
    box-shadow: 0 4px 12px rgba(245, 34, 45, 0.3);
  }
  50% {
    box-shadow: 0 4px 20px rgba(245, 34, 45, 0.5);
  }
  100% {
    box-shadow: 0 4px 12px rgba(245, 34, 45, 0.3);
  }
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateX(20px) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  opacity: 0;
  transform: translateX(20px) translateY(-10px);
}

/* 滚动条美化 */
.modal-content::-webkit-scrollbar {
  width: 5px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .alert-modal {
    width: 320px;
    margin-right: 8px;
  }
  
  .alert-modal-overlay {
    padding-right: 8px;
  }
}

@media (max-width: 480px) {
  .alert-modal {
    width: calc(100vw - 40px);
    margin: 0 20px;
  }
  
  .alert-modal-overlay {
    padding-right: 0;
    padding-top: 80px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>