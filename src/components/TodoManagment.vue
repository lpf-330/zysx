<template>
  <div class="todo-management" @click.stop>
    <!-- 顶部导航栏 -->
    <div class="header">
      <h2>待办事项管理</h2>
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'medication' }]"
          @click="switchTab('medication')"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 14c0-.33-.04-.65-.1-1H19c.55 0 1-.45 1-1s-.45-1-1-1h-1.1c-.06-.35-.1-1.1-.1-1.45 0-2.43-1.76-4.44-4.07-4.78C12.69 5.27 11.5 4.39 11.5 3c0-.55-.45-1-1-1s-1 .45-1 1c0 1.39-1.19 2.27-2.23 2.77C4.96 6.11 3 8.12 3 10.55c0 .35-.04 1.1-.1 1.45H3c-.55 0-1 .45-1 1s.45 1 1 1h1.1c.06.35.1 1.1.1 1.45 0 2.43 1.76 4.44 4.07 4.78 1.04.5 2.23 1.38 2.23 2.77 0 .55.45 1 1 1s1-.45 1-1c0-1.39 1.19-2.27 2.23-2.77 2.31-.34 4.07-2.35 4.07-4.78 0-.35.04-1.1.1-1.45H19c.55 0 1-.45 1-1s-.45-1-1-1h-1.1c-.06-.35-.1-1.1-.1-1.45 0-.35.04-1.1.1-1.45H18zm-7 7c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
          </svg>
          用药计划
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'schedule' }]"
          @click="switchTab('schedule')"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
          日程安排
        </button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 添加待办表单 -->
      <div class="form-section">
        <h3>{{ activeTab === 'medication' ? '添加用药计划' : '添加日程安排' }}</h3>
        
        <!-- 待办实体选择 -->
        <div class="entity-section">
          <div class="entity-header" @click="toggleEntitySection">
            <label>快速选择已有待办实体：</label>
            <span class="toggle-icon">{{ showEntities ? '▲' : '▼' }}</span>
          </div>
          <div v-if="showEntities" class="entity-list">
            <div 
              v-for="entity in filteredEntities" 
              :key="entity.id" 
              class="entity-item"
            >
              <span class="entity-name" @click="selectEntity(entity)">
                {{ entity.name }} ({{ entity.type }})
              </span>
              <button 
                @click="deleteEntity(entity.id)"
                class="delete-entity-btn"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- 表单 -->
        <form @submit.prevent="saveTodo" class="todo-form">
          <div class="form-group">
            <label>待办名称：</label>
            <input 
              v-model="currentTodo.name" 
              type="text" 
              required
              :placeholder="activeTab === 'medication' ? '请输入药品名称' : '请输入事件名称'"
            >
          </div>

          <!-- 用药特有字段 -->
          <div v-if="activeTab === 'medication'" class="medication-fields">
            <div class="form-group">
              <label>剂量：</label>
              <input v-model="currentTodo.dosage" type="text" placeholder="如：2片">
            </div>
            <div class="form-group">
              <label>服用时间：</label>
              <input v-model="currentTodo.time" type="time" required>
            </div>
            <div class="form-group">
              <label>起止时间：</label>
              <div class="date-range">
                <input v-model="currentTodo.startDate" type="date" required>
                <span>至</span>
                <input v-model="currentTodo.endDate" type="date" required>
              </div>
            </div>
          </div>

          <!-- 日程特有字段 -->
          <div v-else class="schedule-fields">
            <div class="form-group">
              <label>开始时间：</label>
              <input v-model="currentTodo.startTime" type="datetime-local" required>
            </div>
            <div class="form-group">
              <label>结束时间：</label>
              <input v-model="currentTodo.endTime" type="datetime-local" required>
            </div>
            <div class="form-group">
              <label>地点：</label>
              <input v-model="currentTodo.location" type="text" placeholder="请输入地点">
            </div>
            <div class="form-group">
              <label>备注：</label>
              <textarea v-model="currentTodo.remarks" rows="3"></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="save-btn">
              {{ editingId ? '更新' : '保存' }}
            </button>
            <button type="button" @click="cancelEdit" class="cancel-btn">
              取消
            </button>
          </div>
        </form>
      </div>

      <!-- 当日待办列表 -->
      <div class="todo-list-section">
        <h3>今日待办事项</h3>
        
        <div class="todo-list">
          <div 
            v-for="todo in filteredTodos" 
            :key="todo.id" 
            class="todo-item"
            :class="{
              'medication-item': todo.type === 'medication',
              'schedule-item': todo.type === 'schedule',
              'overdue': isOverdue(todo),
              'completed': todo.completed
            }"
          >
            <div class="todo-header">
              <div class="todo-info">
                <span class="todo-name">{{ todo.name }}</span>
                <span class="todo-type">{{ todo.type === 'medication' ? '用药' : '日程' }}</span>
              </div>
              <div class="todo-status">
                <div class="status-indicator" :class="{ active: !todo.completed }"></div>
              </div>
            </div>
            
            <div class="todo-details">
              <div v-if="todo.type === 'medication'">
                <span>剂量：{{ todo.dosage || '未设置' }}</span>
                <span>&nbsp;|&nbsp;时间：{{ formatTime(todo.time) }}</span>
                <span>&nbsp;|&nbsp;起止：{{ formatDate(todo.startDate) }} 至 {{ formatDate(todo.endDate) }}</span>
              </div>
              <div v-else>
                <span>时间：{{ formatDateTime(todo.startTime) }} - {{ formatDateTime(todo.endTime) }}</span>
                <span v-if="todo.location">&nbsp;|&nbsp;地点：{{ todo.location }}</span>
              </div>
            </div>

            <div class="todo-actions">
              <button @click="editTodo(todo)" class="action-btn edit">
                <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </button>
              <button @click="toggleComplete(todo)" class="action-btn complete">
                <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path v-if="todo.completed" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  <path v-else d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </button>
              <button @click="deleteTodo(todo.id)" class="action-btn delete">
                <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          </div>

          <div v-if="filteredTodos.length === 0" class="empty-tips">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
              <path d="M7 12h10v2H7z"/>
            </svg>
            <p>暂无待办事项</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 提醒模态框 -->
    <div v-if="showReminder" class="reminder-modal" @click="closeReminder">
      <div class="reminder-content" @click.stop>
        <div class="close-modal" @click="closeReminder">×</div>
        <div class="reminder-icon">
          <svg v-if="reminderTodo.type === 'medication'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 14c0-.33-.04-.65-.1-1H19c.55 0 1-.45 1-1s-.45-1-1-1h-1.1c-.06-.35-.1-1.1-.1-1.45 0-2.43-1.76-4.44-4.07-4.78C12.69 5.27 11.5 4.39 11.5 3c0-.55-.45-1-1-1s-1 .45-1 1c0 1.39-1.19 2.27-2.23 2.77C4.96 6.11 3 8.12 3 10.55c0 .35-.04 1.1-.1 1.45H3c-.55 0-1 .45-1 1s.45 1 1 1h1.1c.06.35.1 1.1.1 1.45 0 2.43 1.76 4.44 4.07 4.78 1.04.5 2.23 1.38 2.23 2.77 0 .55.45 1 1 1s1-.45 1-1c0-1.39 1.19-2.27 2.23-2.77 2.31-.34 4.07-2.35 4.07-4.78 0-.35.04-1.1.1-1.45H19c.55 0 1-.45 1-1s-.45-1-1-1h-1.1c-.06-.35-.1-1.1-.1-1.45 0-.35.04-1.1.1-1.45H18zm-7 7c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
        </div>
        <h3>{{ reminderTodo.type === 'medication' ? '用药提醒' : '日程提醒' }}</h3>
        <p>{{ reminderTodo.name }}</p>
        <p v-if="reminderTodo.type === 'medication'">
          请按时服用：{{ reminderTodo.dosage }}
        </p>
        <div class="reminder-actions">
          <button @click="markAsDone" class="done-btn">已完成</button>
          <button @click="snoozeReminder" class="snooze-btn">稍后提醒</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 响应式数据
