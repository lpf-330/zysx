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
          <svg t="1766625589357" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5087" width="200" height="200"><path d="M830.08 193.92a224.810667 224.810667 0 0 1 0 318.08l-159.146667 159.146667-318.08-318.293334L512 193.92a224.810667 224.810667 0 0 1 318.08 0z" fill="#4A8B2C" p-id="5088"></path><path d="M193.92 830.08a224.810667 224.810667 0 0 1 0-318.08l159.146667-159.146667 318.08 318.08L512 830.08a224.810667 224.810667 0 0 1-318.08 0z" fill="#81C784" p-id="5089"></path></svg>
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
                @click="deleteEntityById(entity.id)"
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
              v-model="currentTodo.eventName" 
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

          <!-- 日程特有字段 -->
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

      <!-- 当日待办列表 -->
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
import axios from 'axios'
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';

// 导入 Element Plus 消息提示组件
import { ElMessage, ElMessageBox } from 'element-plus'

const userInfoStore = storeToRefs(useUserInfoStore());
const user_id = userInfoStore.user_id.value;

// 响应式数据
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
  completed: 0  // tinylnt(1)类型
})
const todos = ref([])
const entities = ref([])
const editingId = ref(null)
const selectedEntity = ref('')
const showEntities = ref(false)


// 在待办管理组件中监听全局状态变化
const handleTodoStatusChanged = (event) => {
  const { id, completed } = event.detail
  // 更新本地待办列表的状态
  const todoIndex = todos.value.findIndex(todo => todo.id === id)
  if (todoIndex !== -1) {
    todos.value[todoIndex].completed = completed
  }
}

onMounted(() => {
  // 监听全局事件
  window.addEventListener('todoStatusChanged', handleTodoStatusChanged)
})

onUnmounted(() => {
  // 移除监听器
  window.removeEventListener('todoStatusChanged', handleTodoStatusChanged)
})
// 转换时间格式的辅助函数
const formatTime = (time) => {
  if (!time) return '未设置';
  // 处理数据库时间格式 HH:mm:ss
  if (time.includes(':')) {
    return time.substring(0, 5); // 取 HH:mm
  }
  return time;
};

// 格式化日期为 YYYY-MM-DD 格式（不涉及时区转换）
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

