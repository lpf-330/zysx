<template>
  <div class="todo-management" @click.stop>
    <div class="header">
      <h2>待办事项管理</h2>
      <div class="tabs">
        <button
          :class="['tab-btn', { active: activeTab === 'medication' }]"
          @click="switchTab('medication')"
        >
          <svg t="1766625589357" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5087" width="200" height="200"><path d="M830.08 193.92a224.810667 224.810667 0 0 1 0 318.08l-159.146667 159.146667-318.08-318.293334L512 193.92a224.810667 224.810667 0 0 1 318.08 0z" fill="#2D572D" p-id="5088"></path><path d="M193.92 830.08a224.810667 224.810667 0 0 1 0-318.08l159.146667-159.146667 318.08 318.08L512 830.08a224.810667 224.810667 0 0 1-318.08 0z" fill="#3d7a3d" p-id="5089"></path></svg>
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

    <div class="main-content">
      <div class="form-section">
        <h3>{{ activeTab === 'medication' ? '添加用药计划' : '添加日程安排' }}</h3>

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
                {{ entity.name }} ({{ entity.type === 'medication' ? '用药' : '日程' }})
              </span>
              <button
                @click="deleteEntityById(entity.id)"
                class="delete-entity-btn"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <form @submit.prevent="saveTodo" class="todo-form">
          <div class="form-group">
            <label>待办名称：</label>
            <input
              v-model="currentTodo.eventName"
              type="text"
              required
              :placeholder="activeTab === 'medication' ? '请输入药品名称' : '请输入事件名称'"
            >
          </div>

          <div v-if="activeTab === 'medication'" class="medication-fields">
            <div class="form-group">
              <label>剂量：</label>
              <input v-model="currentTodo.dosage" type="text" placeholder="如：2片">
            </div>
            <div class="form-group">
              <label>服用时间：</label>
              <input v-model="currentTodo.startTime" type="time" required>
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

          <div v-else class="schedule-fields">
            <div class="form-group">
              <label>开始日期：</label>
              <input v-model="currentTodo.startDate" type="date" required>
            </div>
            <div class="form-group">
              <label>开始时间：</label>
              <input v-model="currentTodo.startTime" type="time" required>
            </div>
            <div class="form-group">
              <label>结束日期：</label>
              <input v-model="currentTodo.endDate" type="date" required>
            </div>
            <div class="form-group">
              <label>结束时间：</label>
              <input v-model="currentTodo.endTime" type="time" required>
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

      <div class="todo-list-section">
        <h3>今日待办事项</h3>

        <div class="todo-list">
          <div
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="todo-item"
            :class="{
              'medication-item': todo.todoType === 'medication',
              'schedule-item': todo.todoType === 'schedule',
              'overdue': isOverdue(todo),
              'completed': todo.completed === 1
            }"
          >
            <div class="todo-header">
              <div class="todo-info">
                <span class="todo-name">{{ todo.eventName }}</span>
                <span class="todo-type">{{ todo.todoType === 'medication' ? '用药' : '日程' }}</span>
              </div>
              <div class="todo-status">
                <div class="status-indicator" :class="{ active: todo.completed !== 1 }"></div>
              </div>
            </div>

            <div class="todo-details">
              <div v-if="todo.todoType === 'medication'">
                <span>剂量：{{ todo.dosage || '未设置' }}</span>
                <span>&nbsp;|&nbsp;时间：{{ formatTime(todo.startTime) }}</span>
                <span>&nbsp;|&nbsp;起止：{{ formatDate(todo.startDate) }} 至 {{ formatDate(todo.endDate) }}</span>
              </div>
              <div v-else>
                <span>时间：{{ formatDate(todo.startDate) }} {{ formatTime(todo.startTime) }} - {{ formatDate(todo.endDate) }} {{ formatTime(todo.endTime) }}</span>
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
                  <path v-if="todo.completed === 1" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  <path v-else d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </button>
              <button @click="deleteTodoById(todo.id)" class="action-btn delete">
                <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          </div>

          <div v-if="filteredTodos.length === 0" class="empty-tips">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
              <path d="M7 12h10v2H7z"/>
            </svg>
            <p>暂无待办事项</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getTodosByDate, createTodo, updateTodoMS, deleteTodoMS, updateTodoStatusMS } from '../api/user';
import { ElMessage, ElMessageBox } from 'element-plus'

const emit = defineEmits(['close'])

const user_id = ref(localStorage.getItem('user_id') ? parseInt(localStorage.getItem('user_id')) : null)

