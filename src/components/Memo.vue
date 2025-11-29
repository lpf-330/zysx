<script setup>
import { ElScrollbar } from 'element-plus';
import 'element-plus/dist/index.css';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';
import { getTodosByDate } from '../api/user';

const userInfoStore = storeToRefs(useUserInfoStore());
const user_id = userInfoStore.user_id.value;

// 接收选中的日期
const props = defineProps({
    selectedDate: {
        type: Date,
        default: null
    }
});

// 定义items响应式变量
const items = ref([]);

// 转换时间格式的辅助函数
const formatTime = (time) => {
  if (!time) return '';
  if (time.includes(':')) {
    return time.substring(0, 5);
  }
  return time;
};

// 格式化日期为 YYYY-MM-DD 格式（不涉及时区转换）
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取指定日期的待办事项
const fetchTodosByDate = async (date) => {
  if (!date) return;
  
  try {
    // 使用本地日期格式化，避免时区问题
    const start_date = formatDate(date);
    console.log('选中的日期:', date);
    console.log('格式化后的日期:', start_date);
    
    const response = await getTodosByDate(start_date, user_id);

    console.log('待办事项', response);
    
    // 转换API响应数据为页面所需格式
    items.value = response.data.map(todo => ({
      id: todo.id,
      event: todo.eventName,     
      time: formatTime(todo.startTime),
      type: todo.todoType === 'medication' ? 'medication' : 'schedule',
      dosage: todo.dosage,
      location: todo.location,
      completed: todo.completed === 1 || todo.completed === true 
    }));
    
    console.log(`获取 ${start_date} 的待办事项成功`, items.value);
  } catch (error) {
    console.error('获取待办事项失败:', error);
    // 如果API调用失败，可以设置默认值或显示错误信息
    items.value = [];
  }
};

// 监听选中日期的变化
watch(() => props.selectedDate, (newDate) => {
  if (newDate) {
    fetchTodosByDate(newDate);
  }
}, { immediate: true });

onMounted(() => {
  // 如果没有传入日期，则默认使用当天日期
  if (!props.selectedDate) {
    fetchTodosByDate(new Date());
  } else {
    fetchTodosByDate(props.selectedDate);
  }
});

// 定时刷新待办事项
const refreshInterval = setInterval(() => {
  if (props.selectedDate) {
    fetchTodosByDate(props.selectedDate);
  } else {
    fetchTodosByDate(new Date()); // 如果没有选中日期，就获取当天数据
  }
}, 60000); // 每分钟刷新一次

onUnmounted(() => {
  clearInterval(refreshInterval);
});
</script>

<template>
    <el-scrollbar height="1.3rem">
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
            
            <!-- 当没有待办事项时的提示 -->
            <div v-if="items.length === 0" class="no-todos">
                该日期暂无待办事项
            </div>
        </div>
    </el-scrollbar>
</template>

<style scoped>
.content {
    padding-left: 5%;
    padding-right: 2%;
    font-family: 'SiYuanHeiTi';
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
    font-family: 'SiYuanHeiTi';
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
}

.note:hover {
    transform: translateX(0.02rem);
    box-shadow: 0px 0.03rem 0.06rem rgba(0, 0, 0, 0.3);
}

.medication-item {
    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
    border: 0.005rem solid #f5c6cb;
}

.schedule-item {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    border: 0.005rem solid #90caf9;
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
    background: #5fb6ef;
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