<script setup>
import { ElScrollbar } from 'element-plus';
import 'element-plus/dist/index.css';
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const items = ref([
    { event: "降压药", time: "08:00", type: "medication", dosage: "2片", completed: false },
    { event: "散步", time: "09:00", type: "schedule", location: "公园", completed: false },
    { event: "体检", time: "14:00", type: "schedule", location: "医院", completed: false },
    { event: "维生素C", time: "20:00", type: "medication", dosage: "1片", completed: false }
])

// 模拟获取当日待办事项
const fetchTodayTodos = async () => {
  try {
    // 这里应该调用实际的API
    // const response = await axios.get('/api/todos?date=' + new Date().toISOString().split('T')[0])
    // items.value = response.data
  } catch (error) {
    console.error('获取待办事项失败:', error)
  }
}

onMounted(() => {
  fetchTodayTodos()
})

// 定时刷新待办事项
const refreshInterval = setInterval(fetchTodayTodos, 60000) // 每分钟刷新一次

onUnmounted(() => {
  clearInterval(refreshInterval)
})
</script>

<template>
    <el-scrollbar height="1.3rem">
        <div class="content">
            <!-- 长内容 -->
            <div 
                class="note" 
                v-for="item in items" 
                :key="item.event"
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
</template>

<style scoped>
.content {
    padding-left: 5%;
    padding-right: 2%;
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
</style>