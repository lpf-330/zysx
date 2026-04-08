<script setup>
import TimeBox from '../components/TimeBox.vue'
import { RouterView } from 'vue-router';
import DataBox from '../components/DataBox.vue';
import { ref } from 'vue';
import HistoricalData from '../components/HistoricalData.vue';

const healthTabs = [
    { id: 'heartData', name: '心率', icon: '♥', color: '#E57373', desc: 'Heart Rate' },
    { id: 'bloodData', name: '血糖', icon: '♦', color: '#9575CD', desc: 'Blood Sugar' },
    { id: 'oxygenData', name: '血氧', icon: '◈', color: '#4FC3F7', desc: 'Blood Oxygen' },
    { id: 'pressureData', name: '血压', icon: '●', color: '#F06292', desc: 'Blood Pressure' },
    { id: 'sleepData', name: '睡眠', icon: '▲', color: '#81C784', desc: 'Sleep Quality' },
    { id: 'piData', name: '灌注指数', icon: '◆', color: '#FFB74D', desc: 'Perfusion Index' },
];

const activeTab = ref('heartData');
const showSidebar = ref(false);
const hoveredTab = ref(null);

const switchTab = (tabId) => {
    activeTab.value = tabId;
    showSidebar.value = false;
    window.location.hash = `/index/health/${tabId}`;
};

const toggleSidebar = () => {
    showSidebar.value = !showSidebar.value;
};

const getTabStyle = (tab) => {
    if (hoveredTab.value === tab.id) {
        return {
            '--tab-color': tab.color,
            '--tab-bg': `${tab.color}15`
        };
    }
    return { '--tab-color': tab.color };
};
</script>

<template>
    <div class="main-container">
        <div class="sidebar-overlay" v-if="showSidebar" @click="toggleSidebar"></div>

        <div class="sidebar" :class="{ 'show': showSidebar }">
            <div class="sidebar-header">
                <div class="logo-area">
                    <span class="logo-icon">◇</span>
                    <div class="logo-text">
                        <span class="logo-title">健康监测</span>
                        <span class="logo-subtitle">Health Monitor</span>
                    </div>
                </div>
                <button class="close-btn" @click="toggleSidebar">
                    <span class="close-line"></span>
                    <span class="close-line"></span>
                </button>
            </div>

            <div class="sidebar-nav">
                <div
                    v-for="tab in healthTabs"
                    :key="tab.id"
                    class="nav-item"
                    :class="{ 'active': activeTab === tab.id }"
                    :style="getTabStyle(tab)"
                    @mouseenter="hoveredTab = tab.id"
                    @mouseleave="hoveredTab = null"
                    @click="switchTab(tab.id)"
                >
                    <div class="nav-indicator"></div>
                    <div class="nav-icon-wrap">
                        <span class="nav-icon">{{ tab.icon }}</span>
                    </div>
                    <div class="nav-content">
                        <span class="nav-name">{{ tab.name }}</span>
                        <span class="nav-desc">{{ tab.desc }}</span>
                    </div>
                    <div class="nav-arrow">
                        <span>›</span>
                    </div>
                </div>
            </div>

            <div class="sidebar-footer">
                <div class="footer-decoration">
                    <div class="pulse-ring"></div>
                    <div class="pulse-dot"></div>
                </div>
                <span class="footer-text">实时监测中</span>
            </div>
        </div>

        <div class="mid">
            <TimeBox></TimeBox>
            <div class="health">
                <RouterView></RouterView>
            </div>
        </div>

        <div class="right">
            <HistoricalData></HistoricalData>
        </div>

        <button class="sidebar-toggle" @click="toggleSidebar">
            <div class="toggle-lines">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </button>
    </div>
</template>

<style scoped>
.main-container {
    width: 100%;
    height: 100%;
    display: flex;
    position: relative;
}

.sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2.8rem;
    background: linear-gradient(180deg, #1a3d1a 0%, #0d1f0d 100%);
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    box-shadow: 4px 0 30px rgba(0, 0, 0, 0.3);
}

