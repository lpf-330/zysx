<script setup>
import HeartData from './HeartData.vue';
import BloodData from './BloodData.vue';
import PiData from './PiData.vue';
import OxygenData from './OxygenData.vue';
import SleepData from './SleepData.vue';
import PressureData from './PressureData.vue';
import { ref, onBeforeMount } from 'vue';
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
let user_id = userInfoStore.user_id.value


const fetchData = async () => {
    try {
        const response = await getDataBox(user_id)
        for (let j = 0; j < 4; j++) {
            heartData.value.push(Number(response.heartData[j].heartData))
            piData.value.push(Number(response.piData[j].piData))
            sleepData.value.push(Number(response.sleepData[j].sleepData))
        }
        for (let j = 0; j < 7; j++) {
            bloodData.value.push(Number(response.bloodData[j].bloodData))
        }
        oxygenData.value = Number(response.oxygenData[response.oxygenData.length - 1].oxygenData) * 0.01
        pressureData.value.push(Number(response.pressureData[response.pressureData.length - 1].systolicBP))
        pressureData.value.push(Number(response.pressureData[response.pressureData.length - 1].diastolicBP))
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
</script>

<template>
    <div class="data-container">
        <div class="section-header">
            <div class="section-title">
                <span class="title-text">健康数据概览</span>
                <span class="title-line"></span>
            </div>
            <span class="update-time">实时监测</span>
        </div>
        <div class="cards-grid">
            <div class="card-row">
                <div class="data-card large" :style="getCardStyle(cards[0])" @click="toggleRouter(cards[0].key)">
                    <div class="card-label">
                        <span class="card-icon">{{ cards[0].icon }}</span>
                        <span class="card-name">{{ cards[0].name }}</span>
                    </div>
                    <div class="chart-area">
                        <HeartData :data="heartData"></HeartData>
                    </div>
                </div>
                <div class="data-card large" :style="getCardStyle(cards[1])" @click="toggleRouter(cards[1].key)">
                    <div class="card-label">
                        <span class="card-icon">{{ cards[1].icon }}</span>
                        <span class="card-name">{{ cards[1].name }}</span>
                    </div>
                    <div class="chart-area">
                        <BloodData :data="bloodData"></BloodData>
                    </div>
                </div>
                <div class="data-card large" :style="getCardStyle(cards[2])" @click="toggleRouter(cards[2].key)">
                    <div class="card-label">
                        <span class="card-icon">{{ cards[2].icon }}</span>
                        <span class="card-name">{{ cards[2].name }}</span>
                    </div>
                    <div class="chart-area">
                        <OxygenData :data="oxygenData"></OxygenData>
                    </div>
                </div>
            </div>
            <div class="card-row">
                <div class="data-card small" :style="getCardStyle(cards[3])" @click="toggleRouter(cards[3].key)">
                    <div class="card-label">
                        <span class="card-icon">{{ cards[3].icon }}</span>
                        <span class="card-name">{{ cards[3].name }}</span>
                    </div>
                    <div class="chart-area">
                        <PressureData :data="pressureData"></PressureData>
                    </div>
                </div>
                <div class="data-card small" :style="getCardStyle(cards[4])" @click="toggleRouter(cards[4].key)">
                    <div class="card-label">
                        <span class="card-icon">{{ cards[4].icon }}</span>
                        <span class="card-name">{{ cards[4].name }}</span>
                    </div>
                    <div class="chart-area">
                        <SleepData :data="sleepData"></SleepData>
                    </div>
                </div>
                <div class="data-card small" :style="getCardStyle(cards[5])" @click="toggleRouter(cards[5].key)">
                    <div class="card-label">
                        <span class="card-icon">{{ cards[5].icon }}</span>
                        <span class="card-name">{{ cards[5].name }}</span>
                    </div>
                    <div class="chart-area">
                        <PiData :data="piData"></PiData>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.data-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.12rem;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.1rem;
}

.title-text {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.13rem;
    font-weight: 600;
    color: #2D572D;
    letter-spacing: 1px;
}

.title-line {
    width: 0.25rem;
    height: 0.02rem;
    background: linear-gradient(90deg, #2D572D, #81C784);
}

.update-time {
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.09rem;
    color: #999;
    letter-spacing: 0.5px;
}

.cards-grid {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    flex: 1;
}

.card-row {
    display: flex;
    gap: 0.1rem;
    flex: 1;
}

.card-row:first-child {
    flex: 1.2;
}

.card-row:last-child {
    flex: 0.8;
}

.data-card {
    background: #fff;
    border-radius: 0.1rem;
    padding: 0.1rem;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid rgba(0,0,0,0.04);
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.data-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 0.03rem;
    background: var(--card-color);
}

.data-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.data-card.large {
    flex: 1;
}

.data-card.small {
    flex: 1;
}

.card-label {
    display: flex;
    align-items: center;
    gap: 0.06rem;
    margin-bottom: 0.05rem;
}

.card-icon {
    font-size: 0.14rem;
    color: var(--card-color);
}

.card-name {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.11rem;
    font-weight: 500;
    color: #333;
}

.chart-area {
    flex: 1;
    min-height: 0;
}
</style>