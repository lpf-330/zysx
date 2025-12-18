<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TimeBox from '../components/TimeBox.vue';
import HomeMid from '../components/HomeMid.vue';
import HomeRight from '../components/HomeRight.vue';
import GlobalReminder from '../components/GlobalReminder.vue' // 导入全局提醒组件
import { getTodosByDate, updateTodoStatusMS } from '../api/user' // 导入API
import useUserInfoStore from '../stores/user'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'

const userInfoStore = storeToRefs(useUserInfoStore())
const user_id = userInfoStore.user_id.value

// 全局提醒相关数据
const showGlobalReminder = ref(false)
const globalReminderTodo = ref(null)

// 全局提醒相关方法
const showGlobalReminderModal = (todo) => {
  globalReminderTodo.value = todo
  showGlobalReminder.value = true
}

const closeGlobalReminder = () => {
  showGlobalReminder.value = false
  globalReminderTodo.value = null
}

const handleMarkAsDone = async (todoId) => {
  try {
    // 调用API更新待办事项状态
    await updateTodoStatusMS(todoId, 1) // 1表示已完成
    
    // 关闭提醒
    closeGlobalReminder()
    
    // 触发全局事件通知其他组件更新状态
    window.dispatchEvent(new CustomEvent('todoStatusChanged', { 
      detail: { id: todoId, completed: 1 } 
    }))
    
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败: ' + (error.message || '未知错误'))
    throw error
  }
}

const snoozeGlobalReminder = () => {
  // 暂停提醒10分钟
  closeGlobalReminder()
  setTimeout(() => {
    if (globalReminderTodo.value) {
      showGlobalReminderModal(globalReminderTodo.value)
    }
  }, 10 * 60 * 1000) // 10分钟
}

// 格式化日期的辅助函数
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

// 全局提醒检查函数
const checkGlobalReminders = async () => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  try {
    // 获取今天的待办事项
    const todayDate = formatDate(now)
    const response = await getTodosByDate(todayDate, user_id)
    
    // API返回格式为 { code: 200, message: "success", data: [...] }
    const todos = response.data || []
    
    // 检查每个待办事项是否需要提醒
    todos.forEach(todo => {
      if (todo.completed !== 1) { // 如果未完成
        if (todo.todoType === 'medication') {
          // 用药提醒：检查时间是否匹配
          const [hours, minutes] = todo.startTime.split(':')
          if (parseInt(hours) === currentHour && parseInt(minutes) === currentMinute) {
            showGlobalReminderModal(todo)
          }
        } else {
          // 日程提醒：检查时间是否匹配
          const [startHours, startMinutes] = todo.startTime.split(':')
          if (parseInt(startHours) === currentHour && parseInt(startMinutes) === currentMinute) {
            showGlobalReminderModal(todo)
          }
        }
      }
    })
  } catch (error) {
    console.error('检查提醒失败:', error)
  }
}

// 在页面加载时启动全局提醒检查
onMounted(() => {
  // 模拟定时检查提醒
  const globalReminderInterval = setInterval(checkGlobalReminders, 30000) // 每分钟检查一次
  
  onUnmounted(() => {
    clearInterval(globalReminderInterval)
  })
})
</script>

<template>
    <div class="mid">
        <TimeBox></TimeBox>
        <HomeMid></HomeMid>
    </div>
    <HomeRight></HomeRight>
    
    <!-- 全局提醒组件 -->
    <GlobalReminder
      :show-reminder="showGlobalReminder"
      :reminder-todo="globalReminderTodo"
      @close="closeGlobalReminder"
      @mark-as-done="handleMarkAsDone"
      @snooze-reminder="snoozeGlobalReminder"
    />
</template>

<style scoped>
.mid {
    width: 60%;
    height: 100%;
}
</style>