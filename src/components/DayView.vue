<template>
  <div class="calendar-container" @wheel="handleWheel">
    <div class="week-header">
      <div v-for="(day, index) in weekDays" :key="index" class="week-day">
        {{ day }}
      </div>
    </div>
    
    <div class="months-wrapper" ref="monthsWrapper">
      <div 
        class="month-navigation" 
        :class="{ 
          'animating': isAnimating,
          'animating-up': animationDirection === 'up',
          'animating-down': animationDirection === 'down'
        }"
      >
        <div class="prev-month" @click="prevMonth">
          <div class="month-header">
            {{ getMonthName(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).getMonth()) }}
          </div>
          <div class="year-display">
            {{ new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).getFullYear() }}年
          </div>
          <table class="calendar-grid other-month">
            <tbody>
              <tr v-for="(week, weekIndex) in prevMonthCalendar" :key="'prev-'+weekIndex">
                <td v-for="(day, dayIndex) in week" :key="'prev-'+dayIndex" 
                  :class="[
                    { 'current-month': day.isCurrentMonth },
                    { 'today': day.isToday },
                    { 'has-event': day.hasEvent },
                    { 'selected': day.isSelected }
                  ]"
                  @click="selectDate(day)">
                  <div class="date">{{ day.date }}</div>
                  <div v-if="day.hasEvent" class="event-indicator"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="current-month-container">
          <div class="month-header-current">
            <div class="month-display">{{ formattedMonth }}</div>
            <div class="year-display-current">
              {{ currentDate.getFullYear() }}年
            </div>
          </div>
          <table class="calendar-grid current-month">
            <tbody>
              <tr v-for="(week, weekIndex) in currentMonthCalendar" :key="'current-'+weekIndex">
                <td v-for="(day, dayIndex) in week" :key="'current-'+dayIndex" 
                  :class="[
                    { 'current-month': day.isCurrentMonth },
                    { 'today': day.isToday },
                    { 'has-event': day.hasEvent },
                    { 'selected': day.isSelected }
                  ]"
                  @click="selectDate(day)">
                  <div class="date">{{ day.date }}</div>
                  <div v-if="day.hasEvent" class="event-indicator"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="next-month" @click="nextMonth">
          <div class="month-header">
            {{ getMonthName(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).getMonth()) }}
          </div>
          <div class="year-display">
            {{ new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).getFullYear() }}年
          </div>
          <table class="calendar-grid other-month">
            <tbody>
              <tr v-for="(week, weekIndex) in nextMonthCalendar" :key="'next-'+weekIndex">
                <td v-for="(day, dayIndex) in week" :key="'next-'+dayIndex" 
                  :class="[
                    { 'current-month': day.isCurrentMonth },
                    { 'today': day.isToday },
                    { 'has-event': day.hasEvent },
                    { 'selected': day.isSelected }
                  ]"
                  @click="selectDate(day)">
                  <div class="date">{{ day.date }}</div>
                  <div v-if="day.hasEvent" class="event-indicator"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';

const currentDate = ref(new Date());
const selectedDate = ref(null);
const events = ref(['2025-5-11', '2025-5-22']);
const isAnimating = ref(false);
const animationDirection = ref('none');
const monthsWrapper = ref(null);

// 缓存日历数据以避免重复计算
const calendarCache = ref(new Map());

const yearMonth = computed(() => ({
    year: currentDate.value.getFullYear(),
    month: currentDate.value.getMonth()
}));