// 格式化日期时间为可读格式
const formatDateTime = (datetime) => {
  if (!datetime) return '未设置';
  return new Date(datetime).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 从本地缓存获取待办实体
const loadEntitiesFromStorage = () => {
  const stored = localStorage.getItem('todo-entities')
  return stored ? JSON.parse(stored) : []
}

// 保存待办实体到本地缓存
const saveEntitiesToStorage = (entities) => {
  localStorage.setItem('todo-entities', JSON.stringify(entities))
}

// 初始化待办实体
onMounted(() => {
  entities.value = loadEntitiesFromStorage()
})

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

// API请求方法
// 获取待办事项列表
const fetchTodos = async (date) => {
  try {
    const start_date = formatDate(date);
    const response = await getTodosByDate(start_date, user_id);
    console.log('获取待办',response);
    // 将后端返回的数据格式转换为前端需要的格式
    todos.value = response.data.map(item => ({
      ...item,
      type: item.todoType, // 映射字段
      name: item.eventName, // 映射字段
      time: item.startTime, // 映射字段
      completed: item.completed // tinylnt(1)类型
    }));
  } catch (error) {
    console.error('获取待办事项失败:', error)
    ElMessage.error('获取待办事项失败: ' + (error.message || '未知错误'))
  }
}

// 创建待办事项
const createTodoApi = async (todoData) => {
  try {
    // 将前端数据格式转换为后端需要的格式
    const backendData = {
      ...todoData,
      todoType: activeTab.value,
      user_id: user_id, 
      // 确保数据类型正确
      dosage: todoData.dosage ? parseFloat(todoData.dosage) : null,
      location: todoData.location || null,
      remarks: todoData.remarks || null
    };
    const response = await createTodo(backendData)
    ElMessage.success('待办事项创建成功！')
    await fetchTodos(new Date()) // 重新获取数据
    return response
  } catch (error) {
    console.error('创建待办事项失败:', error)
    ElMessage.error('创建待办事项失败: ' + (error.message || '未知错误'))
    throw error
  }
}

// 更新待办事项
const updateTodo = async (id, todoData) => {
  try {
    // 将前端数据格式转换为后端需要的格式
    const backendData = {
      ...todoData,
      todoType: activeTab.value,
      // 确保数据类型正确
      dosage: todoData.dosage ? parseFloat(todoData.dosage) : null,
      location: todoData.location || null,
      remarks: todoData.remarks || null
    };
    const response = await updateTodoMS(id, backendData);
    ElMessage.success('待办事项更新成功！')
    await fetchTodos(new Date()) // 重新获取数据
    return response.data
  } catch (error) {
    console.error('更新待办事项失败:', error)
    ElMessage.error('更新待办事项失败: ' + (error.message || '未知错误'))
    throw error
  }
}

// 删除待办事项
const deleteTodo = async (id) => {
  try {
    await deleteTodoMS(id);
    ElMessage.success('待办事项删除成功！')
    await fetchTodos(new Date()) // 重新获取数据
  } catch (error) {
    console.error('删除待办事项失败:', error)
    ElMessage.error('删除待办事项失败: ' + (error.message || '未知错误'))
    throw error
  }
}

// 更新待办事项完成状态
const updateTodoStatus = async (id, completed) => {
  try {
    await updateTodoStatusMS(id, completed)
    await fetchTodos(new Date()) // 重新获取数据
  } catch (error) {
    console.error('更新待办事项状态失败:', error)
    ElMessage.error('更新待办事项状态失败: ' + (error.message || '未知错误'))
    throw error
  }
}

// 本地缓存操作 - 创建待办实体
const createEntity = (entityData) => {
  entities.value.push(entityData)
  saveEntitiesToStorage(entities.value)
}

// 本地缓存操作 - 删除待办实体
const deleteEntity = (id) => {
  entities.value = entities.value.filter(e => e.id !== id)
  saveEntitiesToStorage(entities.value)
}

// 方法
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
    completed: 0  // tinylnt(1)类型
  }
  editingId.value = null
  selectedEntity.value = ''
}

const saveTodo = async () => {
  try {
    if (editingId.value) {
      // 更新现有待办
      await updateTodo(editingId.value, currentTodo.value)
    } else {
      // 添加新待办 - 使用你定义的createTodoApi函数
      const newTodo = {
        ...currentTodo.value,
        todoType: activeTab.value
      }
      await createTodoApi(newTodo) // 使用createTodoApi而不是直接调用createTodo
      
      // 同时创建待办实体到本地缓存
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
    // 错误信息已经在API函数中处理了
  }
}

const editTodo = (todo) => {
  // 根据待办类型切换到对应的标签页
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
    // 用户取消删除或发生错误
    if (error !== 'cancel') {
      console.error('删除待办事项失败:', error)
    }
  }
}

const toggleComplete = async (todo) => {
  try {
    const newCompleted = todo.completed === 1 ? 0 : 1  // tinylnt(1)类型切换
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
    // 用户取消删除
  })
}

const toggleEntitySection = () => {
  showEntities.value = !showEntities.value
}

const isTodayTodo = (todo) => {
  const today = new Date()
  const todayStr = formatDate(today) // 获取今天的日期字符串格式 YYYY-MM-DD
  
  // 检查今天是否在待办事项的开始日期和结束日期范围内
  const startDate = new Date(todo.startDate)
  const endDate = new Date(todo.endDate)
  const startStr = formatDate(startDate)
  const endStr = formatDate(endDate)
  
  // 将字符串转换为可比较的数字格式 YYYYMMDD
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
    // 对于日程，检查是否已经过了结束时间
    const [startHours, startMinutes] = todo.startTime.split(':')
    const [endHours, endMinutes] = todo.endTime.split(':')
    const todoStartDate = new Date(todo.startDate)
    const todoEndDate = new Date(todo.endDate)
    
    const todoStartTime = new Date(todoStartDate.getFullYear(), todoStartDate.getMonth(), todoStartDate.getDate(), parseInt(startHours), parseInt(startMinutes), 0, 0)
    const todoEndTime = new Date(todoEndDate.getFullYear(), todoEndDate.getMonth(), todoEndDate.getDate(), parseInt(endHours), parseInt(endMinutes), 0, 0)
    
    return todoEndTime < now
  }
}