const activeTab = ref('medication')
const currentTodo = ref({
  eventName: '',
  todoType: 'medication',
  startTime: '',
  endTime: '',
  dosage: '',
  startDate: '',
  endDate: '',
  location: '',
  remarks: '',
  completed: 0
})
const todos = ref([])
const entities = ref([])
const editingId = ref(null)
const selectedEntity = ref('')
const showEntities = ref(false)

const handleTodoStatusChanged = (event) => {
  const { id, completed } = event.detail
  const todoIndex = todos.value.findIndex(todo => todo.id === id)
  if (todoIndex !== -1) {
    todos.value[todoIndex].completed = completed
  }
}

onMounted(() => {
  window.addEventListener('todoStatusChanged', handleTodoStatusChanged)
})

onUnmounted(() => {
  window.removeEventListener('todoStatusChanged', handleTodoStatusChanged)
})

const formatTime = (time) => {
  if (!time) return '未设置';
  if (time.includes(':')) {
    return time.substring(0, 5);
  }
  return time;
};

const formatDate = (date) => {
  if (!date) return '未设置';
  if (typeof date === 'string') {
    date = new Date(date);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const loadEntitiesFromStorage = () => {
  const stored = localStorage.getItem('todo-entities')
  return stored ? JSON.parse(stored) : []
}

const saveEntitiesToStorage = (entities) => {
  localStorage.setItem('todo-entities', JSON.stringify(entities))
}

onMounted(() => {
  entities.value = loadEntitiesFromStorage()
})

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

const fetchTodos = async (date) => {
  try {
    const start_date = formatDate(date);
    const response = await getTodosByDate(start_date, user_id.value);
    todos.value = response.data.map(item => ({
      ...item,
      type: item.todoType,
      name: item.eventName,
      time: item.startTime,
      completed: item.completed
    }));
  } catch (error) {
    console.error('获取待办事项失败:', error)
    ElMessage.error('获取待办事项失败: ' + (error.message || '未知错误'))
  }
}

const createTodoApi = async (todoData) => {
  try {
    const backendData = {
      ...todoData,
      todoType: activeTab.value,
      user_id: user_id.value,
      dosage: todoData.dosage ? parseFloat(todoData.dosage) : null,
      location: todoData.location || null,
      remarks: todoData.remarks || null
    };
    const response = await createTodo(backendData)
    ElMessage.success('待办事项创建成功！')
    await fetchTodos(new Date())
    return response
  } catch (error) {
    console.error('创建待办事项失败:', error)
    ElMessage.error('创建待办事项失败: ' + (error.message || '未知错误'))
    throw error
  }
}

const updateTodo = async (id, todoData) => {
  try {
    const backendData = {
      ...todoData,
      todoType: activeTab.value,
      dosage: todoData.dosage ? parseFloat(todoData.dosage) : null,
      location: todoData.location || null,
      remarks: todoData.remarks || null
    };
    const response = await updateTodoMS(id, backendData);
    ElMessage.success('待办事项更新成功！')
    await fetchTodos(new Date())
    return response.data
  } catch (error) {
    console.error('更新待办事项失败:', error)
    ElMessage.error('更新待办事项失败: ' + (error.message || '未知错误'))
    throw error
  }
}

const deleteTodo = async (id) => {
  try {
    await deleteTodoMS(id);
    ElMessage.success('待办事项删除成功！')
    await fetchTodos(new Date())
  } catch (error) {
    console.error('删除待办事项失败:', error)
    ElMessage.error('删除待办事项失败: ' + (error.message || '未知错误'))
  }
}

const updateTodoStatus = async (id, completed) => {
  try {
    await updateTodoStatusMS(id, completed)
    await fetchTodos(new Date())
  } catch (error) {
    console.error('更新待办事项状态失败:', error)
    ElMessage.error('更新待办事项状态失败: ' + (error.message || '未知错误'))
  }
}

const createEntity = (entityData) => {
  entities.value.push(entityData)
  saveEntitiesToStorage(entities.value)
}

const deleteEntity = (id) => {
  entities.value = entities.value.filter(e => e.id !== id)
  saveEntitiesToStorage(entities.value)
}

const switchTab = (tab) => {
  activeTab.value = tab
  resetForm()
}

const resetForm = () => {
  currentTodo.value = {
    eventName: '',
    todoType: activeTab.value,
    startTime: '',
    endTime: '',
    dosage: '',
    startDate: '',
    endDate: '',
    location: '',
    remarks: '',
    completed: 0
  }
  editingId.value = null
  selectedEntity.value = ''
}

const saveTodo = async () => {
  try {
    if (editingId.value) {
      await updateTodo(editingId.value, currentTodo.value)
    } else {
      const newTodo = {
        ...currentTodo.value,
        todoType: activeTab.value
      }
      await createTodoApi(newTodo)

      const entityExists = entities.value.some(e => e.name === newTodo.eventName && e.type === activeTab.value)
      if (!entityExists) {
        createEntity({
          id: Date.now().toString(),
          name: newTodo.eventName,
          type: activeTab.value
        })
      }
    }
    resetForm()
  } catch (error) {
    console.error('保存待办事项失败:', error)
  }
}

const editTodo = (todo) => {
  if (todo.todoType !== activeTab.value) {
    activeTab.value = todo.todoType
  }

  currentTodo.value = {
    ...todo
  }
  editingId.value = todo.id
}

const cancelEdit = () => {
  resetForm()
}

const deleteTodoById = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个待办事项吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await deleteTodo(id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除待办事项失败:', error)
    }
  }
}