const getCalendarWeeks = (year, month) => {
    const cacheKey = `${year}-${month}`;
    
    // 如果缓存中存在，直接返回缓存结果
    if (calendarCache.value.has(cacheKey)) {
        return calendarCache.value.get(cacheKey);
    }

    const weeks = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let dayOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    let dayCount = 1;
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    const prevMonthStart = prevMonthDays - dayOffset + 1;

    for (let week = 0; week < 6; week++) {
        const days = [];
        for (let day = 0; day < 7; day++) {
            if (week === 0 && day < dayOffset) {
                const date = prevMonthStart + day;
                const dateStr = `${prevMonth.getFullYear()}-${prevMonth.getMonth() + 1}-${date}`;
                const fullDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), date);
                const isSelected = selectedDate.value && isSameDay(selectedDate.value, fullDate);
                const isTodayDate = isToday(prevMonth.getFullYear(), prevMonth.getMonth(), date);
                
                days.push({
                    date: date,
                    fullDate: fullDate,
                    isCurrentMonth: false,
                    isToday: isTodayDate && !isSelected,
                    hasEvent: events.value.includes(dateStr),
                    isSelected: isSelected
                });
            } else if (dayCount <= lastDay.getDate()) {
                const dateStr = `${year}-${month + 1}-${dayCount}`;
                const fullDate = new Date(year, month, dayCount);
                const isSelected = selectedDate.value && isSameDay(selectedDate.value, fullDate);
                const isTodayDate = isToday(year, month, dayCount);
                
                days.push({
                    date: dayCount,
                    fullDate: fullDate,
                    isCurrentMonth: true,
                    isToday: isTodayDate && !isSelected,
                    hasEvent: events.value.includes(dateStr),
                    isSelected: isSelected
                });
                dayCount++;
            } else {
                const nextMonth = new Date(year, month + 1, 1);
                const date = dayCount - lastDay.getDate();
                const dateStr = `${nextMonth.getFullYear()}-${nextMonth.getMonth() + 1}-${date}`;
                const fullDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), date);
                const isSelected = selectedDate.value && isSameDay(selectedDate.value, fullDate);
                const isTodayDate = isToday(nextMonth.getFullYear(), nextMonth.getMonth(), date);
                
                days.push({
                    date: date,
                    fullDate: fullDate,
                    isCurrentMonth: false,
                    isToday: isTodayDate && !isSelected,
                    hasEvent: events.value.includes(dateStr),
                    isSelected: isSelected
                });
                dayCount++;
            }
        }
        weeks.push(days);
        if (dayCount > lastDay.getDate() + 7) break;
    }
    
    // 缓存结果
    calendarCache.value.set(cacheKey, weeks);
    return weeks;
};

const prevMonthCalendar = computed(() => {
    const prevMonth = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 1,
        1
    );
    return getCalendarWeeks(prevMonth.getFullYear(), prevMonth.getMonth());
});

const currentMonthCalendar = computed(() => {
    const { year, month } = yearMonth.value;
    return getCalendarWeeks(year, month);
});

const nextMonthCalendar = computed(() => {
    const nextMonth = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        1
    );
    return getCalendarWeeks(nextMonth.getFullYear(), nextMonth.getMonth());
});

const isToday = (y, m, d) => {
    const today = new Date();
    return y === today.getFullYear() &&
        m === today.getMonth() &&
        d === today.getDate();
};

const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

const formattedMonth = computed(() => {
    const month = currentDate.value.getMonth() + 1;
    return `${month}月`;
});

const selectDate = (day) => {
    if (day.fullDate) {
        selectedDate.value = day.fullDate;
        // 清除缓存，因为选中状态可能改变
        calendarCache.value.clear();
    }
};

const handleWheel = (e) => {
    e.preventDefault();
    if (isAnimating.value) return;
    
    if (e.deltaY > 0) {
        nextMonth();
    } else {
        prevMonth();
    }
};

const prevMonth = async () => {
    if (isAnimating.value) return;
    isAnimating.value = true;
    animationDirection.value = 'up';
    
    setTimeout(() => {
        currentDate.value = new Date(
            currentDate.value.getFullYear(),
            currentDate.value.getMonth() - 1,
            1
        );
        
        // 等待DOM更新后滚动到当前月份
        nextTick(() => {
          scrollToCurrentMonth();
        });
        
        setTimeout(() => {
            isAnimating.value = false;
            animationDirection.value = 'none';
        }, 50);
    }, 200); 
};

const nextMonth = async () => {
    if (isAnimating.value) return;
    isAnimating.value = true;
    animationDirection.value = 'down';
    
    setTimeout(() => {
        currentDate.value = new Date(
            currentDate.value.getFullYear(),
            currentDate.value.getMonth() + 1,
            1
        );
        
        // 等待DOM更新后滚动到当前月份
        nextTick(() => {
          scrollToCurrentMonth();
        });
        
        setTimeout(() => {
            isAnimating.value = false;
            animationDirection.value = 'none';
        }, 50);
    }, 200);
};

const getMonthName = (month) => {
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    return monthNames[month];
};

// 星期标题
const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

