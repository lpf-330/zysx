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
        <div class="right-decoration">
            <div class="leaf leaf-1">🌿</div>
            <div class="leaf leaf-2">🍃</div>
            <div class="leaf leaf-3">🌱</div>
        </div>
    </div>
</template>

<style scoped>
.greeting-card {
    background: linear-gradient(135deg, #ffffff 0%, #f5faf5 100%);
    border-radius: 0.12rem;
    padding: 0.18rem 0.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 12px rgba(45, 87, 45, 0.06);
    border: 1px solid rgba(45, 87, 45, 0.08);
}

.left-content {
    display: flex;
    flex-direction: column;
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

.right-decoration {
    position: relative;
    width: 0.8rem;
    height: 0.5rem;
}

.leaf {
    position: absolute;
    opacity: 0.4;
}

.leaf-1 {
    font-size: 0.22rem;
    top: 0;
    right: 0;
    animation: float 3s ease-in-out infinite;
}

.leaf-2 {
    font-size: 0.16rem;
    bottom: 0.05rem;
    right: 0.25rem;
    animation: float 3s ease-in-out infinite 1s;
}

.leaf-3 {
    font-size: 0.14rem;
    top: 0.15rem;
    right: 0.45rem;
    animation: float 3s ease-in-out infinite 2s;
}

@keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-3px) rotate(5deg); }
}
</style>