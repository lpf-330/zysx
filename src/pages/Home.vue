<script setup>
import HomeMid from '../components/HomeMid.vue';
import Calendar from '../components/Calendar.vue';
import Memo from '../components/Memo.vue';
import GlobalReminder from '../components/GlobalReminder.vue';
import TodoManagment from '../components/TodoManagment.vue';
import { getTodosByDate, updateTodoStatusMS } from '../api/user';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';

const userInfoStore = storeToRefs(useUserInfoStore());
const user_id = computed(() => userInfoStore.user_id.value);

const selectedDate = ref(null);

const handleDateSelected = (date) => {
    selectedDate.value = date;
};

const showGlobalReminder = ref(false);
const globalReminderTodo = ref(null);

const showGlobalReminderModal = (todo) => {
  globalReminderTodo.value = todo;
  showGlobalReminder.value = true;
};

const closeGlobalReminder = () => {
  showGlobalReminder.value = false;
  globalReminderTodo.value = null;
};

const handleMarkAsDone = async (todoId) => {
  try {
    await updateTodoStatusMS(todoId, 1);
    closeGlobalReminder();
    window.dispatchEvent(new CustomEvent('todoStatusChanged', {
      detail: { id: todoId, completed: 1 }
    }));
  } catch (error) {
    console.error('更新状态失败:', error);
    ElMessage.error('更新状态失败: ' + (error.message || '未知错误'));
    throw error;
  }
};

const snoozeGlobalReminder = () => {
  closeGlobalReminder();
  setTimeout(() => {
    if (globalReminderTodo.value) {
      showGlobalReminderModal(globalReminderTodo.value);
    }
  }, 10 * 60 * 1000);
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

const checkGlobalReminders = async () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  try {
    const todayDate = formatDate(now);
    const response = await getTodosByDate(todayDate, user_id.value);
    const todos = response.data || [];

    todos.forEach(todo => {
      if (todo.completed !== 1) {
        if (todo.todoType === 'medication') {
          const [hours, minutes] = todo.startTime.split(':');
          if (parseInt(hours) === currentHour && parseInt(minutes) === currentMinute) {
            showGlobalReminderModal(todo);
          }
        } else {
          const [startHours, startMinutes] = todo.startTime.split(':');
          if (parseInt(startHours) === currentHour && parseInt(startMinutes) === currentMinute) {
            showGlobalReminderModal(todo);
          }
        }
      }
    });
  } catch (error) {
    console.error('检查提醒失败:', error);
  }
};

let globalReminderInterval = null;

onMounted(() => {
  globalReminderInterval = setInterval(checkGlobalReminders, 30000);
});

onUnmounted(() => {
  if (globalReminderInterval) {
    clearInterval(globalReminderInterval);
  }
});

const showTodoManagement = ref(false);

const openTodoManagement = () => {
  showTodoManagement.value = true;
};

const closeTodoManagement = () => {
  showTodoManagement.value = false;
};
</script>

<template>
    <div class="home-container">
        <div class="left-section">
            <div class="calendar-card">
                <Calendar @date-selected="handleDateSelected"></Calendar>
            </div>
            <div class="memo-card" @click="openTodoManagement">
                <div class="memo-title">
                    <span>待办事项</span>
                </div>
                <Memo :selected-date="selectedDate"></Memo>
            </div>
        </div>
        <div class="main-section">
            <div class="header-section">
                <div class="logo-container">
                    <img src="/6.png" alt="Logo" class="logo-image">
                </div>
            </div>
            <HomeMid></HomeMid>
        </div>
    </div>

    <GlobalReminder
      :show-reminder="showGlobalReminder"
      :reminder-todo="globalReminderTodo"
      @close="closeGlobalReminder"
      @mark-as-done="handleMarkAsDone"
      @snooze-reminder="snoozeGlobalReminder"
    />

    <Teleport to="body">
        <div v-if="showTodoManagement" class="todo-modal-overlay" @click="closeTodoManagement">
            <div class="todo-modal-content" @click.stop>
                <TodoManagment @close="closeTodoManagement" />
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.home-container {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    padding: 0.15rem 0.3rem 0.15rem 0.3rem;
    box-sizing: border-box;
    gap: 0.3rem;
    overflow: hidden;
    min-height: 920px;
    min-width: 1280px;
}

.left-section {
    width: 35%;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-height: 0;
    flex-shrink: 0;
    max-height: 100%;
    overflow: hidden;
}

.calendar-card {
    flex-shrink: 0;
    width: 100%;
    height: 2.8rem;
    overflow: hidden;
}

.memo-card {
    flex: 1;
    min-height: 1.2rem;
    max-height: calc(100% - 2.95rem);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 0.08rem;
    padding: 0.08rem 0.1rem;
    box-sizing: border-box;
    overflow: hidden;
}

.memo-card:hover {
    opacity: 0.95;
}

.memo-title {
    height: 0.25rem;
    display: flex;
    align-items: center;
    padding-left: 0.05rem;
}

.memo-title span {
    font-size: 0.12rem;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: rgba(75, 104, 111, 1);
    font-weight: 600;
    border-left: 0.06rem solid #4B686F;
    padding-left: 0.05rem;
}

.main-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    position: relative;
    min-height: 0;
    max-height: 100%;
    flex-shrink: 0;
    overflow: hidden;
}

.header-section {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 1rem;
    flex-shrink: 0;
}

.logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 100%;
    height: 100%;
}

.logo-image {
    height: 100%;
    width: 100%;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.todo-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(30, 60, 30, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: overlayFadeIn 0.3s ease;
}

@keyframes overlayFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.todo-modal-content {
    width: 90%;
    max-width: 8rem;
    height: 90vh;
    background: linear-gradient(160deg, #fafff9 0%, #f1f8e9 100%);
    border-radius: 0.1rem;
    overflow: hidden;
    box-shadow: 0 0.1rem 0.4rem rgba(45, 87, 45, 0.25), 0 0 0 0.005rem rgba(129, 199, 132, 0.3);
    animation: modalSlideIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(0.03rem) scale(0.98);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
</style>