// 生命周期
onMounted(async () => {
  // 初始化数据
  await fetchTodos(new Date())
})
</script>

<style scoped>
.todo-management {
  width: 100%;
  height: 100%;
  font-family: 'SiYuanHeiTi';
  background: linear-gradient(160deg, #f6faf6 0%, #e8f5e9 40%, #dcedc8 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.todo-management::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(129, 199, 132, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.header {
  background: linear-gradient(135deg, #2D572D 0%, #3d7a3d 40%, #4A8B2C 100%);
  color: white;
  padding: 0.15rem;
  margin-bottom: 0.075rem;
  box-shadow: 0 0.03rem 0.1rem rgba(45, 87, 45, 0.35);
  position: relative;
  overflow: hidden;
}

.header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%);
  animation: headerShimmer 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes headerShimmer {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

.header h2 {
  margin: 0 0 0.075rem 0;
  font-size: 0.15rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.02rem;
  text-shadow: 0 0.01rem 0.02rem rgba(0,0,0,0.15);
  position: relative;
  z-index: 1;
}

.tabs {
  display: flex;
  gap: 0.075rem;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.tab-btn {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
  border: 0.005rem solid rgba(255, 255, 255, 0.25);
  padding: 0.06rem 0.12rem;
  border-radius: 0.15rem;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.03rem;
  backdrop-filter: blur(4px);
  position: relative;
  overflow: hidden;
}

.tab-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  transition: left 0.5s ease;
}

.tab-btn:hover::before {
  left: 100%;
}

.tab-btn .icon {
  width: 0.12rem;
  height: 0.12rem;
  fill: currentColor;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-0.01rem);
  box-shadow: 0 0.02rem 0.06rem rgba(0,0,0,0.1);
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.95);
  color: #2D572D;
  border-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0.02rem 0.08rem rgba(45, 87, 45, 0.2);
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
  padding: 0.15rem;
  border-radius: 0.075rem;
  box-shadow: 0 0.02rem 0.08rem rgba(45, 87, 45, 0.08);
  overflow-y: auto;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.92);
  border: 0.005rem solid rgba(129, 199, 132, 0.2);
  position: relative;
}

.form-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0.03rem;
  background: linear-gradient(90deg, #2D572D, #4A8B2C, #81C784);
  border-radius: 0.075rem 0.075rem 0 0;
}

.form-section h3 {
  color: #2D572D;
  margin-bottom: 0.1rem;
  font-size: 0.12rem;
  font-weight: 700;
  border-bottom: 0.005rem solid rgba(45, 87, 45, 0.12);
  padding-bottom: 0.075rem;
  text-align: center;
  margin-top: -0.05rem;
  position: relative;
}

.entity-section {
  margin-bottom: 0.1rem;
  padding: 0.1rem;
  background: linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%);
  border-radius: 0.0375rem;
  border: 0.005rem solid rgba(129, 199, 132, 0.4);
  transition: all 0.3s ease;
}

.entity-section:hover {
  box-shadow: 0 0.01rem 0.04rem rgba(129, 199, 132, 0.2);
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
  color: #2E6B2E;
}

.toggle-icon {
  font-size: 0.1rem;
  color: #4A8B2C;
  font-weight: bold;
  user-select: none;
  transition: transform 0.3s ease;
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
  border: 0.005rem solid rgba(129, 199, 132, 0.3);
  transition: all 0.25s ease;
}

.entity-item:hover {
  border-color: rgba(129, 199, 132, 0.6);
  box-shadow: 0 0.01rem 0.03rem rgba(45, 87, 45, 0.1);
}

