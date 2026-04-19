<template>
  <div class="alert-list">
    <div v-for="alert in alerts" :key="alert.id" class="alert-item" :class="{ 'alert-unread': !alert.read }">
      <div class="alert-content" @click="$emit('view', alert)">
        <!-- 左侧状态图标 -->
        <div class="alert-status">
          <div class="status-icon" :class="`status-${alert.severity}`">
            <el-icon v-if="alert.severity === 'critical'"><Warning /></el-icon>
            <el-icon v-else-if="alert.severity === 'warning'"><Warning /></el-icon>
            <el-icon v-else><InfoFilled /></el-icon>
          </div>
        </div>

        <!-- 中间内容 -->
        <div class="alert-main">
          <div class="alert-header">
            <div class="alert-title">{{ alert.title }}</div>
            <div class="alert-tags">
              <el-tag :type="getSeverityType(alert.severity)" size="small" effect="plain">
                {{ getSeverityText(alert.severity) }}
              </el-tag>
              <el-tag v-if="alert.parentName" size="small" type="info">
                {{ alert.parentName }}
              </el-tag>
            </div>
          </div>
          
          <div class="alert-description">
            {{ alert.content }}
          </div>
          
          <div class="alert-meta">
            <div class="meta-item">
              <el-icon><Clock /></el-icon>
              <span>{{ formatTime(alert.timestamp) }}</span>
            </div>
            <div class="meta-item">
              <el-icon><User /></el-icon>
              <span>{{ getAlertTypeText(alert.type) }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧操作 -->
        <div class="alert-actions">
          <div class="action-buttons">
            <el-button
              v-for="(action, index) in alert.actions"
              :key="index"
              size="small"
              :type="index === 0 ? 'primary' : 'default'"
              text
              @click.stop="$emit('action', { alert, action })"
            >
              {{ action }}
            </el-button>
          </div>
          
          <div class="action-menu">
            <el-dropdown @command="handleCommand($event, alert)" trigger="click">
              <el-button size="small" text circle>
                <el-icon><More /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="!alert.read"
                    command="mark-read"
                    icon="CircleCheck"
                  >
                    标记为已读
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-else
                    command="mark-unread"
                    icon="CircleClose"
                  >
                    标记为未读
                  </el-dropdown-item>
                  <el-dropdown-item command="view" icon="View">
                    查看详情
                  </el-dropdown-item>
                  <el-divider />
                  <el-dropdown-item
                    command="delete"
                    icon="Delete"
                    class="delete-item"
                  >
                    删除提醒
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { formatTime } from '@/utils/formatters'
import {
  Warning,
  InfoFilled,
  Clock,
  User,
  More,
  CircleCheck,
  CircleClose,
  View,
  Delete
} from '@element-plus/icons-vue'


const props = defineProps({
  alerts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['view', 'action', 'mark-read', 'mark-unread', 'delete'])

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

const handleCommand = (command, alert) => {
  switch (command) {
    case 'mark-read':
      emit('mark-read', alert.id)
      break
    case 'mark-unread':
      // 标记为未读逻辑
      console.log('标记为未读:', alert.id)
      break
    case 'view':
      emit('view', alert)
      break
    case 'delete':
      emit('delete', alert.id)
      break
  }
}
</script>

<style scoped>
.alert-list {
  display: flex;
  flex-direction: column;
}

.alert-item {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-item:hover {
  background-color: #fafafa;
}

.alert-item.alert-unread {
  background-color: #f0f9ff;
}

.alert-item.alert-unread:hover {
  background-color: #e6f7ff;
}

.alert-content {
  display: flex;
  padding: 16px 20px;
  gap: 16px;
  cursor: pointer;
  align-items: flex-start;
}

.alert-status {
  flex-shrink: 0;
}

.status-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-critical {
  background-color: #fff2f0;
  color: #f56c6c;
}

.status-warning {
  background-color: #fff7e6;
  color: #e6a23c;
}

.status-info {
  background-color: #f0f9ff;
  color: #409eff;
}

.alert-main {
  flex: 1;
  min-width: 0;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 12px;
}

.alert-title {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  line-height: 1.4;
}

.alert-tags {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.alert-description {
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.alert-meta {
  display: flex;
  gap: 16px;
  color: #909399;
  font-size: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item .el-icon {
  font-size: 12px;
}

.alert-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons :deep(.el-button) {
  background: #ffffff;
  border: 1px solid #d9f7be;
  color: #52c41a;
}

.action-buttons :deep(.el-button:hover) {
  background: #f0f9eb;
  border-color: #52c41a;
  color: #52c41a;
}

.action-buttons :deep(.el-button--primary) {
  background: #ffffff;
  border: 1px solid #52c41a;
  color: #52c41a;
}

.action-buttons :deep(.el-button--primary:hover) {
  background: #f0f9eb;
  border-color: #73d13d;
}

.action-menu {
  margin-top: auto;
}

.delete-item {
  color: #f56c6c;
}

:deep(.el-button--small) {
  padding: 5px 8px;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>