const activeTab = ref('medication')
const currentTodo = ref({
  name: '',
  type: 'medication',
  time: '',
  dosage: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  location: '',
  remarks: '',
  completed: false
})
const todos = ref([])
const entities = ref([])
const editingId = ref(null)
const selectedEntity = ref('')
const showReminder = ref(false)
const reminderTodo = ref(null)
const showEntities = ref(false)

// 计算属性
const filteredTodos = computed(() => {
  return todos.value.filter(todo => {
    const isToday = isTodayTodo(todo)
    return isToday
  })
})

const filteredEntities = computed(() => {
  return entities.value.filter(entity => 
    entity.type === activeTab.value
  )
})

// 方法
const switchTab = (tab) => {
  activeTab.value = tab
  resetForm()
}

const resetForm = () => {
  currentTodo.value = {
    name: '',
    type: activeTab.value,
    time: '',
    dosage: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    remarks: '',
    completed: false
  }
  editingId.value = null
  selectedEntity.value = ''
}

const saveTodo = () => {
  if (editingId.value) {
    // 更新现有待办
    const index = todos.value.findIndex(t => t.id === editingId.value)
    if (index !== -1) {
      todos.value[index] = { ...currentTodo.value, id: editingId.value }
    }
  } else {
    // 添加新待办
    const newTodo = {
      ...currentTodo.value,
      id: Date.now().toString(),
      type: activeTab.value,
      createdAt: new Date()
    }
    todos.value.push(newTodo)
    
    // 同时创建待办实体
    const entityExists = entities.value.some(e => e.name === newTodo.name && e.type === newTodo.type)
    if (!entityExists) {
      entities.value.push({
        id: Date.now().toString(),
        name: newTodo.name,
        type: newTodo.type
      })
    }
  }
  
  resetForm()
}

