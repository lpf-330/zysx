<template>
  <div class="calendar-container" @wheel="handleWheel">
    <div class="year-header">
      <div 
        v-for="(year, index) in years" :key="index" 
        class="year-display"
        :class="{ 'selected-year': year === currentYear && isCurrentYearSelected }"
        @click="selectYear(year)"
      >
        {{ year }}
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
        <div class="prev-year" @click="prevYear">
          <div class="year-header-prev">
            {{ prevYearDisplay }}年
          </div>
          <div class="months-grid other-year">
            <div v-for="(month, monthIndex) in prevYearMonths" :key="'prev-'+monthIndex" 
              :class="[
                { 'current-year': month.isCurrentYear },
                { 'today': month.isToday }
              ]"
              @click="selectMonth(month)">
              <div class="month-name">{{ month.name }}</div>
            </div>
          </div>
        </div>
        
        <div class="current-year-container">
          <div class="year-header-current">
            <div class="year-display-current">{{ currentYear }}年</div>
          </div>
          <div class="months-grid current-year" :class="{ 'selected': isCurrentYearSelected }">
            <div v-for="(month, monthIndex) in currentYearMonths" :key="'current-'+monthIndex" 
              :class="[
                { 'current-year': month.isCurrentYear },
                { 'today': month.isToday }
              ]"
              @click="selectMonth(month)">
              <div class="month-name">{{ month.name }}</div>
            </div>
          </div>
        </div>
        
        <div class="next-year" @click="nextYear">
          <div class="year-header-next">
            {{ nextYearDisplay }}年
          </div>
          <div class="months-grid other-year">
            <div v-for="(month, monthIndex) in nextYearMonths" :key="'next-'+monthIndex" 
              :class="[
                { 'current-year': month.isCurrentYear },
                { 'today': month.isToday }
              ]"
              @click="selectMonth(month)">
              <div class="month-name">{{ month.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';

const currentDate = ref(new Date());
const selectedDate = ref(new Date()); // 默认选中当前日期
const isAnimating = ref(false);
const animationDirection = ref('none');
const monthsWrapper = ref(null);

// 缓存月份数据以避免重复计算
const monthCache = ref(new Map());

const currentYear = computed(() => currentDate.value.getFullYear());

// 计算当前年份是否被选中
const isCurrentYearSelected = computed(() => {
  return selectedDate.value && selectedDate.value.getFullYear() === currentYear.value;
});

const getMonthsForYear = (year) => {
    const cacheKey = `${year}`;
    
    // 如果缓存中存在，直接返回缓存结果
    if (monthCache.value.has(cacheKey)) {
        return monthCache.value.get(cacheKey);
    }

    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
        const monthName = getMonthName(i);
        const isSelected = selectedDate.value && 
                          selectedDate.value.getFullYear() === year;
        const isTodayMonth = today.getFullYear() === year && today.getMonth() === i;
        
        months.push({
            name: monthName,
            year: year,
            month: i,
            isCurrentYear: year === currentYear.value,
            isToday: isTodayMonth && !isSelected,
            isSelected: isSelected
        });
    }
    
    // 缓存结果
    monthCache.value.set(cacheKey, months);
    return months;
};

const prevYearMonths = computed(() => {
    const prevYear = currentDate.value.getFullYear() - 1;
    return getMonthsForYear(prevYear);
});

const currentYearMonths = computed(() => {
    return getMonthsForYear(currentYear.value);
});

const nextYearMonths = computed(() => {
    const nextYear = currentDate.value.getFullYear() + 1;
    return getMonthsForYear(nextYear);
});

const prevYearDisplay = computed(() => {
    return `${currentDate.value.getFullYear() - 1}`;
});

const nextYearDisplay = computed(() => {
    return `${currentDate.value.getFullYear() + 1}`;
});

const getMonthName = (month) => {
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    return monthNames[month];
};

const selectMonth = (month) => {
    if (month.year !== undefined) {
        selectedDate.value = new Date(month.year, month.month, 1);
        // 清除缓存，因为选中状态可能改变
        monthCache.value.clear();
    }
};

const selectYear = (year) => {
    // 选择年份时，将该年份设置为选中状态
    selectedDate.value = new Date(year, 0, 1); // 选择该年1月1日
    if (year !== currentYear.value) {
        currentDate.value = new Date(year, currentDate.value.getMonth(), 1);
    }
    // 清除缓存，因为选中状态可能改变
    monthCache.value.clear();
};

const handleWheel = (e) => {
    e.preventDefault();
    if (isAnimating.value) return;
    
    if (e.deltaY > 0) {
        nextYear();
    } else {
        prevYear();
    }
};

const prevYear = async () => {
    if (isAnimating.value) return;
    isAnimating.value = true;
    animationDirection.value = 'up';
    
    setTimeout(() => {
        currentDate.value = new Date(
            currentDate.value.getFullYear() - 1,
            currentDate.value.getMonth(),
            1
        );
        
        // 等待DOM更新后滚动到当前年份
        nextTick(() => {
          scrollToCurrentYear();
        });
        
        setTimeout(() => {
            isAnimating.value = false;
            animationDirection.value = 'none';
        }, 50); 
    }, 200); 
};

const nextYear = async () => {
    if (isAnimating.value) return;
    isAnimating.value = true;
    animationDirection.value = 'down';
    
    setTimeout(() => {
        currentDate.value = new Date(
            currentDate.value.getFullYear() + 1,
            currentDate.value.getMonth(),
            1
        );
        
        // 等待DOM更新后滚动到当前年份
        nextTick(() => {
          scrollToCurrentYear();
        });
        
        setTimeout(() => {
            isAnimating.value = false;
            animationDirection.value = 'none';
        }, 50); 
    }, 200);
};

// 年份标题
const years = computed(() => {
    const current = currentDate.value.getFullYear();
    return [current - 1, current, current + 1];
});

// 监听日期变化，预加载相邻年份数据
watch(currentDate, () => {
    // 预加载下下个年份的数据到缓存
    const nextNextYear = currentDate.value.getFullYear() + 2;
    getMonthsForYear(nextNextYear);
    
    // 加载上上个年份的数据到缓存
    const prevPrevYear = currentDate.value.getFullYear() - 2;
    getMonthsForYear(prevPrevYear);
}, { immediate: true });

const scrollToCurrentYear = () => {
    if (monthsWrapper.value) {
        const currentYearElement = monthsWrapper.value.querySelector('.current-year-container');
        if (currentYearElement) {
            const wrapperHeight = monthsWrapper.value.clientHeight;
            const elementHeight = currentYearElement.offsetHeight;
            const elementTop = currentYearElement.offsetTop;
            
            // 动到使当前年份居中
            monthsWrapper.value.scrollTop = elementTop - (wrapperHeight / 2) + (elementHeight / 2);
        }
    }
};

onMounted(() => {
    // 默认选中当前年份
    selectedDate.value = new Date();
    scrollToCurrentYear();
});
</script>

<style scoped>
.calendar-container {
    width: 100%;
    height: 100%;
    background: white;
    overflow: hidden;
    font-family: 'SiYuanHeiTi';
    display: flex;
    flex-direction: column;
}

.year-header {
    display: flex;
    justify-content: space-around;
    margin-bottom: 0.02rem;
    border-bottom: 0.01rem solid #eee;
    padding-bottom: 0.05rem;
    flex-shrink: 0;
    margin-right: 0.1rem;
    gap: 0.1rem;
}

.year-display {
    width: 0.8rem;
    text-align: center;
    font-size: 0.09rem;
    font-weight: 600;
    color: #666;
    cursor: pointer;
    padding: 0.03rem 0.05rem;
    border-radius: 0.03rem;
    transition: all 0.2s ease;
    position: relative;
}

.year-display:hover {
    background-color: #f0f0f0;
    color: #333;
}

.year-display.selected-year {
    background-color: rgba(52, 152, 219, 0.2);
    color: rgba(52, 152, 219, 1);
    font-weight: 700;
}

.year-display.selected-year::after {
    content: '';
    position: absolute;
    bottom: -0.06rem;
    left: 50%;
    transform: translateX(-50%);
    width: 0.65rem;
    height: 0.01rem;
    background-color: rgba(52, 152, 219, 1);
    border-radius: 0.01rem;
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

.prev-year, .next-year {
    opacity: 0.6;
    transition: all 0.3s ease;
}

.prev-year:hover, .next-year:hover {
    opacity: 1;
    transform: translateY(-2px);
}

.year-header-prev, .year-header-next {
    font-size: 0.1rem;
    font-weight: 700;
    color: #888;
    margin-bottom: 0.01rem;
    text-align: left;
    padding-left: 0.22rem;
}

.year-header-current {
    position: relative;
    margin-bottom: 0.05rem;
}

.year-display-current {
    font-size: 0.11rem;
    font-weight: 700;
    color: rgba(52, 152, 219, 1);
    text-align: center;
}

.current-year-container {
    margin: 0.05rem 0;
    transition: all 0.3s ease;
}

.months-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.05rem;
    padding: 0.05rem;
    border-radius: 0.05rem;
    transition: all 0.2s ease;
}

.months-grid div {
    width: 100%;
    height: 0.19635rem;
    text-align: center;
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.05rem;
    font-size: 0.09rem;
    font-weight: 600;
    transition: all 0.2s ease;
}

.current-year {
    background-color: #fff;
    color: #333;
}

.other-year {
    background-color: #fff;
    color: #bbb;
    font-size: 0.09rem;
}

.today {
    background-color: rgba(201, 226, 255, 1) !important;
    color: white;
}

.selected {
    background-color: rgb(95, 182, 239) !important;
    color: white;
}

.month-name {
    font-size: 0.09rem;
    font-weight: 600;
    font-family: 'Open Sans', sans-serif;
}

.current-year:hover {
    background-color: #f0f0f0;
    border-radius: 0.05rem;
}

.other-year:hover {
    background-color: #f5f5f5;
    border-radius: 0.05rem;
}

.selected:hover {
    background-color: rgb(76, 174, 240) !important;
}

.months-grid.current-year.selected {
    background-color: rgb(95, 182, 239) !important;
    color: white;
}

.months-grid.current-year.selected .current-year {
    background-color: transparent !important;
    color: white;
}

.months-grid.current-year.selected .current-year:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
}
</style>