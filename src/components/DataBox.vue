<script setup>
import HeartData from './HeartData.vue';
import BloodData from './BloodData.vue';
import PiData from './PiData.vue';
import OxygenData from './OxygenData.vue';
import SleepData from './SleepData.vue';
import PressureData from './PressureData.vue';
import { ref, computed, onBeforeMount, onMounted, onBeforeUnmount } from 'vue';
import router from '../router';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';
import {
    getBloodData,
    getHeartData,
    getOxygenData,
    getPiData,
    getPreData,
    getSlpData,
    subscribeHeartData,
    subscribeBloodData,
    subscribeOxygenData,
    subscribePiData,
    subscribePreData,
    subscribeSlpData,
    unsubscribeUserAllRealTimeData
} from '../api/healthData';

const heartData = ref([])
const bloodData = ref([])
const piData = ref([])
const oxygenData = ref(0)
const sleepData = ref([])
const pressureData = ref([])

const userInfoStore = storeToRefs(useUserInfoStore())
const user_id = computed(() => userInfoStore.user_id.value)

const cards = [
    { id: 'heart', name: '心率', icon: '♥', unit: 'bpm', color: '#E57373', key: 'heartData' },
    { id: 'blood', name: '血糖', icon: '🩸', unit: 'mmol/L', color: '#9575CD', key: 'bloodData' },
    { id: 'oxygen', name: '血氧', icon: '💧', unit: '%', color: '#4FC3F7', key: 'oxygenData' },
    { id: 'pressure', name: '血压', icon: '●', unit: 'mmHg', color: '#F06292', key: 'pressureData' },
    { id: 'sleep', name: '睡眠', icon: '▲', unit: 'h', color: '#81C784', key: 'sleepData' },
    { id: 'pi', name: '灌注指数', icon: '◆', unit: 'pi', color: '#FFB74D', key: 'piData' },
];

const getCardStyle = (card) => ({
    '--card-color': card.color
});

const activeCardIndex = ref(0)

const handleCardClick = (index) => {
    activeCardIndex.value = index
}

const handleScroll = (e) => {
    e.preventDefault()
    const scrollSensitivity = 0.1
    const delta = e.deltaY * scrollSensitivity
    activeCardIndex.value = Math.max(0, Math.min(cards.length - 1, activeCardIndex.value + delta))
}

let containerRef = null

const setContainerRef = (el) => {
    if (el) {
        containerRef = el
    }
}

onMounted(() => {
    if (containerRef) {
        containerRef.addEventListener('wheel', handleScroll, { passive: false })
    }
})

onBeforeUnmount(() => {
    if (containerRef) {
        containerRef.removeEventListener('wheel', handleScroll)
    }
})

const toggleRouter = (str) => {
    userInfoStore.siderMode.value = 1
    router.push({ name: str })
}

const fetchData = async () => {
  try {
    const [
      heartResponse,
      piResponse,
      sleepResponse,
      bloodResponse,
      pressureResponse,
      oxygenResponse
    ] = await Promise.allSettled([
      getHeartData(user_id.value),
      getPiData(user_id.value),
      getSlpData(user_id.value),
      getBloodData(user_id.value),
      getPreData(user_id.value),
      getOxygenData(user_id.value)
    ]);

    if (heartResponse.status === 'fulfilled') {
      const response = heartResponse.value;
      const heartArray = response || [];
      const heartCount = Math.min(4, heartArray.length);
      const latestHeartUnprocessed = heartArray.slice(0, heartCount);
      const latestHeartProcessed = latestHeartUnprocessed.reverse();
      heartData.value = latestHeartProcessed.map(item => Number(item.heartData));
    }

    if (piResponse.status === 'fulfilled') {
      const response = piResponse.value;
      const piCount = Math.min(4, response?.length || 0);
      const latestPiUnprocessed = (response || []).slice(0, piCount);
      const latestPiProcessed = latestPiUnprocessed.reverse();
      piData.value = latestPiProcessed.map(item => Number(item.piData));
    }

    if (sleepResponse.status === 'fulfilled') {
      const response = sleepResponse.value;
      const sleepCount = Math.min(4, response?.length || 0);
      const latestSleepUnprocessed = (response || []).slice(0, sleepCount);
      const latestSleepProcessed = latestSleepUnprocessed.reverse();
      sleepData.value = latestSleepProcessed.map(item => Number(item.sleepData));
    }

    if (bloodResponse.status === 'fulfilled') {
      const response = bloodResponse.value;
      const bloodCount = Math.min(7, response?.length || 0);
      const latestBloodUnprocessed = (response || []).slice(0, bloodCount);
      const latestBloodProcessed = latestBloodUnprocessed.reverse();
      bloodData.value = latestBloodProcessed.map(item => Number(item.bloodData));
    }

    if (pressureResponse.status === 'fulfilled') {
      const response = pressureResponse.value;
      if (response && response.length > 0) {
        const latestBP = response[0];
        pressureData.value = [
          Number(latestBP.systolicBp),
          Number(latestBP.diastolicBp)
        ];
      }
    }

    if (oxygenResponse.status === 'fulfilled') {
      const response = oxygenResponse.value;
      if (response && response.length > 0) {
        const latestOxygen = response[0];
        oxygenData.value = Number(latestOxygen.oxygenData) * 0.01;
      } else {
         oxygenData.value = 0;
      }
    }

  } catch (error) {
    console.error("获取数据过程中发生未知错误", error);
  }
};

