<template>
  <div class="container">
    <div class="header">
      <div><img class="point" src="https://img.js.design/assets/element/js_lfvB7tyYGaK/image/995f618d3e38939be6526f8bce09de2823e41e2f.png" alt=""></div>
      <div class="title">历史数据</div>
    </div>
    
    <div class="date-display">
      {{ currentYear }}年{{ currentMonth }}月
    </div>
    
    <div class="view-options">
      <div 
        v-for="option in viewOptions" 
        :key="option.id"
        class="view-option"
        :class="{ active: selectedView === option.id }"
        @click="selectView(option.id)"
      >
        <img :src="option.icon" :alt="option.label" class="view-icon" />
        <div class="view-label">{{ option.label }}</div>
      </div>
    </div>
    
    <div class="content-area">
      <DayView v-if="selectedView === 'day'"></DayView>
      <WeekView v-else-if="selectedView === 'week'"></WeekView>
      <MonthView v-else-if="selectedView === 'month'"></MonthView>
      <YearView v-else-if="selectedView === 'year'"></YearView>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DayView from './DayView.vue';
import WeekView from './WeekView.vue';
import MonthView from './MonthView.vue';
import YearView from './YearView.vue';

const selectedView = ref('day');
const currentDate = ref(new Date());
      
const viewOptions = ref([
  { 
    id: 'day', 
    label: '日视图', 
    icon: 'https://img.js.design/assets/element/js_pq73bvU7fHR/image/635fd9bb6505ce1b7fffd9a4195a54b1626db830.png'
  },
  { 
    id: 'week', 
    label: '周视图', 
    icon: 'https://img.js.design/assets/element/js_lfvB7tyYGaK/image/3c0e2d001c5454d2c49bcec5382ce4956fd8a604.png'
  },
  { 
    id: 'month', 
    label: '月视图', 
    icon: 'https://img.js.design/assets/element/js_lfvB7tyYGaK/image/33e807aba2568335fe389169d401b5d31938d151.png'
  },
  { 
    id: 'year', 
    label: '年视图', 
    icon: 'https://img.js.design/assets/element/js_lfvB7tyYGaK/image/e5d755f14f08475f7d9dd03897ad42e8cc24db3b.png'
  }
]);
      
const currentYear = ref(currentDate.value.getFullYear());
const currentMonth = ref(currentDate.value.getMonth() + 1);
      
function selectView(viewId) {
  selectedView.value = viewId;
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  background: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 8px;
  box-sizing: border-box;
  font-family: 'SiYuanHeiTi';
}

.header {
  display: flex;
  align-items: center;
  gap: 0.05rem;
  height: 5%;
  padding: 0.05rem 0.05rem 0.025rem 0.05rem;
}
    
.title {
  font-size: 0.12rem;
  color: rgb(79, 108, 114);
}
    
.point {
  margin-top: 0.04rem;
  width: 0.12rem;
  height: 0.12rem;
  object-fit: contain;
}

.date-display {
  font-size: 0.125rem;
  margin-left: 0.17rem;
}

.view-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 0.05rem;
  gap: 0.1rem;
  height: 10%;
}

.view-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.view-option:hover {
  background-color: #f5f7fa;
}

.view-option.active {
  background-color: #ecf5ff;
}

.view-option.active .view-icon {
  filter: brightness(0) contrast(1.5);
  transform: scale(1.1);
}

.view-option.active .view-label {
  font-weight: 700;
  color: #000;
}

.view-icon {
  width: 60%;
  max-width: 0.22rem;
  height: auto;
  aspect-ratio: 1/1;
  object-fit: contain;
  transition: all 0.2s;
}

.view-label {
  font-size: 0.09rem;
  margin-top: 0.05rem;
  font-weight: 500;
  transition: all 0.2s;
  text-align: center;
}

.content-area {
  flex: 1;
  padding: 0.01rem;
  overflow-y: auto;
  width: 100%;
  height: 100%;
}

.content-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #409eff;
}

.content-area p {
  font-size: 13px;
  line-height: 1.4;
}
</style>