// 监听日期变化，预加载相邻月份数据
watch(currentDate, () => {
    // 预加载下下个月的数据到缓存
    const nextNextMonth = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 2,
        1
    );
    getCalendarWeeks(nextNextMonth.getFullYear(), nextNextMonth.getMonth());
    
    // 加载上上个月的数据到缓存
    const prevPrevMonth = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 2,
        1
    );
    getCalendarWeeks(prevPrevMonth.getFullYear(), prevPrevMonth.getMonth());
}, { immediate: true });

const scrollToCurrentMonth = () => {
    if (monthsWrapper.value) {
        const currentMonthElement = monthsWrapper.value.querySelector('.current-month-container');
        if (currentMonthElement) {
            const wrapperHeight = monthsWrapper.value.clientHeight;
            const elementHeight = currentMonthElement.offsetHeight;
            const elementTop = currentMonthElement.offsetTop;
            
            // 动到使当前月份居中
            monthsWrapper.value.scrollTop = elementTop - (wrapperHeight / 2) + (elementHeight / 2);
        }
    }
};

onMounted(() => {
    scrollToCurrentMonth();
});
</script>

<style scoped>
.calendar-container {
    width: 100%;
    height: 100%;
    font-family: Arial, sans-serif;
    background: white;
    overflow: hidden;
    font-family: 'SiYuanHeiTi';
    display: flex;
    flex-direction: column;
}

.week-header {
    display: flex;
    justify-content: space-around;
    margin-bottom: 0.02rem;
    border-bottom: 0.01rem solid #eee;
    padding-bottom: 0.05rem;
    flex-shrink: 0;
    margin-right: 0.1rem;
}

.week-day {
    width: 0.2rem;
    text-align: center;
    font-size: 0.09rem;
    font-weight: 600;
    color: #666;
}

.months-wrapper {
    flex: 1;
    overflow-y: auto;
    position: relative;
    scroll-behavior: smooth;
}

.month-navigation {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.month-navigation.animating-up {
    transform: translateY(20px);
    opacity: 0.7;
}

.month-navigation.animating-down {
    transform: translateY(-20px);
    opacity: 0.7;
}

.prev-month, .next-month {
    opacity: 0.6;
    transition: all 0.3s ease;
}

.prev-month:hover, .next-month:hover {
    opacity: 1;
    transform: translateY(-2px);
}

.month-header {
    font-size: 0.1rem;
    font-weight: 700;
    color: #888;
    margin-bottom: 0.01rem;
    text-align: left;
    padding-left: 0.04rem;
}

.month-header-current {
    position: relative;
    margin-bottom: 0.05rem;
}

.month-display {
    font-size: 0.11rem;
    font-weight: 700;
    color: rgba(52, 152, 219, 1);
    text-align: center;
}

.year-display {
    font-size: 0.08rem;
    color: #aaa;
    text-align: left;
    padding-left: 0.04rem;
    margin-top: 0.01rem;
}

.year-display-current {
    position: absolute;
    font-size: 0.11rem;
    font-weight: 700;
    color: #767676;
    margin-top: -0.152rem;
    padding-left: 0.04rem;
}

.current-month-container {
    margin: 0.05rem 0;
    transition: all 0.3s ease;
}

.calendar-grid {
    width: 100%;
    border-collapse: collapse;
}

td {
    width: calc(100% / 7);
    height: 0.19635rem;
    text-align: center;
    position: relative;
    cursor: pointer;
}

.current-month {
    background-color: #fff;
    color: #333;
}

.other-month {
    background-color: #fff;
    color: #bbb;
    font-size: 0.09rem;
}

.today {
    background-color: rgba(201, 226, 255, 1) !important;
    color: white;
    border-radius: 10px;
}

.selected {
    background-color: rgb(95, 182, 239) !important;
    color: white;
    border-radius: 10px;
}

.event-indicator {
    position: absolute;
    bottom: 3px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background-color: #2ecc71;
    border-radius: 50%;
}

.date {
    font-size: 0.09rem;
    font-weight: 600;
    font-family: 'Open Sans', sans-serif;
}

.current-month:hover {
    background-color: #f0f0f0;
    border-radius: 0.05rem;
}

.other-month:hover {
    background-color: #f5f5f5;
    border-radius: 0.05rem;
}

.selected:hover {
    background-color: rgb(76, 174, 240) !important;
}
</style>