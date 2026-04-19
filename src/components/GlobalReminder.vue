<template>
  <Transition name="fade-scale">
    <div v-if="showReminder" class="medical-reminder-overlay" @click="closeReminder">
      <div class="medical-reminder-modal" @click.stop>

        <button class="close-btn" @click="closeReminder" title="关闭">
          <svg viewBox="0 0 24 24" width="100%" height="100%">
            <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        </button>

        <div class="reminder-icon-container">
          <div class="pulse-ring"></div>
          <div class="reminder-icon floating-anim">
            <svg v-if="reminderTodo.todoType === 'medication'" t="1766026923152" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <path d="M830.08 193.92a224.810667 224.810667 0 0 1 0 318.08l-159.146667 159.146667-318.08-318.293334L512 193.92a224.810667 224.810667 0 0 1 318.08 0z" fill="#729A80"></path>
              <path d="M193.92 830.08a224.810667 224.810667 0 0 1 0-318.08l159.146667-159.146667 318.08 318.08L512 830.08a224.810667 224.810667 0 0 1-318.08 0z" fill="#E8C678"></path>
            </svg>

            <svg v-else t="1766030259524" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <path d="M105.5 390.3c-1.5 0-2.9-0.3-4.4-0.4-0.8 138.4-4.9 319.8-1.4 420.2 1.2 34.7 19.3 58.1 51.4 59.4 208.3 8.7 513.3 7.8 718.4 6.4 28.8-0.2 41.3-20 42.3-47.3 3.9-98.4 10-293.6 10.1-439.1-2.3 0.4-4.7 0.7-7.1 0.7H105.5z" fill="#A8C4B1"></path>
              <path d="M914.9 141.9H105.5c-23.6 0-42.8 19.2-42.8 42.8v162.9c0 22.1 16.9 40.1 38.4 42.3 0.2-31.4 0.2-60.7-0.1-86.2-0.6-48.8 44.5-63.8 67.8-65.2 162.9-9.9 492-11.6 672.1-7.9 65 1.3 78.4 19.8 79.7 54.7 1.1 29.2 1.5 64.9 1.5 104.3 20.2-3.4 35.7-20.9 35.7-42.1V184.7c-0.1-23.6-19.2-42.8-42.9-42.8z" fill="#729A80"></path>
              <path d="M840.9 230.6c-180.1-3.7-509.2-2-672.1 7.9-23.3 1.4-68.4 16.4-67.8 65.2 0.3 25.5 0.3 54.8 0.1 86.2 1.5 0.2 2.9 0.4 4.4 0.4h809.4c2.4 0 4.8-0.3 7.1-0.7 0-39.4-0.4-75.2-1.5-104.3-1.2-34.9-14.6-53.3-79.6-54.7z" fill="#5A7D65"></path>
              <path d="M489.5 723.2c-9.7 0-19.3-3.7-26.7-11.1l-85.3-85.3c-14.7-14.7-14.7-38.6 0-53.4 14.7-14.7 38.6-14.7 53.4 0l58.7 58.6 117.2-117.2c14.7-14.7 38.6-14.7 53.4 0 14.7 14.7 14.7 38.6 0 53.4l-144 143.9c-7.4 7.4-17 11.1-26.7 11.1z" fill="#E8C678"></path>
            </svg>
          </div>
        </div>

        <h2 class="reminder-title">
          {{ reminderTodo.todoType === 'medication' ? '温馨用药提醒' : '重要日程提醒' }}
        </h2>

        <div class="reminder-content">
          <div class="event-name-wrapper">
            <div class="event-name">{{ reminderTodo.eventName }}</div>
          </div>

          <div class="event-details">
            <div class="detail-item">
              <span class="detail-label">时间</span>
              <span class="detail-value time-highlight">
                {{ formatDate(reminderTodo.startDate) }} {{ formatTime(reminderTodo.startTime) }}
                <span v-if="reminderTodo.todoType === 'schedule'">
                  <br/>至 {{ formatDate(reminderTodo.endDate) }} {{ formatTime(reminderTodo.endTime) }}
                </span>
              </span>
            </div>

            <div v-if="reminderTodo.todoType === 'medication'" class="detail-item">
              <span class="detail-label">剂量</span>
              <span class="detail-value dosage-highlight">{{ reminderTodo.dosage || '未设置' }}</span>
            </div>

            <div v-if="reminderTodo.location" class="detail-item">
              <span class="detail-label">地点</span>
              <span class="detail-value">{{ reminderTodo.location }}</span>
            </div>

            <div v-if="reminderTodo.remarks" class="detail-item">
              <span class="detail-label">备注</span>
              <span class="detail-value remarks-text">{{ reminderTodo.remarks }}</span>
            </div>
          </div>
        </div>

        <div class="reminder-actions">
          <button @click="snoozeReminder" class="action-btn snooze-btn" :disabled="isUpdating">
            稍后提醒
          </button>
          <button @click="markAsDone" class="action-btn complete-btn" :disabled="isUpdating">
            <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            {{ isUpdating ? '处理中...' : '标记完成' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  showReminder: { type: Boolean, default: false },
  reminderTodo: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'markAsDone', 'snoozeReminder'])
const isUpdating = ref(false)

const formatTime = (time) => {
  if (!time) return '未设置'
  if (time.includes(':')) return time.substring(0, 5)
  return time
}

