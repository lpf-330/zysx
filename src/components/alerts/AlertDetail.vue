<template>
  <div :class="['alert-detail', themeClass]">

    <div class="severity-section">
      <div class="pulse-ring" :class="alert.severity"></div>
      <el-tag :type="getSeverityType(alert.severity)" effect="dark" round class="severity-tag">
        {{ getSeverityText(alert.severity) }}提醒
      </el-tag>
    </div>

    <div class="basic-info-grid glass-card">
      <div class="info-item">
        <span class="label">警报标题</span>
        <span class="value title-value">{{ alert.title }}</span>
      </div>
      <div class="info-item">
        <span class="label">提醒类型</span>
        <span class="value">{{ getAlertTypeText(alert.type) }}</span>
      </div>
    </div>

    <div v-if="alert.content" class="content-box glass-card">
      <p class="content-text">{{ alert.content }}</p>
    </div>

    <div v-if="alert.anomalies && alert.anomalies.length > 0" class="detail-section">
      <div class="section-divider">
        <span class="line"></span>
        <span class="text">异常指标 ({{ alert.anomalyCount || alert.anomalies.length }}项)</span>
        <span class="line"></span>
      </div>

      <div class="anomaly-cards">
        <div v-for="(item, index) in alert.anomalies" :key="index" class="anomaly-card glass-card">
          <div class="card-left">
            <div class="item-label">{{ item.label }}</div>
            <div class="item-status" :class="item.status">
              {{ item.status === 'danger' ? '严重异常' : '轻度异常' }}
            </div>
          </div>

          <div class="card-center">
            <span class="item-value" :class="item.status">{{ item.value }}</span>
            <span class="item-unit">{{ item.unit }}</span>
          </div>

          <div class="card-right">
            <div class="item-range">标准范围: {{ item.range }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-section" v-if="alert.currentStatus || (alert.improvement && alert.improvement.length > 0)">
      <div class="section-divider">
        <span class="line"></span>
        <span class="text">健康评估与建议</span>
        <span class="line"></span>
      </div>

      <div class="assessment-container">
        <div class="status-panel glass-card" v-if="alert.currentStatus">
          <h4 class="panel-title">当前状态</h4>
          <div class="status-row">
            <span class="s-label">整体评估</span>
            <span class="s-value" :class="alert.currentStatus.overall?.level">
              {{ alert.currentStatus.overall?.text || '暂无' }}
            </span>
          </div>
          <div class="status-row">
            <span class="s-label">趋势分析</span>
            <span class="s-text">{{ alert.currentStatus.trend }}</span>
          </div>
        </div>

        <div class="suggestion-panel glass-card" v-if="alert.improvement && alert.improvement.length > 0">
          <h4 class="panel-title">干预建议</h4>
          <ul class="clean-list">
            <li v-for="(tip, index) in alert.improvement" :key="index">
              <i class="dot"></i><span>{{ tip }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDateTime } from '@/utils/formatters'

const props = defineProps({
  alert: { type: Object, required: true }
})

const emit = defineEmits(['action'])

const themeClass = computed(() => {
  const severity = props.alert.severity || 'info'
  return `theme-${severity}`
})

const getSeverityType = (severity) => {
  const map = { critical: 'danger', warning: 'warning', info: 'primary' }
  return map[severity] || 'info'
}

const getSeverityText = (severity) => {
  const map = { critical: '高危', warning: '警告', info: '常规' }
  return map[severity] || '通知'
}

const getAlertTypeText = (type) => {
  const map = { health: '健康预警', medication: '用药提醒', schedule: '日程提醒', emergency: '紧急事件' }
  return map[type] || '通知'
}

const handleAction = (action) => {
  emit('action', action)
}
</script>

<style scoped>
.alert-detail {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #2c3e50;
  width: 100%;
  padding: 32px;
  border-radius: 20px;
  box-sizing: border-box;
  transition: all 0.5s ease;
  --theme-bg: linear-gradient(135deg, #f0f7ff 0%, #e1ebf8 100%);
  --theme-primary: #409eff;
  --theme-glass-bg: rgba(255, 255, 255, 0.55);
  --theme-glass-border: rgba(255, 255, 255, 0.8);
  --theme-shadow: rgba(64, 158, 255, 0.08);
}

.alert-detail.theme-critical {
  --theme-bg: linear-gradient(135deg, #fff0f0 0%, #fce3e3 100%);
  --theme-primary: #f56c6c;
  --theme-shadow: rgba(245, 108, 108, 0.1);
}

.alert-detail.theme-warning {
  --theme-bg: linear-gradient(135deg, #fff8e6 0%, #faecd8 100%);
  --theme-primary: #e6a23c;
  --theme-shadow: rgba(230, 162, 60, 0.1);
}

.alert-detail {
  background: var(--theme-bg);
  box-shadow: 0 10px 30px var(--theme-shadow);
}

.glass-card {
  background: var(--theme-glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--theme-glass-border);
  border-radius: 12px;
  box-shadow: 0 4px 16px var(--theme-shadow);
}

.severity-section {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
}
.severity-tag {
  padding: 0 28px;
  height: 34px;
  line-height: 32px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
  box-shadow: 0 4px 12px var(--theme-shadow);
  z-index: 2;
}

.basic-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 24px;
  margin-bottom: 24px;
}
.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.info-item .label {
  font-size: 13px;
  color: #7b8a9c;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.info-item .value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}
.time-value { font-family: "SFMono-Regular", Consolas, monospace; font-size: 15px !important; }

.content-box {
  padding: 20px 32px;
  border-radius: 8px;
  border-left: 4px solid var(--theme-primary);
  border-right: 4px solid var(--theme-primary);
  margin-bottom: 32px;
}
.content-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.8;
  color: #475669;
  text-align: center;
}

.section-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 32px 0 24px 0;
}
.section-divider .line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--theme-primary), transparent);
  opacity: 0.3;
}
.section-divider .text {
  padding: 0 20px;
  font-size: 16px;
  font-weight: bold;
  color: var(--theme-primary);
  letter-spacing: 1px;
}

