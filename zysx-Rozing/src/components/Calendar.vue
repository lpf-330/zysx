<script setup>
import { ref, computed, onMounted } from 'vue';
import { getTodosByDate } from '../api/user';

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth() + 1);
const selectedDay = ref(today.getDate());
const showYearPicker = ref(false);
const events = ref([]);

const user_id = localStorage.getItem('user_id') ? parseInt(localStorage.getItem('user_id')) : null;

const fetchEvents = async () => {
    try {
        const year = currentYear.value;
        const month = currentMonth.value;
        const lastDay = new Date(year, month, 0).getDate();
        const eventsMap = {};

        for (let day = 1; day <= lastDay; day++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            try {
                const response = await getTodosByDate(dateStr, user_id);
                const todos = response.data || [];
                if (todos && todos.length > 0) {
                    eventsMap[day] = todos;
                }
            } catch (error) {
                console.error(`获取日期 ${dateStr} 的事件失败:`, error);
            }
        }
        events.value = eventsMap;
    } catch (error) {
        console.error('获取事件失败:', error);
    }
};

const yearOptions = computed(() => {
    const years = [];
    for (let y = currentYear.value - 10; y <= currentYear.value + 10; y++) {
        years.push(y);
    }
    return years;
});

const daysInMonth = computed(() => {
    return new Date(currentYear.value, currentMonth.value, 0).getDate();
});

const firstDayOfMonth = computed(() => {
    return new Date(currentYear.value, currentMonth.value - 1, 1).getDay();
});

const monthName = computed(() => {
    const names = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return names[currentMonth.value - 1];
});

const prevMonth = () => {
    if (currentMonth.value === 1) {
        currentMonth.value = 12;
        currentYear.value--;
    } else {
        currentMonth.value--;
    }
    showYearPicker.value = false;
    fetchEvents();
};

const nextMonth = () => {
    if (currentMonth.value === 12) {
        currentMonth.value = 1;
        currentYear.value++;
    } else {
        currentMonth.value++;
    }
    showYearPicker.value = false;
    fetchEvents();
};

const selectYear = (year) => {
    currentYear.value = year;
    showYearPicker.value = false;
    fetchEvents();
};

const toggleYearPicker = () => {
    showYearPicker.value = !showYearPicker.value;
};

const selectDay = (day) => {
    selectedDay.value = day;
};

const isToday = (day) => {
    return day === today.getDate() &&
        currentMonth.value === today.getMonth() + 1 &&
        currentYear.value === today.getFullYear();
};

const isSelected = (day) => {
    return day === selectedDay.value;
};

const hasEvent = (day) => {
    return events.value && events.value[day] && events.value[day].length > 0;
};

onMounted(() => {
    fetchEvents();
});
</script>

<template>
    <div class="calendar-card">
        <div class="calendar-header">
            <div class="header-left">
                <span class="month-title" @click="toggleYearPicker">{{ monthName }}</span>
                <span class="year-badge" @click="toggleYearPicker">{{ currentYear }}年</span>
            </div>
            <div class="nav-buttons">
                <button class="nav-btn" @click="prevMonth">
                    <span>&lt;</span>
                </button>
                <button class="nav-btn" @click="nextMonth">
                    <span>&gt;</span>
                </button>
            </div>
        </div>

        <div v-if="showYearPicker" class="year-picker-overlay" @click.self="toggleYearPicker">
            <div class="year-picker">
                <div class="year-grid">
                    <span
                        v-for="year in yearOptions"
                        :key="year"
                        class="year-option"
                        :class="{ 'active': year === currentYear }"
                        @click="selectYear(year)"
                    >
                        {{ year }}
                    </span>
                </div>
            </div>
        </div>

        <div class="calendar-grid">
            <div class="week-header">
                <span v-for="day in weekDays" :key="day" class="week-day">{{ day }}</span>
            </div>
            <div class="days-grid">
                <span
                    v-for="i in firstDayOfMonth"
                    :key="'empty-' + i"
                    class="day-cell empty"
                ></span>
                <span
                    v-for="day in daysInMonth"
                    :key="day"
                    class="day-cell"
                    :class="{
                        'today': isToday(day),
                        'selected': isSelected(day),
                        'has-event': hasEvent(day)
                    }"
                    @click="selectDay(day)"
                >
                    {{ day }}
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.calendar-card {
    background: linear-gradient(135deg, #ffffff 0%, #fafcf8 100%);
    border-radius: 0.1rem;
    padding: 0.08rem;
    box-shadow: 0 2px 10px rgba(45, 87, 45, 0.05);
    border: 1px solid rgba(45, 87, 45, 0.08);
    position: relative;
    width: 100%;
    box-sizing: border-box;
}

.calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 0.06rem;
    margin-bottom: 0.06rem;
    border-bottom: 1px solid rgba(45, 87, 45, 0.06);
}

.header-left {
    display: flex;
    align-items: center;
    gap: 0.08rem;
}

.month-title {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.12rem;
    font-weight: 600;
    color: #2D572D;
    cursor: pointer;
    transition: color 0.2s;
}

.month-title:hover {
    color: #1a3d1a;
}

.year-badge {
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.1rem;
    color: #6B8E6B;
    background: rgba(45, 87, 45, 0.06);
    padding: 0.02rem 0.08rem;
    border-radius: 0.04rem;
    cursor: pointer;
    transition: all 0.2s;
}

.year-badge:hover {
    background: rgba(45, 87, 45, 0.12);
    color: #2D572D;
}

.nav-buttons {
    display: flex;
    gap: 0.04rem;
}

.nav-btn {
    background: rgba(45, 87, 45, 0.06);
    border: none;
    width: 0.24rem;
    height: 0.24rem;
    border-radius: 0.04rem;
    cursor: pointer;
    color: #2D572D;
    font-size: 0.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.nav-btn:hover {
    background: rgba(45, 87, 45, 0.12);
}

.year-picker-overlay {
    position: absolute;
    top: 0.5rem;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255,255,255,0.95);
    border-radius: 0.08rem;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
}

.year-picker {
    width: 90%;
    background: #fff;
    border: 1px solid rgba(45, 87, 45, 0.1);
    border-radius: 0.08rem;
    padding: 0.12rem;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.year-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.06rem;
}

.year-option {
    text-align: center;
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.12rem;
    color: #666;
    padding: 0.06rem;
    border-radius: 0.04rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.year-option:hover {
    background: rgba(45, 87, 45, 0.08);
    color: #2D572D;
}

.year-option.active {
    background: #2D572D;
    color: #fff;
}

.calendar-grid {
    width: 100%;
}

.week-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 0.02rem;
}

.week-day {
    text-align: center;
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.08rem;
    color: #999;
    padding: 0.01rem 0;
}

.days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.01rem;
}

.day-cell {
    aspect-ratio: 1.2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.1rem;
    color: #333;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
}

.day-cell:not(.empty):hover {
    background: rgba(45, 87, 45, 0.08);
    color: #2D572D;
}

.day-cell.today {
    color: #D32F2F;
    font-weight: 600;
}

.day-cell.selected {
    background: #2D572D;
    color: #fff;
}

.day-cell.empty {
    cursor: default;
}

.day-cell.has-event {
    position: relative;
}

.day-cell.has-event::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background: #4CAF50;
    border-radius: 50%;
}

.day-cell.selected.has-event::after {
    background: white;
}
</style>