const toggleComplete = async (todo) => {
  try {
    const newCompleted = todo.completed === 1 ? 0 : 1
    await updateTodoStatus(todo.id, newCompleted)
    ElMessage.success(newCompleted === 1 ? '标记为已完成！' : '标记为未完成！')
  } catch (error) {
    console.error('更新状态失败:', error)
  }
}

const selectEntity = (entity) => {
  currentTodo.value.eventName = entity.name
}

const deleteEntityById = (id) => {
  ElMessageBox.confirm(
    '确定要删除这个待办实体吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    deleteEntity(id)
    ElMessage.success('待办实体删除成功！')
  }).catch(() => {
  })
}

const toggleEntitySection = () => {
  showEntities.value = !showEntities.value
}

const isTodayTodo = (todo) => {
  const today = new Date()
  const todayStr = formatDate(today)

  const startDate = new Date(todo.startDate)
  const endDate = new Date(todo.endDate)
  const startStr = formatDate(startDate)
  const endStr = formatDate(endDate)

  const todayNum = parseInt(todayStr.replace(/-/g, ''))
  const startNum = parseInt(startStr.replace(/-/g, ''))
  const endNum = parseInt(endStr.replace(/-/g, ''))

  return todayNum >= startNum && todayNum <= endNum
}

const isOverdue = (todo) => {
  if (todo.completed === 1) return false

  const now = new Date()
  if (todo.todoType === 'medication') {
    const [hours, minutes] = todo.startTime.split(':')
    const todoTime = new Date()
    todoTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    return todoTime < now
  } else {
    const [startHours, startMinutes] = todo.startTime.split(':')
    const [endHours, endMinutes] = todo.endTime.split(':')
    const todoStartDate = new Date(todo.startDate)
    const todoEndDate = new Date(todo.endDate)

    const todoStartTime = new Date(todoStartDate.getFullYear(), todoStartDate.getMonth(), todoStartDate.getDate(), parseInt(startHours), parseInt(startMinutes), 0, 0)
    const todoEndTime = new Date(todoEndDate.getFullYear(), todoEndDate.getMonth(), todoEndDate.getDate(), parseInt(endHours), parseInt(endMinutes), 0, 0)

    return todoEndTime < now
  }
}

onMounted(async () => {
  await fetchTodos(new Date())
})
</script>

<style scoped>
.todo-management {
  width: 100%;
  height: 100%;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #2D572D 0%, #3d7a3d 100%);
  color: white;
  padding: 0.15rem;
  margin-bottom: 0.075rem;
  box-shadow: 0 0.02rem 0.06rem rgba(45, 87, 45, 0.3);
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
  color: #2D572D;
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
  color: #2D572D;
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
  background: linear-gradient(135deg, #e6f3e6 0%, #c6e6c6 100%);
  border-radius: 0.0375rem;
  border: 0.005rem solid #99d699;
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
  color: #2D572D;
}

.toggle-icon {
  font-size: 0.1rem;
  color: #2D572D;
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
  border: 0.005rem solid #99d699;
}

.entity-name {
  flex: 1;
  cursor: pointer;
  color: #2D572D;
  font-weight: 600;
  font-size: 0.09rem;
  padding: 0.025rem;
}

.entity-name:hover {
  background: #e6f3e6;
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
  border-color: #2D572D;
  box-shadow: 0 0 0 0.01rem rgba(45, 87, 45, 0.25);
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
  background: linear-gradient(135deg, #2D572D 0%, #3d7a3d 100%);
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
  box-shadow: 0 0.02rem 0.04rem rgba(45, 87, 45, 0.3);
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
  color: #2D572D;
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
  background: linear-gradient(135deg, #e6f3e6 0%, #c6e6c6 100%);
  border-color: #99d699;
}

.schedule-item {
  background: linear-gradient(135deg, #e6f3e6 0%, #c6e6c6 100%);
  border-color: #99d699;
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
  background: #2D572D;
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