<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="visible" class="global-modal-overlay" @click.self="handleClose">
        <div class="global-modal" :class="[`modal-${type}`]" :style="{ width }">
          <div class="modal-header">
            <div class="modal-title">{{ title }}</div>
            <button v-if="showClose" class="modal-close" @click="handleClose">
              <el-icon><Close /></el-icon>
            </button>
          </div>
          <div class="modal-body">
            <div class="modal-icon-wrap">
              <el-icon class="modal-icon" :class="type">
                <SuccessFilled v-if="type === 'success'" />
                <WarningFilled v-else-if="type === 'warning'" />
                <CircleCloseFilled v-else-if="type === 'error'" />
                <InfoFilled v-else />
              </el-icon>
            </div>
            <div class="modal-message">{{ message }}</div>
          </div>
          <div class="modal-footer">
            <el-button
              v-for="btn in buttons"
              :key="btn.text"
              :type="btn.type"
              :plain="btn.plain"
              :loading="btn.loading"
              @click="handleButtonClick(btn)"
            >
              {{ btn.text }}
            </el-button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled,
  InfoFilled,
  Close
} from '@element-plus/icons-vue'

const emit = defineEmits(['ready'])

const visible = ref(false)
const title = ref('提示')
const message = ref('')
const type = ref('info')
const width = ref('400px')
const showClose = ref(true)
const buttons = ref([])
const onConfirm = ref(null)
const onCancel = ref(null)

const open = (options) => {
  const {
    title: optTitle = '提示',
    message: optMessage = '',
    type: optType = 'info',
    width: optWidth = '400px',
    showClose: optShow = true,
    buttons: optButtons = [],
    onConfirm: optConfirm,
    onCancel: optCancel
  } = options

  title.value = optTitle
  message.value = optMessage
  type.value = optType
  width.value = optWidth
  showClose.value = optShow
  onConfirm.value = optConfirm
  onCancel.value = optCancel

  if (optButtons.length > 0) {
    buttons.value = optButtons
  } else {
    buttons.value = [{ text: '确定', type: 'primary' }]
  }

  visible.value = true
}

const handleClose = () => {
  visible.value = false
  if (onCancel.value) {
    onCancel.value()
  }
}

const handleButtonClick = (btn) => {
  if (btn.loading) return
  if (btn.callback) {
    btn.callback()
  }
  handleClose()
}

onMounted(() => {
  emit('ready', { open, close: () => { visible.value = false } })
})

defineExpose({
  open,
  close: () => { visible.value = false }
})
</script>

<style>
.global-modal-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, rgba(148, 163, 184, 0.3) 0%, rgba(15, 23, 42, 0.6) 100%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.global-modal {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 100%;
  overflow: hidden;
  animation: modal-enter 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #909399;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #303133;
}

.modal-body {
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.modal-icon-wrap {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon-wrap.success { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); }
.modal-icon-wrap.warning { background: linear-gradient(135deg, #FFF8E1, #FFECB3); }
.modal-icon-wrap.error { background: linear-gradient(135deg, #FFEBEE, #FFCDD2); }
.modal-icon-wrap.info { background: linear-gradient(135deg, #E3F2FD, #BBDEFB); }

.modal-icon { font-size: 24px; }
.modal-icon.success { color: #4CAF50; }
.modal-icon.warning { color: #FF9800; }
.modal-icon.error { color: #F44336; }
.modal-icon.info { color: #2196F3; }

.modal-message {
  flex: 1;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  word-break: break-all;
}

.modal-footer {
  padding: 16px 24px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #f0f0f0;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>