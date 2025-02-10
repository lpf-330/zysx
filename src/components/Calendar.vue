<script setup>
import { ref, computed } from 'vue';

// 初始数据
const currentDate = ref(new Date());
const events = ref(['2025-2-11', '2025-2-22']); // 示例待办日期

// 计算当前月份信息
const yearMonth = computed(() => ({
    year: currentDate.value.getFullYear(),
    month: currentDate.value.getMonth()
}));

// 生成日历的核心逻辑
const calendarWeeks = computed(() => {
    const { year, month } = yearMonth.value;
    const weeks = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 计算起始偏移（周一到周日）
    let dayOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    // 生成日期数组
    let currentDate = 1;
    for (let week = 0; week < 6; week++) {
        const days = [];
        for (let day = 0; day < 7; day++) {
            if ((week === 0 && day < dayOffset) || currentDate > lastDay.getDate()) {
                // 前后月份的空白日期
                days.push(createCalendarDay(false));
            } else {
                // 当前月份日期
                const dateStr = `${year}-${month + 1}-${currentDate}`;
                days.push({
                    date: currentDate,
                    isCurrentMonth: true,
                    isToday: isToday(year, month, currentDate),
                    hasEvent: events.value.includes(dateStr)
                });
                currentDate++;
            }
        }
        weeks.push(days);
        if (currentDate > lastDay.getDate()) break;
    }
    return weeks;
});

// 辅助函数
const createCalendarDay = (isCurrentMonth) => ({
    date: null,
    isCurrentMonth,
    isToday: false,
    hasEvent: false
});

const isToday = (y, m, d) => {
    const today = new Date();
    return y === today.getFullYear() &&
        m === today.getMonth() &&
        d === today.getDate();
};

// 月份切换
const prevMonth = () => {
    currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 1
    );
};

const nextMonth = () => {
    currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1
    );
};

// 格式化显示月份
const formattedMonth = computed(() => {
    return currentDate.value.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long'
    });
});

// 星期显示（周一到周日）
const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
</script>

<template>
    <div class="calendar-container">
        <div class="header">
            <button @click="prevMonth">
                < </button>
                    <span>{{ formattedMonth }}</span>
                    <button @click="nextMonth"> > </button>
        </div>

        <table class="calendar-grid">
            <thead>
                <tr>
                    <th v-for="(day, index) in weekDays" :key="index">{{ day }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(week, weekIndex) in calendarWeeks" :key="weekIndex">
                    <td v-for="(day, dayIndex) in week" :key="dayIndex" :class="[
                        { 'current-month': day.isCurrentMonth },
                        { 'today': day.isToday },
                        { 'has-event': day.hasEvent }
                    ]">
                        <div class="date">{{ day.date }}</div>
                        <div v-if="day.hasEvent" class="event-indicator"></div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>



<style scoped>
.calendar-container {
    width: 2rem;
    font-family: Arial, sans-serif;
    /* margin-top: 0.08rem; */
}

.header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.08rem;
    margin-bottom: 0.05rem;
    font-size: 0.13rem;
}

.calendar-grid {
    width: 100%;
    border-collapse: collapse;
}

th {
    font-family: 'OpenSans';
    color: rgba(179, 185, 200, 1);
    font-size: 0.1rem;
    width: 0.02rem;
    height: 0.2rem;
    text-align: center;
    position: relative;
}

td {
    width: 0.15rem;
    height: 0.2rem;
    text-align: center;
    position: relative;
}

.current-month {
    background-color: #fff;
}

.today {
    background-color: rgba(201, 226, 255, 1) !important;
    color: white;
    border-radius: 0.06rem;
}

.event-indicator {
    position: absolute;
    bottom: 0.14rem;
    left: 54%;
    top: -15%;
    transform: translateX(-50%);
    width: 0.05rem;
    height: 0.05rem;
    background-color: #2ecc71;
    border-radius: 50%;
}

/** */
.date {
    font-size: 0.12rem;
    font-weight: 700;
    font-family: 'OpenSans';
    cursor: default;
}

.current-month:hover {
    background-color: #ddd;
}

button {
    cursor: pointer;
    background: transparent;
    border: 0;
    color: #3498db;
    border-radius: 0.03rem;
    font-size: 0.12rem;
    font-weight: 600;
    width: 0.2rem;
    height: 0.15rem;
}
</style>