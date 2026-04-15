<template>
  <div v-if="showReminder" class="medical-reminder-overlay" @click="closeReminder">
    <div class="medical-reminder-modal" @click.stop>
      <button class="close-btn" @click="closeReminder">×</button>

      <div class="reminder-icon-container">
        <div class="reminder-icon" :class="{ 'medication': reminderTodo.todoType === 'medication', 'schedule': reminderTodo.todoType === 'schedule' }">
          <svg v-if="reminderTodo.todoType === 'medication'" t="1766026923152" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5806" width="200" height="200">
            <path d="M830.08 193.92a224.810667 224.810667 0 0 1 0 318.08l-159.146667 159.146667-318.08-318.293334L512 193.92a224.810667 224.810667 0 0 1 318.08 0z" fill="#2D572D" p-id="5807"></path><path d="M193.92 830.08a224.810667 224.810667 0 0 1 0-318.08l159.146667-159.146667 318.08 318.08L512 830.08a224.810667 224.810667 0 0 1-318.08 0z" fill="#3d7a3d" p-id="5808"></path>
          </svg>

          <svg v-else t="1766030259524" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6889" width="200" height="200">
            <path d="M105.5 390.3c-1.5 0-2.9-0.3-4.4-0.4-0.8 138.4-4.9 319.8-1.4 420.2 1.2 34.7 19.3 58.1 51.4 59.4 208.3 8.7 513.3 7.8 718.4 6.4 28.8-0.2 41.3-20 42.3-47.3 3.9-98.4 10-293.6 10.1-439.1-2.3 0.4-4.7 0.7-7.1 0.7H105.5z" fill="#2D572D" p-id="6890"></path><path d="M914.9 141.9H105.5c-23.6 0-42.8 19.2-42.8 42.8v162.9c0 22.1 16.9 40.1 38.4 42.3 0.2-31.4 0.2-60.7-0.1-86.2-0.6-48.8 44.5-63.8 67.8-65.2 162.9-9.9 492-11.6 672.1-7.9 65 1.3 78.4 19.8 79.7 54.7 1.1 29.2 1.5 64.9 1.5 104.3 20.2-3.4 35.7-20.9 35.7-42.1V184.7c-0.1-23.6-19.2-42.8-42.9-42.8z" fill="#3d7a3d" p-id="6891"></path><path d="M840.9 230.6c-180.1-3.7-509.2-2-672.1 7.9-23.3 1.4-68.4 16.4-67.8 65.2 0.3 25.5 0.3 54.8 0.1 86.2 1.5 0.2 2.9 0.4 4.4 0.4h809.4c2.4 0 4.8-0.3 7.1-0.7 0-39.4-0.4-75.2-1.5-104.3-1.2-34.9-14.6-53.3-79.6-54.7z" fill="#2D572D" p-id="6892"></path><path d="M489.5 723.2c-9.7 0-19.3-3.7-26.7-11.1l-85.3-85.3c-14.7-14.7-14.7-38.6 0-53.4 14.7-14.7 38.6-14.7 53.4 0l58.7 58.6 117.2-117.2c14.7-14.7 38.6-14.7 53.4 0 14.7 14.7 14.7 38.6 0 53.4l-144 143.9c-7.4 7.4-17 11.1-26.7 11.1z" fill="#3d7a3d" p-id="6893"></path>
          </svg>
        </div>
      </div>

      <h2 class="reminder-title">
        {{ reminderTodo.todoType === 'medication' ? '用药提醒' : '日程提醒' }}
      </h2>

      <div class="reminder-content">
        <div class="event-name">{{ reminderTodo.eventName }}</div>

        <div class="event-details">
          <div class="detail-item">
            <span class="detail-label">时间：</span>
            <span class="detail-value">
              {{ formatDate(reminderTodo.startDate) }} {{ formatTime(reminderTodo.startTime) }}
              <span v-if="reminderTodo.todoType === 'schedule'">
                至 {{ formatDate(reminderTodo.endDate) }} {{ formatTime(reminderTodo.endTime) }}
              </span>
            </span>
          </div>

          <div v-if="reminderTodo.todoType === 'medication'" class="detail-item">
            <span class="detail-label">剂量：</span>
            <span class="detail-value">{{ reminderTodo.dosage || '未设置' }}</span>
          </div>

          <div v-if="reminderTodo.location" class="detail-item">
            <span class="detail-label">地点：</span>
            <span class="detail-value">{{ reminderTodo.location }}</span>
          </div>

          <div v-if="reminderTodo.remarks" class="detail-item">
            <span class="detail-label">备注：</span>
            <span class="detail-value">{{ reminderTodo.remarks }}</span>
          </div>
        </div>
      </div>

      <div class="reminder-actions">
        <button @click="markAsDone" class="action-btn complete-btn" :disabled="isUpdating">
          <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          {{ isUpdating ? '处理中...' : '已完成' }}
        </button>
        <button @click="snoozeReminder" class="action-btn snooze-btn" :disabled="isUpdating">
          <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6H12v6l4.5 2.67-.75 1.23L11 16v-6H7.5l.75-1.23L12 11.47l3.75-2.23z"/>
          </svg>
          稍后提醒
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  showReminder: {
    type: Boolean,
    default: false
  },
  reminderTodo: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'markAsDone', 'snoozeReminder'])