const formatDate = (date) => {
  if (!date) return '未设置'
  if (typeof date === 'string') date = new Date(date)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const closeReminder = () => emit('close')

const markAsDone = async () => {
  if (isUpdating.value) return
  isUpdating.value = true
  try {
    await emit('markAsDone', props.reminderTodo.id)
    ElMessage.success('已完成，真棒！继续保持健康作息~')
  } catch (error) {
    ElMessage.error('更新状态失败: ' + (error.message || '未知错误'))
  } finally {
    isUpdating.value = false
  }
}

const snoozeReminder = () => emit('snoozeReminder')
</script>

<style scoped>
/* 蒙层：毛玻璃质感，偏暖色调 */
.medical-reminder-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(40, 50, 45, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
}

/* 弹窗主体：白与暖绿的渐变，圆润边缘，柔和阴影 */
.medical-reminder-modal {
  background: linear-gradient(160deg, #FFFFFF 0%, #F4F8F5 100%);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(80, 110, 90, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.9);
  width: 320px;
  max-width: 90%;
  position: relative;
  padding: 0.25rem 0.15rem 0.2rem;
}

/* 动画过渡 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

/* 高级感关闭按钮 */
.close-btn {
  position: absolute;
  top: 0.12rem;
  right: 0.12rem;
  width: 0.24rem;
  height: 0.24rem;
  background: #EAF0EC;
  color: #729A80;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  transition: all 0.3s ease;
  padding: 0.04rem;
}
.close-btn:hover {
  background: #FFECEC;
  color: #E27B7B;
  transform: rotate(90deg) scale(1.1);
}

/* 图标容器与特效 */
.reminder-icon-container {
  display: flex;
  justify-content: center;
  position: relative;
  margin: 0.1rem 0 0.15rem;
  height: 0.7rem;
}

/* 无限扩散的涟漪光环 */
.pulse-ring {
  position: absolute;
  width: 0.6rem;
  height: 0.6rem;
  background: #D4E2D8;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulsing 2.5s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
  z-index: 1;
}

@keyframes pulsing {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
}

/* 悬浮动画的图标 */
.reminder-icon {
  position: relative;
  width: 0.55rem;
  height: 0.55rem;
  z-index: 2;
  background: #FFFFFF;
  border-radius: 50%;
  padding: 0.12rem;
  box-shadow: 0 8px 20px rgba(114, 154, 128, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-anim {
  animation: floating 3s ease-in-out infinite;
}

@keyframes floating {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* 标题 */
.reminder-title {
  color: #4A6B56;
  text-align: center;
  font-size: 0.16rem;
  font-weight: 700;
  margin: 0 0 0.15rem 0;
  letter-spacing: 1px;
}

/* 提醒内容区 */
.reminder-content {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 0.15rem;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.02);
  border: 1px solid #EAF0EC;
  margin-bottom: 0.15rem;
}

/* 事项名称标签 */
.event-name-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 0.12rem;
}
.event-name {
  font-size: 0.13rem;
  font-weight: 700;
  color: #3E5A47;
  padding: 0.06rem 0.15rem;
  background: linear-gradient(135deg, #EAF2ED 0%, #D8E5DB 100%);
  border-radius: 20px;
  display: inline-block;
}

/* 详情列表 */
.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
}

.detail-item {
  display: flex;
  align-items: baseline;
  font-size: 0.11rem;
  line-height: 1.5;
}

.detail-label {
  font-weight: 600;
  color: #8DA897;
  min-width: 0.4rem;
  flex-shrink: 0;
  position: relative;
}
.detail-label::after {
  content: "•";
  position: absolute;
  left: -0.1rem;
  color: #C1D5C7;
}

.detail-value {
  color: #5C7565;
  flex: 1;
  word-break: break-all;
}

.time-highlight {
  color: #E29F47;
  font-weight: 600;
}

.dosage-highlight {
  color: #E27B7B;
  font-weight: 600;
  background: #FFF1F1;
  padding: 0 0.05rem;
  border-radius: 4px;
}

.remarks-text {
  font-style: italic;
  color: #8C9C92;
}

/* 底部操作按钮 */
.reminder-actions {
  display: flex;
  gap: 0.1rem;
}

.action-btn {
  flex: 1;
  padding: 0.1rem 0.05rem;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-size: 0.12rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.05rem;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.action-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

/* 稍后提醒 (暖黄色调) */
.snooze-btn {
  background: #FCF4E3;
  color: #A67D3B;
  border: 1px solid #F3E6C8;
}
.snooze-btn:hover:not(:disabled) {
  background: #FDF9F0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(166, 125, 59, 0.15);
}

/* 完成按钮 (主亚绿色调) */
.complete-btn {
  background: linear-gradient(135deg, #7FA78E 0%, #638C73 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 140, 115, 0.3);
}
.complete-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #8CB89C 0%, #6F9D81 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 140, 115, 0.4);
}

.action-icon {
  width: 0.14rem;
  height: 0.14rem;
  fill: currentColor;
}

@media (max-width: 480px) {
  .medical-reminder-modal {
    width: 85%;
    padding: 0.2rem 0.12rem 0.15rem;
  }
  .reminder-title { font-size: 0.15rem; }
  .event-name { font-size: 0.12rem; }
  .detail-item { font-size: 0.1rem; }
}
</style>