const editTodo = (todo) => {
  // 根据待办类型切换到对应的标签页
  if (todo.type !== activeTab.value) {
    activeTab.value = todo.type
  }
  
  currentTodo.value = { ...todo }
  editingId.value = todo.id
}

const cancelEdit = () => {
  resetForm()
}

const deleteTodo = (id) => {
  if (confirm('确定要删除这个待办事项吗？')) {
    todos.value = todos.value.filter(t => t.id !== id)
  }
}

const toggleComplete = (todo) => {
  todo.completed = !todo.completed
}

const selectEntity = (entity) => {
  currentTodo.value.name = entity.name
}

const deleteEntity = (id) => {
  if (confirm('确定要删除这个待办实体吗？')) {
    entities.value = entities.value.filter(e => e.id !== id)
  }
}

const toggleEntitySection = () => {
  showEntities.value = !showEntities.value
}

const isTodayTodo = (todo) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (todo.type === 'medication') {
    const startDate = new Date(todo.startDate)
    const endDate = new Date(todo.endDate)
    return todo.time && today >= startDate && today <= endDate // 在起止日期范围内
  } else {
    const todoDate = new Date(todo.startTime)
    return todoDate.toDateString() === today.toDateString()
  }
}

const isOverdue = (todo) => {
  if (todo.completed) return false
  
  const now = new Date()
  if (todo.type === 'medication') {
    const [hours, minutes] = todo.time.split(':')
    const todoTime = new Date()
    todoTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    return todoTime < now
  } else {
    const todoTime = new Date(todo.endTime)
    return todoTime < now
  }
}

const formatTime = (time) => {
  return time || '未设置'
}

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : '未设置'
}

const formatDateTime = (dateTime) => {
  return dateTime ? new Date(dateTime).toLocaleString() : '未设置'
}

// 提醒相关方法
const checkReminders = () => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  todos.value.forEach(todo => {
    if (!todo.completed) {
      if (todo.type === 'medication') {
        const [hours, minutes] = todo.time.split(':')
        if (parseInt(hours) === currentHour && parseInt(minutes) === currentMinute) {
          showMedicationReminder(todo)
        }
      }
    }
  })
}

const showMedicationReminder = (todo) => {
  reminderTodo.value = todo
  showReminder.value = true
  
  // 不同类型的提醒效果
  if (todo.type === 'medication') {
    // 用药提醒：声音+震动
    console.log('用药提醒触发')
    // 这里可以添加音频播放或震动效果
  } else {
    // 日程提醒：仅视觉提醒
    console.log('日程提醒触发')
  }
}