const isUpdating = ref(false)

const formatTime = (time) => {
  if (!time) return '未设置'
  if (time.includes(':')) {
    return time.substring(0, 5)
  }
  return time
}

const formatDate = (date) => {
  if (!date) return '未设置'
  if (typeof date === 'string') {
    date = new Date(date)
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const closeReminder = () => {
  emit('close')
}

const markAsDone = async () => {
  if (isUpdating.value) return

  isUpdating.value = true
  try {
    await emit('markAsDone', props.reminderTodo.id)
    ElMessage.success('标记为已完成！')
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败: ' + (error.message || '未知错误'))
  } finally {
    isUpdating.value = false
  }
}

const snoozeReminder = () => {
  emit('snoozeReminder')
}
</script>

<style scoped>
.medical-reminder-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.medical-reminder-modal {
  background: white;
  border-radius: 0.075rem;
  box-shadow: 0 0.1rem 0.3rem rgba(0, 0, 0, 0.2);
  border: 0.005rem solid #e2e8f0;
  width: 320px;
  max-width: 90%;
  animation: slideIn 0.3s ease;
  position: relative;
  overflow: hidden;
  padding: 0.15rem;
}

@keyframes slideIn {
  from {
    transform: scale(0.8) translateY(-0.5rem);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 0.075rem;
  right: 0.075rem;
  width: 0.2rem;
  height: 0.2rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}

.reminder-icon-container {
  display: flex;
  justify-content: center;
  margin: 0.15rem 0 0.075rem;
}

.reminder-icon {
  width: 0.4rem;
  height: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 0.05rem;
  transition: all 0.2s ease;
}

.reminder-icon.medication {
  background: linear-gradient(135deg, #e6f3e6 0%, #c6e6c6 100%);
  fill: #2D572D;
}

.reminder-icon.schedule {
  background: linear-gradient(135deg, #e6f3e6 0%, #c6e6c6 100%);
  fill: #2D572D;
}

.reminder-title {
  color: #2D572D;
  text-align: center;
  font-size: 0.14rem;
  font-weight: 700;
  margin: 0 0 0.1rem 0;
  padding: 0 0.1rem;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.reminder-content {
  padding: 0.1rem 0.15rem 0.15rem;
  border-bottom: 0.005rem solid #e0e6ed;
}

.event-name {
  font-size: 0.12rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.1rem;
  text-align: center;
  padding: 0.05rem 0;
  background: linear-gradient(135deg, #e6f3e6 0%, #c6e6c6 100%);
  border-radius: 0.025rem;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  font-size: 0.09rem;
  line-height: 1.4;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.detail-label {
  font-weight: 600;
  color: #495057;
  min-width: 0.4rem;
  flex-shrink: 0;
}

.detail-value {
  color: #6c757d;
  flex: 1;
  word-break: break-all;
}

.reminder-actions {
  display: flex;
  gap: 0.075rem;
  padding: 0.1rem 0.15rem 0.15rem;
}

.action-btn {
  flex: 1;
  padding: 0.075rem 0.1rem;
  border: none;
  border-radius: 0.03rem;
  cursor: pointer;
  font-size: 0.09rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.05rem;
  transition: all 0.2s ease;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-0.01rem);
  box-shadow: 0 0.02rem 0.04rem rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.complete-btn {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white;
}

.snooze-btn {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  color: #212529;
}

.action-icon {
  width: 0.1rem;
  height: 0.1rem;
  fill: currentColor;
}

@media (max-width: 480px) {
  .medical-reminder-modal {
    width: 95%;
  }

  .reminder-title {
    font-size: 0.12rem;
  }

  .event-name {
    font-size: 0.1rem;
  }

  .detail-item {
    font-size: 0.08rem;
  }

  .action-btn {
    font-size: 0.08rem;
    padding: 0.05rem 0.075rem;
  }
}
</style>