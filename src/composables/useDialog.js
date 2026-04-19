import { ref, shallowRef } from 'vue'

// 全局弹窗实例
const dialogInstance = shallowRef(null)

// 设置弹窗实例
export const setDialogInstance = (instance) => {
  dialogInstance.value = instance
}

// 提示消息
export const showMessage = (message, type = 'info', duration = 3000) => {
  if (dialogInstance.value) {
    dialogInstance.value.open({
      title: type === 'success' ? '成功' : type === 'error' ? '错误' : type === 'warning' ? '警告' : '提示',
      message,
      type,
      width: '360px',
      buttons: [{ text: '知道了', type: 'primary' }]
    })
  }
}

// 确认框
export const showConfirm = (options) => {
  const {
    title = '确认',
    message = '确定要执行此操作吗？',
    type = 'warning',
    confirmText = '确定',
    cancelText = '取消',
    onConfirm,
    onCancel
  } = options

  return new Promise((resolve, reject) => {
    if (dialogInstance.value) {
      dialogInstance.value.open({
        title,
        message,
        type,
        width: '400px',
        buttons: [
          {
            text: cancelText,
            type: 'default',
            plain: true,
            callback: () => {
              if (onCancel) onCancel()
              reject(new Error('cancel'))
            }
          },
          {
            text: confirmText,
            type: 'primary',
            loading: false,
            callback: () => {
              if (onConfirm) {
                onConfirm()
              }
              resolve(true)
            }
          }
        ],
        onConfirm: () => {
          if (onConfirm) {
            onConfirm()
          }
          resolve(true)
        },
        onCancel: () => {
          if (onCancel) onCancel()
          reject(new Error('cancel'))
        }
      })
    } else {
      reject(new Error('dialog not initialized'))
    }
  })
}

// 成功提示
export const success = (message) => showMessage(message, 'success')

// 错误提示
export const error = (message) => showMessage(message, 'error')

// 警告提示
export const warning = (message) => showMessage(message, 'warning')

// 信息提示
export const info = (message) => showMessage(message, 'info')

// 关闭弹窗
export const closeDialog = () => {
  if (dialogInstance.value) {
    dialogInstance.value.close()
  }
}