const markAsDone = () => {
  if (reminderTodo.value) {
    const todo = todos.value.find(t => t.id === reminderTodo.value.id)
    if (todo) {
      todo.completed = true
    }
  }
  closeReminder()
}

const snoozeReminder = () => {
  // 暂停提醒10分钟
  closeReminder()
  setTimeout(() => {
    if (reminderTodo.value) {
      showMedicationReminder(reminderTodo.value)
    }
  }, 10 * 60 * 1000) // 10分钟
}

const closeReminder = () => {
  showReminder.value = false
  reminderTodo.value = null
}

// 生命周期
onMounted(() => {
  // 初始化一些示例数据
  entities.value = [
    { id: '1', name: '降压药', type: 'medication' },
    { id: '2', name: '散步', type: 'schedule' },
    { id: '3', name: '体检', type: 'schedule' }
  ]
  
  // 模拟定时检查提醒
  const reminderInterval = setInterval(checkReminders, 60000) // 每分钟检查一次
  
  onUnmounted(() => {
    clearInterval(reminderInterval)
  })
})
</script>

<style scoped>
.todo-management {
  width: 100%;
  height: 100%;
  font-family: 'SiYuanHeiTi', 'Microsoft YaHei', Arial, sans-serif;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #5fb6ef 0%, #3a9ce6 100%);
  color: white;
  padding: 0.15rem;
  margin-bottom: 0.075rem;
  box-shadow: 0 0.02rem 0.06rem rgba(95, 182, 239, 0.3);
}

.header h2 {
  margin: 0 0 0.075rem 0;
  font-size: 0.15rem;
  font-weight: 700;
  text-align: center;
}

.tabs {
  display: flex;
  gap: 0.075rem;
  justify-content: center;
}

.tab-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 0.005rem solid rgba(255, 255, 255, 0.3);
  padding: 0.06rem 0.12rem;
  border-radius: 0.15rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.03rem;
}

.tab-btn .icon {
  width: 0.12rem;
  height: 0.12rem;
  fill: currentColor;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-0.01rem);
}

.tab-btn.active {
  background: white;
  color: #5fb6ef;
  border-color: white;
  box-shadow: 0 0.02rem 0.04rem rgba(0, 0, 0, 0.1);
  transform: translateY(-0.01rem);
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.075rem;
  flex: 1;
  overflow: hidden;
  padding: 0.075rem;
}

