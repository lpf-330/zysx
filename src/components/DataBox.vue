<script setup>
import HeartData from './HeartData.vue';
import BloodData from './BloodData.vue';
import PiData from './PiData.vue';
import OxygenData from './OxygenData.vue';
import SleepData from './SleepData.vue';
import PressureData from './PressureData.vue';
import { ref, onBeforeMount, onMounted, onBeforeUnmount } from 'vue';
import router from '../router';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';
import { getDataBox } from '../api/healthData';

const heartData = ref([])
const bloodData = ref([])
const piData = ref([])
const oxygenData = ref(0)
const sleepData = ref([])
const pressureData = ref([])

const userInfoStore = storeToRefs(useUserInfoStore())

const fetchData = async () => {
    try {
        heartData.value = []
        bloodData.value = []
        piData.value = []
        sleepData.value = []
        pressureData.value = []
        oxygenData.value = 0

        const user_id = userInfoStore.user_id.value
        console.log('DataBox - user_id:', user_id)
        const response = await getDataBox(user_id)
        console.log('DataBox - response:', JSON.stringify(response, null, 2))

        if (response.heartData && response.heartData.length > 0) {
            for (const item of response.heartData) {
                heartData.value.push(Number(item.heartData))
            }
        }
        if (response.piData && response.piData.length > 0) {
            for (const item of response.piData) {
                piData.value.push(Number(item.piData))
            }
        }
        if (response.sleepData && response.sleepData.length > 0) {
            for (const item of response.sleepData) {
                sleepData.value.push(Number(item.sleepData))
            }
        }
        if (response.bloodData && response.bloodData.length > 0) {
            for (const item of response.bloodData) {
                bloodData.value.push(Number(item.bloodData))
            }
        }
        if (response.bloodOxygenData && response.bloodOxygenData.length > 0) {
            oxygenData.value = Number(response.bloodOxygenData[response.bloodOxygenData.length - 1].oxygenData) * 0.01
        }
        if (response.bloodPressureData && response.bloodPressureData.length > 0) {
            pressureData.value.push(Number(response.bloodPressureData[response.bloodPressureData.length - 1].systolicBp))
            pressureData.value.push(Number(response.bloodPressureData[response.bloodPressureData.length - 1].diastolicBp))
        }
    } catch (error) {
        console.error("出错", error);
    }
}

onBeforeMount(fetchData)

const toggleRouter = (str) => {
    userInfoStore.siderMode.value = 1
    router.push({ name: str })
}

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
    containerRef = el
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
            <!-- 时间轴 -->
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
            
            <!-- 卡片堆叠 -->
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
                                <div class="chart-area" :style="index === 4 ? { minHeight: '180px' } : {}">
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
        
        <!-- 滚动提示 -->
        <div class="scroll-hint">
            滚动鼠标滚轮切换卡片
        </div>
    </div>
</template>

<style scoped>
.data-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.2rem;
    padding: 0 0.1rem;
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
    gap: 0.3rem;
    padding: 0 0.1rem;
}

/* 时间轴部分 */
.timeline-section {
    width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 40;
}

.timeline {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0.15rem 0;
}

.timeline-item {
    display: flex;
    align-items: center;
    gap: 0.15rem;
    padding: 0.08rem 0;
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

/* 卡片堆叠部分 */
.cards-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 0.2rem;
    padding: 0.15rem;
    box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
    overflow: visible;
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
    width: 80%;
    height: 80%;
    transform: translate(-5%, -10%);
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
    border-radius: 0.15rem;
    padding: 0.25rem;
    display: flex;
    flex-direction: column;
    position: relative;
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
    border-radius: 0.15rem 0.15rem 0 0;
}

.card-content:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.12rem;
    margin-bottom: 0.2rem;
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
    margin: 0.1rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chart-area > * {
    width: 100%;
    height: 100%;
}

.card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.2rem;
    padding-top: 0.15rem;
    border-top: 1px solid rgba(0,0,0,0.08);
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

/* 滚动提示 */
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

/* 响应式设计 */
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