.sidebar.show {
    transform: translateX(0);
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.25rem 0.2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-area {
    display: flex;
    align-items: center;
    gap: 0.12rem;
}

.logo-icon {
    font-size: 0.28rem;
    color: #81C784;
    text-shadow: 0 0 10px rgba(129, 199, 132, 0.5);
}

.logo-text {
    display: flex;
    flex-direction: column;
}

.logo-title {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.15rem;
    font-weight: 600;
    color: #fff;
    letter-spacing: 2px;
}

.logo-subtitle {
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.08rem;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 1px;
}

.close-btn {
    width: 0.28rem;
    height: 0.28rem;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    border-radius: 0.06rem;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.03rem;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: rgba(255, 107, 107, 0.3);
}

.close-line {
    width: 0.14rem;
    height: 0.02rem;
    background: rgba(255, 255, 255, 0.6);
    transition: all 0.2s ease;
}

.close-btn:hover .close-line {
    background: #fff;
}

.close-btn:hover .close-line:first-child {
    transform: rotate(45deg) translateY(0.025rem);
}

.close-btn:hover .close-line:last-child {
    transform: rotate(-45deg) translateY(-0.025rem);
}

.sidebar-nav {
    flex: 1;
    padding: 0.15rem 0;
    overflow-y: auto;
}

.nav-item {
    display: flex;
    align-items: center;
    padding: 0.14rem 0.2rem;
    margin: 0.05rem 0.12rem;
    cursor: pointer;
    border-radius: 0.1rem;
    position: relative;
    transition: all 0.3s ease;
    overflow: hidden;
}

.nav-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, var(--tab-color) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.nav-item:hover::before,
.nav-item.active::before {
    opacity: 0.15;
}

.nav-item:hover,
.nav-item.active {
    background: rgba(255, 255, 255, 0.03);
}

.nav-indicator {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 0.04rem;
    height: 0;
    background: var(--tab-color);
    border-radius: 0.02rem;
    transition: height 0.3s ease;
}

.nav-item.active .nav-indicator {
    height: 60%;
}

.nav-icon-wrap {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 0.08rem;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.12rem;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
}

.nav-item:hover .nav-icon-wrap,
.nav-item.active .nav-icon-wrap {
    background: var(--tab-color);
    box-shadow: 0 0 15px color-mix(in srgb, var(--tab-color) 50%, transparent);
}

.nav-icon {
    font-size: 0.18rem;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
}

.nav-item:hover .nav-icon,
.nav-item.active .nav-icon {
    color: #fff;
    transform: scale(1.1);
}

.nav-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
}

.nav-name {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.14rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    transition: color 0.3s ease;
}

.nav-item:hover .nav-name,
.nav-item.active .nav-name {
    color: #fff;
}

.nav-desc {
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.09rem;
    color: rgba(255, 255, 255, 0.3);
    margin-top: 0.02rem;
    transition: color 0.3s ease;
}

.nav-item:hover .nav-desc,
.nav-item.active .nav-desc {
    color: rgba(255, 255, 255, 0.5);
}

.nav-arrow {
    font-size: 0.16rem;
    color: rgba(255, 255, 255, 0.2);
    transform: translateX(-0.1rem);
    opacity: 0;
    transition: all 0.3s ease;
}

.nav-item:hover .nav-arrow,
.nav-item.active .nav-arrow {
    opacity: 1;
    transform: translateX(0);
    color: var(--tab-color);
}

.sidebar-footer {
    padding: 0.2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    gap: 0.1rem;
}

.footer-decoration {
    position: relative;
    width: 0.2rem;
    height: 0.2rem;
}

.pulse-ring {
    position: absolute;
    width: 0.2rem;
    height: 0.2rem;
    border: 2px solid #81C784;
    border-radius: 50%;
    animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
    0% {
        transform: scale(0.8);
        opacity: 1;
    }
    100% {
        transform: scale(1.5);
        opacity: 0;
    }
}

.pulse-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0.08rem;
    height: 0.08rem;
    background: #81C784;
    border-radius: 50%;
}

.footer-text {
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.11rem;
    color: rgba(255, 255, 255, 0.5);
}

.mid {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 0.3rem;
    box-sizing: border-box;
}

.health {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.right {
    width: 26%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.sidebar-toggle {
    position: fixed;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 0.4rem;
    height: 0.8rem;
    background: linear-gradient(180deg, #2D572D 0%, #1a3d1a 100%);
    border: none;
    border-radius: 0 0.12rem 0.12rem 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
}

.sidebar-toggle:hover {
    width: 0.45rem;
    background: linear-gradient(180deg, #3d7a3d 0%, #2D572D 100%);
}

.toggle-lines {
    display: flex;
    flex-direction: column;
    gap: 0.04rem;
}

.toggle-lines span {
    width: 0.16rem;
    height: 0.02rem;
    background: #fff;
    border-radius: 0.01rem;
    transition: all 0.3s ease;
}

.sidebar-toggle:hover .toggle-lines span {
    width: 0.2rem;
}
</style>