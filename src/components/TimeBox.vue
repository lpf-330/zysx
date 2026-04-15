<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const timeStr = ref('');
const dateStr = ref('');
const userName = ref('用户')

let timer = null;

function formatTime(date) {
    return date.toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(date) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDay = weekDays[date.getDay()];
    return `${year}.${month}.${day}  ${weekDay}`;
}

function updateDateTime() {
    const now = new Date();
    timeStr.value = formatTime(now);
    dateStr.value = formatDate(now);
}

onMounted(() => {
    updateDateTime();
    const secondsToNextMinute = 60 - new Date().getSeconds();
    timer = setTimeout(() => {
        updateDateTime();
        timer = setInterval(updateDateTime, 60000);
    }, secondsToNextMinute * 1000);
});

onBeforeUnmount(() => {
    clearTimeout(timer);
});
</script>

<template>
    <div class="greeting-card">
        <div class="left-content">
            <div class="time-display">{{ timeStr }}</div>
            <div class="date-display">{{ dateStr }}</div>
            <div class="user-greeting">
                <span class="greeting-text">{{ userName }}，您好</span>
            </div>
        </div>
        <div class="right-content">
            <img src="/111.png" alt="健康图标" class="health-image">
        </div>
    </div>
</template>

<style scoped>
.greeting-card {
    background: linear-gradient(135deg, #ffffff 0%, #f5faf5 100%);
    border-radius: 0.12rem;
    padding: 0.12rem 0.2rem;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 12px rgba(45, 87, 45, 0.06);
    border: 1px solid rgba(45, 87, 45, 0.08);
}

.left-content {
    display: flex;
    flex-direction: column;
    width: 1.5rem;
    flex-shrink: 0;
    margin-right: 0.15rem;
}

.time-display {
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.26rem;
    font-weight: 600;
    color: #2D572D;
    letter-spacing: 1px;
    line-height: 1;
}

.date-display {
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.1rem;
    color: #6B8E6B;
    margin-top: 0.04rem;
    letter-spacing: 0.5px;
}

.user-greeting {
    margin-top: 0.06rem;
}

.greeting-text {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.13rem;
    color: #3D5A3D;
    font-weight: 500;
}

.right-content {
    flex: 1;
    height: 0.8rem;
    display: flex;
    justify-content: flex-end;
}

.health-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>