.entity-name {
  flex: 1;
  cursor: pointer;
  color: #2E6B2E;
  font-weight: 600;
  font-size: 0.09rem;
  padding: 0.025rem;
  transition: all 0.2s ease;
  border-radius: 0.025rem;
}

.entity-name:hover {
  background: rgba(129, 199, 132, 0.15);
}

.delete-entity-btn {
  background: #ef5350;
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
  transition: all 0.25s ease;
}

.delete-entity-btn:hover {
  background: #d32f2f;
  transform: scale(1.1);
  box-shadow: 0 0.02rem 0.04rem rgba(211, 47, 47, 0.3);
}

.use-entity-btn {
  background: linear-gradient(135deg, #2E6B2E 0%, #4A8B2C 100%);
  color: white;
  border: none;
  padding: 0.045rem 0.09rem;
  border-radius: 0.03rem;
  cursor: pointer;
  font-size: 0.1rem;
  font-weight: 600;
  transition: all 0.25s ease;
}

.use-entity-btn:hover {
  transform: translateY(-0.01rem);
  box-shadow: 0 0.02rem 0.04rem rgba(45, 87, 45, 0.3);
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
  color: #3A5A2A;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.06rem 0.09rem;
  border: 0.005rem solid #cfe2c7;
  border-radius: 0.03rem;
  font-size: 0.1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafff8;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4A8B2C;
  box-shadow: 0 0 0 0.015rem rgba(74, 139, 44, 0.2);
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
  color: #718096;
  margin: 0 0.025rem;
}

.form-actions {
  display: flex;
  gap: 0.075rem;
  margin-top: 0.075rem;
}

.save-btn {
  background: linear-gradient(135deg, #2E6B2E 0%, #4A8B2C 100%);
  color: white;
  border: none;
  padding: 0.075rem 0.15rem;
  border-radius: 0.03rem;
  cursor: pointer;
  font-size: 0.1rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.save-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.save-btn:active::after {
  width: 0.4rem;
  height: 0.4rem;
}

.save-btn:hover {
  transform: translateY(-0.01rem);
  box-shadow: 0 0.03rem 0.06rem rgba(45, 87, 45, 0.35);
}

.cancel-btn {
  background: linear-gradient(135deg, #78909c 0%, #607d8b 100%);
  color: white;
  border: none;
  padding: 0.075rem 0.15rem;
  border-radius: 0.03rem;
  cursor: pointer;
  font-size: 0.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  transform: translateY(-0.01rem);
  box-shadow: 0 0.02rem 0.04rem rgba(96, 125, 139, 0.3);
}

.todo-list-section {
  padding: 0.15rem;
  border-radius: 0.075rem;
  box-shadow: 0 0.02rem 0.08rem rgba(45, 87, 45, 0.08);
  overflow-y: auto;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.88);
  border: 0.005rem solid rgba(129, 199, 132, 0.2);
  position: relative;
}

.todo-list-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0.03rem;
  background: linear-gradient(90deg, #81C784, #4A8B2C, #2D572D);
  border-radius: 0.075rem 0.075rem 0 0;
}

.todo-list-section h3 {
  color: #2D572D;
  margin-bottom: 0.1rem;
  font-size: 0.12rem;
  font-weight: 700;
  border-bottom: 0.005rem solid rgba(45, 87, 45, 0.12);
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
  background: #fefffe;
  font-size: 0.1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0.01rem 0.03rem rgba(0, 0, 0, 0.04);
  border: 0.005rem solid #e8f5e9;
  border-left: 0.03rem solid #81C784;
  animation: itemSlideIn 0.4s ease-out backwards;
  position: relative;
  overflow: hidden;
}

.todo-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 0.015rem;
  background: linear-gradient(90deg, #4A8B2C, #81C784);
  transition: width 0.3s ease;
}

.todo-item:hover::after {
  width: 100%;
}

@keyframes itemSlideIn {
  from {
    opacity: 0;
    transform: translateX(0.02rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.todo-item:hover {
  transform: translateY(-0.01rem);
  box-shadow: 0 0.03rem 0.08rem rgba(45, 87, 45, 0.12);
  border-color: rgba(129, 199, 132, 0.4);
}

.medication-item {
  background: linear-gradient(135deg, #f1f8e9 0%, #fefefe 100%);
  border-left-color: #66bb6a;
}

.schedule-item {
  background: linear-gradient(135deg, #fff8e1 0%, #fefefe 100%);
  border-left-color: #ffa726;
}

.overdue {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-left-color: #ef6c00;
  animation: itemSlideIn 0.4s ease-out backwards, overduePulse 2.5s ease-in-out infinite;
}

@keyframes overduePulse {
  0%, 100% { box-shadow: 0 0.01rem 0.03rem rgba(0, 0, 0, 0.04); }
  50% { box-shadow: 0 0.02rem 0.06rem rgba(239, 108, 0, 0.15); }
}

.completed {
  opacity: 0.75;
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
  border-left-color: #a5d6a7;
}

.completed .todo-name {
  text-decoration: line-through;
  color: #999;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.06rem;
  padding-bottom: 0.03rem;
  border-bottom: 0.005rem solid rgba(45, 87, 45, 0.08);
}

.todo-info {
  display: flex;
  align-items: center;
  gap: 0.045rem;
}

.todo-name {
  font-weight: 700;
  color: #2D572D;
  font-size: 0.12rem;
  transition: color 0.2s ease;
}

.todo-type {
  background: linear-gradient(135deg, #2E6B2E 0%, #4A8B2C 100%);
  color: white;
  padding: 0.015rem 0.06rem;
  border-radius: 0.09rem;
  font-size: 0.08rem;
  font-weight: 600;
  letter-spacing: 0.01rem;
}

.schedule-item .todo-type {
  background: linear-gradient(135deg, #e65100 0%, #f57c00 100%);
}

.todo-status {
  display: flex;
  align-items: center;
}

.status-indicator {
  width: 0.09rem;
  height: 0.09rem;
  border-radius: 50%;
  background: #c8e6c9;
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: #4A8B2C;
  animation: statusPulse 2s ease-in-out infinite;
  box-shadow: 0 0 0.03rem rgba(74, 139, 44, 0.3);
}

@keyframes statusPulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0.02rem rgba(74, 139, 44, 0.3);
  }
  50% {
    opacity: 0.6;
    box-shadow: 0 0 0.04rem rgba(74, 139, 44, 0.5);
  }
}

.todo-details {
  display: flex;
  flex-direction: column;
  gap: 0.03rem;
  font-size: 0.09rem;
  color: #537A3E;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.09rem;
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.action-btn:hover {
  transform: translateY(-0.015rem);
}

.action-btn:active {
  transform: translateY(0) scale(0.95);
}

.edit {
  background: linear-gradient(135deg, #2E6B2E 0%, #4A8B2C 100%);
  color: white;
}

.edit:hover {
  box-shadow: 0 0.03rem 0.06rem rgba(45, 87, 45, 0.35);
}

.complete {
  background: linear-gradient(135deg, #388e3c 0%, #66bb6a 100%);
  color: white;
}

.complete:hover {
  box-shadow: 0 0.03rem 0.06rem rgba(56, 142, 60, 0.35);
}

.delete {
  background: linear-gradient(135deg, #e57373 0%, #ef5350 100%);
  color: white;
}

.delete:hover {
  box-shadow: 0 0.03rem 0.06rem rgba(229, 115, 115, 0.35);
}

.action-icon {
  width: 0.12rem;
  height: 0.12rem;
  fill: currentColor;
}

.empty-tips {
  text-align: center;
  color: #a5d6a7;
  padding: 0.3rem 0;
  font-size: 0.1rem;
  background: linear-gradient(135deg, #f9fbe7 0%, #f1f8e9 100%);
  border-radius: 0.045rem;
  margin-top: 0.15rem;
  border: 0.005rem dashed rgba(129, 199, 132, 0.4);
}

.empty-icon {
  width: 0.3rem;
  height: 0.3rem;
  fill: #c8e6c9;
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