<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';
import { getTodosByDate } from '../api/user';

const userInfoStore = storeToRefs(useUserInfoStore());
const user_id = userInfoStore.user_id.value;

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
    const response = await getTodosByDate(start_date, user_id);
    items.value = response.data.map(todo => ({
      id: todo.id,
      event: todo.eventName,
      time: formatTime(todo.startTime),
      rawTime: todo.startTime,
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

const nearestTodo = computed(() => {
  if (items.value.length === 0) return null;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const uncompleted = items.value.filter(item => !item.completed);

  if (uncompleted.length === 0) return items.value[0];

  const sorted = [...uncompleted].sort((a, b) => {
    const aMinutes = parseTimeToMinutes(a.rawTime);
    const bMinutes = parseTimeToMinutes(b.rawTime);
    return aMinutes - bMinutes;
  });

  const upcoming = sorted.find(item => parseTimeToMinutes(item.rawTime) >= currentMinutes);
  return upcoming || sorted[sorted.length - 1];
});

const remainingCount = computed(() => {
  if (!nearestTodo.value) return 0;
  return items.value.filter(item => item.id !== nearestTodo.value.id).length;
});

const parseTimeToMinutes = (time) => {
  if (!time) return 0;
  const parts = time.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
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
}, 60000);

onUnmounted(() => {
  clearInterval(refreshInterval);
});
</script>

<template>
  <div class="memo-content">
    <div v-if="nearestTodo" class="nearest-todo">
      <div class="nearest-card" :class="nearestTodo.type === 'medication' ? 'medication' : 'schedule'">
        <div class="card-header">
          <span class="type-badge">{{ nearestTodo.type === 'medication' ? '用药' : '日程' }}</span>
          <span class="todo-time">{{ nearestTodo.time }}</span>
        </div>
        <div class="card-body">
          <span class="todo-event">{{ nearestTodo.event }}</span>
        </div>
        <div class="card-details" v-if="nearestTodo.type === 'medication' && nearestTodo.dosage">
          <span>剂量：{{ nearestTodo.dosage }}</span>
        </div>
        <div class="card-details" v-if="nearestTodo.location">
          <span>地点：{{ nearestTodo.location }}</span>
        </div>
      </div>
    </div>

    <div v-else class="no-todos">
      <span>暂无待办事项</span>
    </div>

    <div class="bottom-bar">
      <span class="remaining-text" v-if="remainingCount > 0">还有 <span class="remaining-num">{{ remainingCount }}</span>
        项待办</span>
      <span v-else></span>
      <span class="view-all-link">查看全部待办 ›</span>
    </div>
  </div>
</template>

<style scoped>
.memo-content {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.06rem;
  flex: 1;
  min-height: 0;
}

.bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  padding: 0.04rem 0 0.02rem 0;
  border-top: 0.005rem solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
  flex: 3;
}

.nearest-todo {
  display: flex;
  flex-direction: column;
  gap: 0.06rem;
  flex: 7;
}

.nearest-card {
  border-radius: 0.06rem;
  padding: 0.08rem;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.nearest-card.medication {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border: 0.005rem solid #f5c6cb;
}

.nearest-card.schedule {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border: 0.005rem solid #90caf9;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.04rem;
}

.type-badge {
  background: #5fb6ef;
  color: white;
  padding: 0.01rem 0.04rem;
  border-radius: 0.04rem;
  font-size: 0.07rem;
  font-weight: 600;
}

.todo-time {
  font-size: 0.08rem;
  color: #718096;
  font-weight: 500;
}

.card-body {
  margin-bottom: 0.02rem;
}

.todo-event {
  font-size: 0.13rem;
  font-weight: 600;
  color: #2d3748;
}

.card-details {
  font-size: 0.08rem;
  color: #718096;
  font-weight: 500;
}

.remaining-text {
  font-size: 0.09rem;
  color: #718096;
}

.remaining-num {
  color: #e8734a;
  font-weight: 700;
  font-size: 0.11rem;
}

.no-todos {
  text-align: center;
  color: #a0aec0;
  padding: 0.15rem 0;
  font-size: 0.1rem;
}

.view-all-link {
  font-size: 0.09rem;
  color: #5fb6ef;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: #3a9ce6;
}
</style>