const startRealTimeSubscriptions = () => {
  unsubscribeUserAllRealTimeData(user_id.value);

  subscribeHeartData(user_id.value, (data) => {
    if (Array.isArray(data) && data.length > 0) {
      const heartCount = Math.min(4, data.length);
      const latestHeartUnprocessed = data.slice(0, heartCount);
      const latestHeartProcessed = latestHeartUnprocessed.reverse();
      heartData.value = latestHeartProcessed.map(item => Number(item.heartData));
    }
  });

  subscribeBloodData(user_id.value, (data) => {
    if (Array.isArray(data) && data.length > 0) {
      const bloodCount = Math.min(7, data.length);
      const latestBloodUnprocessed = data.slice(0, bloodCount);
      const latestBloodProcessed = latestBloodUnprocessed.reverse();
      bloodData.value = latestBloodProcessed.map(item => Number(item.bloodData));
    }
  });

  subscribePiData(user_id.value, (data) => {
    if (Array.isArray(data) && data.length > 0) {
      const piCount = Math.min(4, data.length);
      const latestPiUnprocessed = data.slice(0, piCount);
      const latestPiProcessed = latestPiUnprocessed.reverse();
      piData.value = latestPiProcessed.map(item => Number(item.piData));
    }
  });

  subscribeOxygenData(user_id.value, (data) => {
    if (Array.isArray(data) && data.length > 0) {
      const latestOxygen = data[0];
      oxygenData.value = Number(latestOxygen.oxygenData) * 0.01;
    }
  });

  subscribeSlpData(user_id.value, (data) => {
    if (Array.isArray(data) && data.length > 0) {
      const sleepCount = Math.min(4, data.length);
      const latestSleepUnprocessed = data.slice(0, sleepCount);
      const latestSleepProcessed = latestSleepUnprocessed.reverse();
      sleepData.value = latestSleepProcessed.map(item => Number(item.sleepData));
    }
  });

  subscribePreData(user_id.value, (data) => {
    if (Array.isArray(data) && data.length > 0) {
      const latestBP = data[0];
      pressureData.value = [
        Number(latestBP.systolicBp),
        Number(latestBP.diastolicBp)
      ];
    }
  });
};

onBeforeMount(() => {
  fetchData();
  startRealTimeSubscriptions();
});

onBeforeUnmount(() => {
  unsubscribeUserAllRealTimeData(user_id.value);
});
</script>

<template>
    <div class="data-container" ref="setContainerRef">
        <div class="section-header">
            <div class="section-title">
                <span class="title-text">健康数据概览</span>
                <span class="title-line"></span>
            </div>
            <span class="update-time">实时监测</span>
        </div>

        <div class="main-content">
            <div class="timeline-section">
                <div class="timeline">
                    <div
                        v-for="(card, index) in cards"
                        :key="card.id"
                        class="timeline-item"
                        :class="{ active: index === activeCardIndex }"
                        @click="handleCardClick(index)"
                        :style="{ '--card-color': card.color }"
                    >
                        <div class="timeline-dot"></div>
                        <div class="timeline-label">{{ card.name }}</div>
                    </div>
                </div>
            </div>

            <div class="cards-section">
                <div class="stack-container" style="perspective: 1500px;">
                    <div class="stack-wrapper" style="transform-style: preserve-3d;">
                        <div
                            v-for="(card, index) in [...cards].reverse()"
                            :key="card.id"
                            class="stack-card"
                            :style="{
                                transform: `
                                    translateZ(${(cards.length - 1 - index - activeCardIndex) * -60}px)
                                    translateY(${(cards.length - 1 - index - activeCardIndex) * -20}px)
                                    scale(${Math.max(0.6, 1 - Math.abs(cards.length - 1 - index - activeCardIndex) * 0.15)})
                                `,
                                opacity: Math.abs(cards.length - 1 - index - activeCardIndex) < 0.5 ? 1 : 0,
                                zIndex: Math.round((cards.length - Math.abs(cards.length - 1 - index - activeCardIndex)) * 10),
                                pointerEvents: Math.abs(cards.length - 1 - index - activeCardIndex) < 0.5 ? 'auto' : 'none'
                            }"
                            @click="handleCardClick(cards.length - 1 - index)"
                        >
                            <div class="card-content" :style="getCardStyle(card)">
                                <div class="card-header">
                                    <span class="card-icon">{{ card.icon }}</span>
                                    <span class="card-name">{{ card.name }}</span>
                                </div>
                                <div class="chart-area" :style="index === 1 ? { minHeight: '180px' } : {}">
                                    <component
                                        :is="[
                                            PiData, SleepData, PressureData,
                                            OxygenData, BloodData, HeartData
                                        ][index]"
                                        :data="[
                                            piData, sleepData, pressureData,
                                            oxygenData, bloodData, heartData
                                        ][index]"
                                    ></component>
                                </div>
                                <div class="card-footer">
                                    <span class="card-unit">{{ card.unit }}</span>
                                    <button
                                        class="detail-btn"
                                        @click.stop="toggleRouter(card.key)"
                                    >
                                        查看详情
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="scroll-hint">
            滚动鼠标滚轮切换卡片
        </div>
    </div>