.form-section {
  background: white;
  padding: 0.15rem;
  border-radius: 0.075rem;
  box-shadow: 0 0.01rem 0.05rem rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.form-section h3 {
  color: #5fb6ef;
  margin-bottom: 0.1rem;
  font-size: 0.12rem;
  font-weight: 700;
  border-bottom: 0.005rem solid #e0e6ed;
  padding-bottom: 0.075rem;
  text-align: center;
  margin-top: -0.05rem;
}

.entity-section {
  margin-bottom: 0.1rem;
  padding: 0.1rem;
  background: linear-gradient(135deg, #e6f3ff 0%, #cce6ff 100%);
  border-radius: 0.0375rem;
  border: 0.005rem solid #99d6ff;
}

.entity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.entity-header label {
  margin-bottom: 0;
  font-weight: 700;
  font-size: 0.1rem;
  color: #3a9ce6;
}

.toggle-icon {
  font-size: 0.1rem;
  color: #3a9ce6;
  font-weight: bold;
  user-select: none;
}

.entity-list {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  margin-top: 0.05rem;
  max-height: 0.5rem;
  overflow-y: auto;
}

.entity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.05rem;
  background: white;
  border-radius: 0.025rem;
  border: 0.005rem solid #99d6ff;
}

.entity-name {
  flex: 1;
  cursor: pointer;
  color: #3a9ce6;
  font-weight: 600;
  font-size: 0.09rem;
  padding: 0.025rem;
}

.entity-name:hover {
  background: #e6f3ff;
  border-radius: 0.025rem;
}

.delete-entity-btn {
  background: #dc3545;
  color: white;
  border: none;
  width: 0.15rem;
  height: 0.15rem;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.08rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.delete-entity-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}

.use-entity-btn {
  background: linear-gradient(135deg, #4da6ff 0%, #2a8cff 100%);
  color: white;
  border: none;
  padding: 0.045rem 0.09rem;
  border-radius: 0.03rem;
  cursor: pointer;
  font-size: 0.1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.use-entity-btn:hover {
  transform: translateY(-0.01rem);
  box-shadow: 0 0.02rem 0.04rem rgba(77, 166, 255, 0.3);
}

.todo-form {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.0375rem;
  font-weight: 700;
  font-size: 0.1rem;
  color: #495057;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.06rem 0.09rem;
  border: 0.005rem solid #ced4da;
  border-radius: 0.03rem;
  font-size: 0.1rem;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #5fb6ef;
  box-shadow: 0 0 0 0.01rem rgba(95, 182, 239, 0.25);
  background: white;
}

.date-range {
  display: flex;
  gap: 0.05rem;
  align-items: center;
}

.date-range input {
  flex: 1;
}

.date-range span {
  font-size: 0.1rem;
  color: #6c757d;
  margin: 0 0.025rem;
}

.form-actions {
  display: flex;
  gap: 0.075rem;
  margin-top: 0.075rem;
}

.save-btn {
  background: linear-gradient(135deg, #5fb6ef 0%, #3a9ce6 100%);
  color: white;
  border: none;
  padding: 0.075rem 0.15rem;
  border-radius: 0.03rem;
  cursor: pointer;
  font-size: 0.1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.save-btn:hover {
  transform: translateY(-0.01rem);
  box-shadow: 0 0.02rem 0.04rem rgba(95, 182, 239, 0.3);
}

.cancel-btn {
  background: linear-gradient(135deg, #6c757d 0%, #545b62 100%);
  color: white;
  border: none;
  padding: 0.075rem 0.15rem;
  border-radius: 0.03rem;
  cursor: pointer;
  font-size: 0.1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  transform: translateY(-0.01rem);
  box-shadow: 0 0.02rem 0.04rem rgba(108, 117, 125, 0.3);
}

.todo-list-section {
  background: white;
  padding: 0.15rem;
  border-radius: 0.075rem;
  box-shadow: 0 0.01rem 0.05rem rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.todo-list-section h3 {
  color: #5fb6ef;
  margin-bottom: 0.1rem;
  font-size: 0.12rem;
  font-weight: 700;
  border-bottom: 0.005rem solid #e0e6ed;
  padding-bottom: 0.075rem;
  text-align: center;
  margin-top: -0.05rem;
}

.todo-list {
  max-height: calc(100vh - 1.2rem);
  overflow-y: auto;
}

.todo-item {
  padding: 0.1rem;
  margin-bottom: 0.075rem;
  border-radius: 0.045rem;
  background: #f8fafc;
  font-size: 0.1rem;
  transition: all 0.2s ease;
  box-shadow: 0 0.01rem 0.02rem rgba(0, 0, 0, 0.05);
  border: 0.005rem solid #e2e8f0;
}

.todo-item:hover {
  transform: translateX(0.01rem);
  box-shadow: 0 0.02rem 0.04rem rgba(0, 0, 0, 0.1);
  border-color: #cbd5e0;
}

.medication-item {
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  border-color: #b3d9ff;
}

.schedule-item {
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  border-color: #99d6ff;
}

.overdue {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-color: #ffc107;
}

.completed {
  opacity: 0.8;
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border-color: #66bb6a;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.06rem;
  padding-bottom: 0.03rem;
  border-bottom: 0.005rem solid #e2e8f0;
}

.todo-info {
  display: flex;
  align-items: center;
  gap: 0.045rem;
}

.todo-name {
  font-weight: 700;
  color: #2d3748;
  font-size: 0.12rem;
}

.todo-type {
  background: #5fb6ef;
  color: white;
  padding: 0.015rem 0.06rem;
  border-radius: 0.09rem;
  font-size: 0.08rem;
  font-weight: 600;
}

.todo-status {
  display: flex;
  align-items: center;
}

.status-indicator {
  width: 0.09rem;
  height: 0.09rem;
  border-radius: 50%;
  background: #cbd5e0;
}

.status-indicator.active {
  background: #48bb78;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.todo-details {
  display: flex;
  flex-direction: column;
  gap: 0.03rem;
  font-size: 0.09rem;
  color: #718096;
  margin-bottom: 0.075rem;
}

.todo-actions {
  display: flex;
  gap: 0.045rem;
  justify-content: flex-end;
}

.action-btn {
  width: 0.225rem;
  height: 0.225rem;
  border: none;
  border-radius: 0.03rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.09rem;
  font-weight: 600;
}

.action-btn:hover {
  transform: translateY(-0.01rem);
  opacity: 0.8;
}

.edit {
  background: linear-gradient(135deg, #5fb6ef 0%, #3a9ce6 100%);
  color: white;
}

.edit:hover {
  box-shadow: 0 0.02rem 0.04rem rgba(95, 182, 239, 0.3);
}

.complete {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white;
}

.complete:hover {
  box-shadow: 0 0.02rem 0.04rem rgba(40, 167, 69, 0.3);
}

.delete {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.delete:hover {
  box-shadow: 0 0.02rem 0.04rem rgba(220, 53, 69, 0.3);
}

.action-icon {
  width: 0.12rem;
  height: 0.12rem;
  fill: currentColor;
}

.empty-tips {
  text-align: center;
  color: #a0aec0;
  padding: 0.3rem 0;
  font-size: 0.1rem;
  background: #f8fafc;
  border-radius: 0.045rem;
  margin-top: 0.15rem;
}

.empty-icon {
  width: 0.3rem;
  height: 0.3rem;
  fill: #cbd5e0;
  margin-bottom: 0.075rem;
}

.reminder-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.reminder-content {
  background: white;
  padding: 0.225rem;
  border-radius: 0.075rem;
  text-align: center;
  max-width: 0.3rem;
  width: 90%;
  animation: slideIn 0.3s ease;
  box-shadow: 0 0.1rem 0.3rem rgba(0, 0, 0, 0.2);
  border: 0.005rem solid #e2e8f0;
  position: relative;
}

.close-modal {
  position: absolute;
  top: 0.05rem;
  right: 0.05rem;
  width: 0.15rem;
  height: 0.15rem;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.1rem;
  z-index: 1001;
}

.close-modal:hover {
  background: #c82333;
  transform: scale(1.1);
}

@keyframes slideIn {
  from {
    transform: translateY(-0.25rem);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.reminder-icon {
  width: 0.225rem;
  height: 0.225rem;
  fill: #dc3545;
  margin: 0 auto 0.075rem;
}

.reminder-content h3 {
  color: #5fb6ef;
  margin-bottom: 0.1rem;
  font-size: 0.12rem;
  font-weight: 700;
}

.reminder-actions {
  display: flex;
  gap: 0.075rem;
  margin-top: 0.15rem;
}

.done-btn {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white;
  border: none;
  padding: 0.075rem 0.15rem;
  border-radius: 0.03rem;
  cursor: pointer;
  flex: 1;
  font-size: 0.1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.done-btn:hover {
  transform: translateY(-0.01rem);
  box-shadow: 0 0.02rem 0.04rem rgba(40, 167, 69, 0.3);
}

.snooze-btn {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  color: #212529;
  border: none;
  padding: 0.075rem 0.15rem;
  border-radius: 0.03rem;
  cursor: pointer;
  flex: 1;
  font-size: 0.1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.snooze-btn:hover {
  transform: translateY(-0.01rem);
  box-shadow: 0 0.02rem 0.04rem rgba(255, 193, 7, 0.3);
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .todo-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.0375rem;
  }
  
  .header h2 {
    font-size: 0.12rem;
  }
  
  .tabs {
    gap: 0.0375rem;
  }
  
  .tab-btn {
    padding: 0.03rem 0.06rem;
    font-size: 0.09rem;
  }
  
  .form-section h3,
  .todo-list-section h3 {
    font-size: 0.11rem;
  }
  
  .save-btn,
  .cancel-btn {
    padding: 0.045rem 0.09rem;
    font-size: 0.09rem;
  }
}
</style>