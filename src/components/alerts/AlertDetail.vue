<template>
  <div class="alert-detail">
    <!-- 严重程度标签 -->
    <div class="severity-badge">
      <el-tag :type="getSeverityType(alert.severity)" size="large" effect="dark">
        {{ getSeverityText(alert.severity) }}
      </el-tag>
    </div>

    <!-- 基本信息 -->
    <div class="basic-info">
      <div class="info-row">
        <div class="info-label">标题：</div>
        <div class="info-value">{{ alert.title }}</div>
      </div>
      
      <div class="info-row">
        <div class="info-label">时间：</div>
        <div class="info-value">{{ formatDateTime(alert.timestamp) }}</div>
      </div>
      
      <div class="info-row">
        <div class="info-label">相关父母：</div>
        <div class="info-value">
          <el-tag type="info">{{ alert.parentName }}</el-tag>
        </div>
      </div>
      
      <div class="info-row">
        <div class="info-label">提醒类型：</div>
        <div class="info-value">{{ getAlertTypeText(alert.type) }}</div>
      </div>
    </div>

    <!-- 详细内容 -->
    <div class="detail-content">
      <h4>详细描述</h4>
      <div class="content-text">{{ alert.content }}</div>
    </div>

    <!-- 健康数据（如果是健康预警） -->
    <div v-if="alert.type === 'health' && healthData" class="health-data">
      <h4>相关健康数据</h4>
      <div class="data-grid">
        <div class="data-item" v-for="item in healthData" :key="item.label">
          <div class="data-label">{{ item.label }}：</div>
          <div class="data-value" :class="item.status">
            {{ item.value }} <span class="data-unit">{{ item.unit }}</span>
          </div>
          <div class="data-range">正常范围：{{ item.range }}</div>
        </div>
      </div>
    </div>

    <!-- 用药信息（如果是用药提醒） -->
    <div v-if="alert.type === 'medication' && medicationData" class="medication-data">
      <h4>用药信息</h4>
      <div class="medication-info">
        <div class="info-item">
          <span class="label">药品名称：</span>
          <span class="value">{{ medicationData.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">剂量：</span>
          <span class="value">{{ medicationData.dosage }}</span>
        </div>
        <div class="info-item">
          <span class="label">服用时间：</span>
          <span class="value">{{ medicationData.time }}</span>
        </div>
        <div class="info-item">
          <span class="label">服用频次：</span>
          <span class="value">{{ medicationData.frequency }}</span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button
        v-for="(action, index) in alert.actions"
        :key="index"
        :type="index === 0 ? 'primary' : 'default'"
        size="large"
        @click="handleAction(action)"
      >
        {{ action }}
      </el-button>
      
      <el-button @click="handleIgnore">忽略</el-button>
    </div>

    <!-- 处理记录 -->
    <div v-if="alert.history && alert.history.length > 0" class="history-section">
      <h4>处理记录</h4>
      <div class="history-list">
        <div v-for="record in alert.history" :key="record.time" class="history-item">
          <div class="history-time">{{ formatTime(record.time) }}</div>
          <div class="history-action">{{ record.action }}</div>
          <div class="history-user">{{ record.user }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDateTime, formatTime } from '@/utils/formatters'

const props = defineProps({
  alert: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['action'])

const getSeverityType = (severity) => {
  const map = {
    critical: 'danger',
    warning: 'warning',
    info: 'info'
  }
  return map[severity] || 'info'
}

const getSeverityText = (severity) => {
  const map = {
    critical: '紧急',
    warning: '警告',
    info: '通知'
  }
  return map[severity] || '通知'
}

const getAlertTypeText = (type) => {
  const map = {
    health: '健康预警',
    medication: '用药提醒',
    schedule: '日程提醒',
    emergency: '紧急事件'
  }
  return map[type] || '通知'
}

// 模拟健康数据
const healthData = computed(() => {
  if (props.alert.type !== 'health') return null
  
  return [
    {
      label: '心率',
      value: 85,
      unit: 'BPM',
      range: '60-100',
      status: 'warning'
    },
    {
      label: '收缩压',
      value: 150,
      unit: 'mmHg',
      range: '<140',
      status: 'danger'
    },
    {
      label: '舒张压',
      value: 95,
      unit: 'mmHg',
      range: '<90',
      status: 'danger'
    }
  ]
})

// 模拟用药数据
const medicationData = computed(() => {
  if (props.alert.type !== 'medication') return null
  
  return {
    name: '缬沙坦',
    dosage: '80mg',
    time: '08:00',
    frequency: '每日一次'
  }
})

const handleAction = (action) => {
  emit('action', action)
}

const handleIgnore = () => {
  emit('action', '忽略')
}
</script>

<style scoped>
.alert-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.severity-badge {
  text-align: center;
  margin-bottom: 10px;
}

.basic-info {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  width: 100px;
  color: #606266;
  font-size: 14px;
  text-align: right;
}

.info-value {
  flex: 1;
  color: #303133;
  font-size: 14px;
}

.detail-content {
  margin-top: 10px;
}

.detail-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.content-text {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.health-data,
.medication-data {
  margin-top: 10px;
}

.health-data h4,
.medication-data h4 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.data-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
}

.data-label {
  color: #909399;
  font-size: 12px;
  margin-bottom: 4px;
}

.data-value {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.data-value.warning {
  color: #e6a23c;
}

.data-value.danger {
  color: #f56c6c;
}

.data-value.normal {
  color: #67c23a;
}

.data-unit {
  font-size: 12px;
  color: #909399;
  margin-left: 2px;
}

.data-range {
  color: #909399;
  font-size: 11px;
}

.medication-info {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  width: 100px;
  color: #606266;
  font-size: 14px;
}

.info-item .value {
  flex: 1;
  color: #303133;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.history-section {
  margin-top: 20px;
}

.history-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.history-list {
  background: #fafafa;
  border-radius: 6px;
  padding: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-time {
  width: 120px;
  color: #909399;
  font-size: 12px;
}

.history-action {
  flex: 1;
  color: #303133;
  font-size: 13px;
}

.history-user {
  color: #409eff;
  font-size: 12px;
}
</style>