</template>

<style scoped>
.data-container {
    width: 100%;
    height: 100%;
    max-height: 100%;
    min-height: 2rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 0.2rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.15rem 0.2rem;
    background: transparent;
    border-radius: 0.2rem 0.2rem 0 0;
    margin-bottom: 0;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.12rem;
}

.title-text {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.14rem;
    font-weight: 600;
    color: #2D572D;
    letter-spacing: 1px;
}

.title-line {
    width: 0.3rem;
    height: 0.02rem;
    background: linear-gradient(90deg, #2D572D, #81C784);
}

.update-time {
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.1rem;
    color: #999;
    letter-spacing: 0.5px;
}

.main-content {
    flex: 1;
    display: flex;
    position: relative;
    overflow: hidden;
    gap: 0.15rem;
    padding: 0 0.15rem 0 0.15rem;
}

.timeline-section {
    width: 120px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 40;
    box-sizing: border-box;
    padding-left: 0.15rem;
}

.timeline {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-evenly;
    align-items: flex-start;
}

.timeline-item {
    display: flex;
    align-items: center;
    gap: 0.15rem;
    padding: 0;
    border-radius: 0.06rem;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    box-sizing: border-box;
}

.timeline-item:hover {
    transform: translateX(4px);
}

.timeline-item.active {
    transform: translateX(8px);
}

.timeline-dot {
    width: 0.08rem;
    height: 0.08rem;
    border-radius: 50%;
    background: #999;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.timeline-item.active .timeline-dot {
    background: var(--card-color);
    width: 0.12rem;
    height: 0.12rem;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
}

.timeline-label {
    font-size: 0.1rem;
    color: #666;
    white-space: nowrap;
    font-weight: 500;
    transition: all 0.3s ease;
}

.timeline-item:hover .timeline-label {
    color: #333;
}

.timeline-item.active .timeline-label {
    color: var(--card-color);
    font-weight: 600;
}

.cards-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    /** border-radius: 0 0 0.2rem 0.2rem; **/
    padding: 0.15rem;
    box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
    overflow: hidden;
    margin: 0;
}

.stack-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.stack-wrapper {
    position: relative;
    width: 90%;
    height: 100%;
}

.stack-card {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    transform-origin: center center;
}

.card-content {
    width: 100%;
    height: 100%;
    background: #ffffff;
    /** border-radius:0 0 0.15rem 0.15rem; **/
    padding: 0.12rem 0.15rem;
    display: flex;
    flex-direction: column;
    position: relative;
    box-sizing: border-box;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    border: 1px solid rgba(0,0,0,0.08);
    transition: all 0.3s ease;
}

.card-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 0.04rem;
    background: var(--card-color);
}

.card-content:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.12rem;
    margin-bottom: 0.1rem;
    flex-shrink: 0;
}

.card-icon {
    font-size: 0.2rem;
    color: var(--card-color);
}

.card-name {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.14rem;
    font-weight: 600;
    color: #333;
}

.chart-area {
    flex: 1;
    min-height: 0;
    margin: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    overflow: hidden;
}

.chart-area > * {
    width: 100%;
    height: 100%;
    min-height: 0.5rem;
}

.card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 0.08rem;
    padding-left: 0.02rem;
    padding-right: 0.02rem;
    border-top: 1px solid rgba(0,0,0,0.08);
    flex-shrink: 0;
    min-width: 0;
}

.card-unit {
    font-size: 0.11rem;
    color: #666;
    font-weight: 500;
}

.detail-btn {
    padding: 0.08rem 0.15rem;
    border: 1px solid var(--card-color);
    background: transparent;
    border-radius: 0.08rem;
    font-size: 0.11rem;
    color: var(--card-color);
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.detail-btn:hover {
    background: var(--card-color);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

.scroll-hint {
    position: absolute;
    bottom: 0.25rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.1rem;
    color: #999;
    opacity: 0.7;
    pointer-events: none;
    background: rgba(255, 255, 255, 0.8);
    padding: 0.08rem 0.16rem;
    border-radius: 0.1rem;
    backdrop-filter: blur(8px);
}

@media (max-width: 768px) {
    .main-content {
        flex-direction: column;
        gap: 0.2rem;
    }

    .timeline-section {
        width: 100%;
        height: 100px;
    }

    .timeline {
        flex-direction: row;
        overflow-x: auto;
        padding: 0.15rem;
    }

    .timeline-item {
        min-width: 80px;
    }

    .stack-wrapper {
        width: 95%;
        height: 85%;
    }
}
</style>