.anomaly-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.anomaly-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
}
.card-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.item-label { font-size: 16px; font-weight: 600; color: #2c3e50; }
.item-status { font-size: 13px; font-weight: 500; }
.item-status.danger { color: #f56c6c; }
.item-status.warning { color: #e6a23c; }

.card-center {
  flex: 1;
  text-align: center;
  position: relative;
}
.item-value { font-size: 32px; font-weight: 800; font-family: Arial, sans-serif; }
.item-value.danger { color: #f56c6c; text-shadow: 0 2px 8px rgba(245,108,108,0.2); }
.item-value.warning { color: #e6a23c; }
.item-value.normal { color: #67c23a; }
.item-unit { font-size: 14px; color: #7b8a9c; margin-left: 4px; font-weight: 500; }

.card-right {
  flex: 1;
  text-align: right;
}
.item-range {
  font-size: 13px;
  color: #7b8a9c;
  background: rgba(0,0,0,0.04);
  padding: 6px 14px;
  border-radius: 20px;
  display: inline-block;
}

.assessment-container {
  display: flex;
  gap: 20px;
}
.status-panel, .suggestion-panel {
  flex: 1;
  padding: 24px;
}
.panel-title {
  margin: 0 0 16px 0;
  font-size: 15px;
  color: var(--theme-primary);
  text-align: center;
}
.status-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(0,0,0,0.05);
}
.status-row:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
.s-label { font-size: 14px; color: #7b8a9c; }
.s-value, .s-text { font-size: 15px; font-weight: 600; color: #2c3e50; }
.s-value.danger { color: #f56c6c; }
.s-value.warning { color: #e6a23c; }

.clean-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.clean-list li {
  font-size: 14px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}
.dot {
  width: 8px;
  height: 8px;
  background: var(--theme-primary);
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 6px var(--theme-primary);
}

@media (max-width: 768px) {
  .assessment-container {
    flex-direction: column;
  }
  .card-center { margin: 16px 0; }
  .anomaly-card { flex-direction: column; text-align: center; }
  .card-left, .card-right { align-items: center; text-align: center; }
}
</style>