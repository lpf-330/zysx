<script setup>
import { ElScrollbar } from 'element-plus';
import 'element-plus/dist/index.css';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { getTodosByDate } from '../api/user';

const user_id = ref(localStorage.getItem('user_id') ? parseInt(localStorage.getItem('user_id')) : null);

const props = defineProps({
    selectedDate: {
        type: Date,
        default: null
    }
});

const items = ref([]);

const formatTime = (time) => {
  if (!time) return '';
  if (time.includes(':')) {
    return time.substring(0, 5);
  }
  return time;
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fetchTodosByDate = async (date) => {
  if (!date) return;

  try {
    const start_date = formatDate(date);
    const response = await getTodosByDate(start_date, user_id.value);
    items.value = response.data.map(todo => ({
      id: todo.id,
      event: todo.eventName,
      time: formatTime(todo.startTime),
      type: todo.todoType === 'medication' ? 'medication' : 'schedule',
      dosage: todo.dosage,
      location: todo.location,
      completed: todo.completed === 1 || todo.completed === true
    }));

  } catch (error) {
    console.error('获取待办事项失败:', error);
    items.value = [];
  }
};

watch(() => props.selectedDate, (newDate) => {
  if (newDate) {
    fetchTodosByDate(newDate);
  }
}, { immediate: true });

onMounted(() => {
  if (!props.selectedDate) {
    fetchTodosByDate(new Date());
  } else {
    fetchTodosByDate(props.selectedDate);
  }
});

const refreshInterval = setInterval(() => {
  if (props.selectedDate) {
    fetchTodosByDate(props.selectedDate);
  } else {
    fetchTodosByDate(new Date());
  }
}, 2000);

onUnmounted(() => {
  clearInterval(refreshInterval);
});

const handleTodoStatusChanged = (event) => {
  const { id, completed } = event.detail;
  const item = items.value.find(item => item.id === id);
  if (item) {
    item.completed = completed === 1;
  }
};

onMounted(() => {
  window.addEventListener('todoStatusChanged', handleTodoStatusChanged);
});

onUnmounted(() => {
  window.removeEventListener('todoStatusChanged', handleTodoStatusChanged);
});
</script>

<template>
    <div class="memo-wrapper">
        <div v-if="items.length === 0" class="empty-card">
            <div class="empty-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                    <path d="M7 12h10v2H7z"/>
                </svg>
            </div>
            <div class="empty-text">暂无待办事项</div>
            <div class="empty-hint">点击可添加新待办</div>
        </div>
        <el-scrollbar v-else height="1.3rem">
            <div class="content">
                <div
                    class="note"
                    v-for="item in items"
                    :key="item.id"
                    :class="{
                        'medication-item': item.type === 'medication',
                        'schedule-item': item.type === 'schedule',
                        'completed': item.completed
                    }"
                >
                    <div class="note-header">
                        <div class="event">{{ item.event }}</div>
                        <div class="type-badge">{{ item.type === 'medication' ? '用药' : '日程' }}</div>
                    </div>
                    <div class="note-details">
                        <div class="time">时间：{{ item.time }}</div>
                        <div v-if="item.type === 'medication'" class="dosage">剂量：{{ item.dosage }}</div>
                        <div v-if="item.location" class="location">地点：{{ item.location }}</div>
                    </div>
                </div>
            </div>
        </el-scrollbar>
    </div>
</template>

<style scoped>
.memo-wrapper {
    width: 100%;
    height: 100%;
    min-height: 1.2rem;
}

.empty-card {
    width: 100%;
    height: 100%;
    min-height: 1.2rem;
    background: white;
    border-radius: 0.06rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.15rem;
    box-sizing: border-box;
    border: 0.005rem solid #e2e8f0;
}

.empty-icon {
    width: 0.3rem;
    height: 0.3rem;
    color: #cbd5e0;
    margin-bottom: 0.06rem;
}

.empty-icon svg {
    width: 100%;
    height: 100%;
}

.empty-text {
    font-size: 0.11rem;
    font-weight: 600;
    color: #a0aec0;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    margin-bottom: 0.03rem;
}

.empty-hint {
    font-size: 0.08rem;
    color: #cbd5e0;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.content {
    padding-left: 5%;
    padding-right: 2%;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.selected-date {
    font-size: 0.12rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.05rem;
    padding: 0.02rem 0;
    border-bottom: 0.005rem solid #e2e8f0;
}

.note {
    width: 90%;
    min-height: 0.5rem;
    margin-bottom: 8%;
    border-radius: 0.06rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    padding: 0.08rem;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
}

.note:hover {
    transform: translateX(0.02rem);
    box-shadow: 0px 0.03rem 0.06rem rgba(0, 0, 0, 0.3);
}

.medication-item {
    background: linear-gradient(135deg, #e6f3e6 0%, #c6e6c6 100%);
    border: 0.005rem solid #99d699;
}

.schedule-item {
    background: linear-gradient(135deg, #e6f3e6 0%, #c6e6c6 100%);
    border: 0.005rem solid #99d699;
}

.completed {
    opacity: 0.7;
    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%) !important;
    border-color: #66bb6a !important;
}

.note-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.02rem;
}

.event {
    font-size: 0.14rem;
    font-weight: 600;
    color: #2d3748;
}

.type-badge {
    background: #2D572D;
    color: white;
    padding: 0.01rem 0.04rem;
    border-radius: 0.06rem;
    font-size: 0.07rem;
    font-weight: 600;
    min-width: 0.25rem;
    text-align: center;
}

.note-details {
    display: flex;
    flex-direction: column;
    gap: 0.01rem;
    font-size: 0.09rem;
    color: #718096;
}

.time {
    font-weight: 500;
}

.dosage, .location {
    font-weight: 500;
}

.completed .event,
.completed .time,
.completed .dosage,
.completed .location {
    text-decoration: line-through;
    color: #a0aec0;
}

.no-todos {
    text-align: center;
    color: #a0aec0;
    padding: 0.2rem 0;
}
</style>