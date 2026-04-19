<template>
<div class="data-dashboard">
  <svg width="0" height="0" style="position: absolute; z-index: -1;">
    <defs>
      <linearGradient id="heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff0055" />
        <stop offset="100%" stop-color="#ff4b2b" />
      </linearGradient>
      <filter id="neon-glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  </svg>

  <div class="top-controls cyber-top-controls">
    <div class="hud-decorative-lines">
      <span class="line-1"></span>
      <span class="line-2"></span>
      <span class="line-3"></span>
    </div>

    <button class="cyber-toggle-btn" @click="toggleAllCards">
      <div class="btn-corner top-left"></div>
      <div class="btn-corner bottom-right"></div>
      <svg class="cyber-toggle-icon" :class="{ 'rotated': !isAllCollapsed }" viewBox="0 0 24 24">
        <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
      </svg>
      <span class="cyber-btn-text" :data-text="isAllCollapsed ? 'SYSTEM DEPLOY' : 'SYSTEM RETRACT'">
        {{ isAllCollapsed ? '展开全部' : '收起全部' }}
      </span>
    </button>

    <div class="right-controls cyber-right-controls">
      <div class="hud-time-display">
        <span class="hud-time">{{ formatTime(new Date()) }}</span>
        <span class="hud-time-label">本地时间</span>
      </div>

      <div v-if="hasWarnings" class="cyber-alert-wrapper">
        <button class="cyber-alert-btn" @click="openAlertModal">
          <div class="alert-hazard-ring"></div>
          <div class="alert-radar-pulse"></div>
          <svg class="cyber-alert-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
          </svg>
        </button>
        <div class="cyber-alert-badge">
          <span class="badge-bracket">[</span>
          <span class="badge-count">{{ getAlertCount() }}</span>
          <span class="badge-bracket">]</span>
        </div>
      </div>
    </div>
  </div>

  <div class="data-container">
    <div class="data-grid">

      <div class="cyber-card-frame theme-heart" :class="{ 'warning-pulse': heartWarning.level >= 2 }">
        <div class="orbital-glow"></div>
        <div class="card-bracket top-left"></div>
        <div class="card-bracket top-right"></div>
        <div class="card-bracket bottom-left"></div>
        <div class="card-bracket bottom-right"></div>

        <div class="card-inner">
          <div class="bg-grid-overlay"></div>
          <div class="bg-scanline"></div>

          <div class="card-header">
            <div class="header-left">
              <span class="card-icon">❤</span>
              <span class="card-title">心率监控</span>
              <span class="card-id" style="color: #ff0000;">心率</span>
            </div>
            <button class="icon-btn toggle-btn" @click="toggleCard('heart')" :class="{'expanded': expandedCards.heart}">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" /></svg>
            </button>
          </div>

          <div class="heart-hud-container">
            <div class="hud-main">
              <div class="bpm-hud-display">
                <div class="bpm-value-wrapper">
                  <span class="bpm-value cyber-glitch-text" :data-text="heartData[heartData.length - 1] || '--'">
                    {{ heartData[heartData.length - 1] || '--' }}
                  </span>
                  <span class="trend-indicator" v-if="heartTrend && heartData.length > 0">{{ heartTrend }}</span>
                </div>
                <div class="bpm-label-box">
                  <span class="bpm-unit-hud" style="color: #ff0000;">BPM</span>
                </div>
              </div>

              <div class="heart-core-wrapper">
                <div class="ring-orbit ring-1"></div>
                <div class="ring-orbit ring-2"></div>
                <div class="heart-hologram" :style="{ 'animation-duration': (60 / (heartData[heartData.length - 1] || 75)) + 's' }">
                  <svg viewBox="0 0 24 24" class="heart-vector">
                    <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
                  </svg>
                  <div class="heart-core-flare"></div>
                </div>
              </div>
            </div>

            <div class="hud-status-tag" :style="{ '--status-color': heartWarning.color }">
              <span class="status-dot"></span>
              {{ heartWarning.level > 0 ? '异常' : heartData.length > 0 ? '正常' : '无数据' }}
            </div>

            <div class="ecg-hologram-line">
              <svg class="ecg-svg" viewBox="0 0 200 30" preserveAspectRatio="none">
                <polyline class="ecg-trace ecg-glow" points="0,15 20,15 25,10 30,20 35,15 45,15 50,0 55,30 60,15 70,15 75,12 80,15 200,15" />
                <polyline class="ecg-trace ecg-core" :style="{ 'animation-duration': (60 / (heartData[heartData.length - 1] || 75)) + 's' }" points="0,15 20,15 25,10 30,20 35,15 45,15 50,0 55,30 60,15 70,15 75,12 80,15 200,15" />
              </svg>
            </div>
          </div>

          <div class="card-chart-wrapper" :class="{ 'is-open': expandedCards.heart }">
            <div class="card-chart">
              <div class="chart-header">
                <span class="chart-title">24H TIMELINE</span>
                <span class="chart-range">[ 40 - 180 ]</span>
              </div>
              <HeartData :data="heartData" :warning="heartWarning" :key="`heart-${chartKey}`" />
            </div>
          </div>
        </div>
      </div>

      <div class="cyber-card-frame theme-drop" :class="{ 'warning-pulse': bloodWarning.level >= 2 }">
        <div class="orbital-glow"></div>
        <div class="card-bracket top-left"></div>
        <div class="card-bracket top-right"></div>
        <div class="card-bracket bottom-left"></div>
        <div class="card-bracket bottom-right"></div>

        <div class="card-inner">
          <div class="bg-grid-overlay"></div>
          <div class="bg-scanline"></div>

          <div class="card-header">
            <div class="header-left">
              <span class="card-icon">⬡</span>
              <span class="card-title">血糖分析</span>
              <span class="card-id" style="color: #ffc107;">血糖</span>
            </div>
            <button class="icon-btn toggle-btn" @click="toggleCard('blood')" :class="{'expanded': expandedCards.blood}">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" /></svg>
            </button>
          </div>

          <div class="glucose-cyber-container">
            <div class="glucose-main-display">
              <div class="glucose-data-panel">
                <div class="glucose-value-group">
                  <span class="cyber-glitch-text" :data-text="bloodData[bloodData.length - 1] || '--'">
                    {{ bloodData[bloodData.length - 1] || '--' }}
                  </span>
                  <span class="trend-arrow" v-if="bloodTrend && bloodData.length > 0">{{ bloodTrend }}</span>
                </div>
                <div class="glucose-meta">
                  <span class="glucose-unit" style="color: #ffc107;">mmol/L</span>
                </div>
              </div>

              <div class="glucose-hex-core">
                <div class="hex-orbit-ring outer"></div>
                <div class="hex-orbit-ring inner"></div>
                <div class="hex-inner-crystal" :style="{ '--fill-level': bloodData.length > 0 ? Math.min(100, Math.max(0, (bloodData[bloodData.length - 1] / 15) * 100)) + '%' : '0%', '--core-color': bloodWarning.color || '#f7971e' }">
                  <div class="plasma-wave wave1"></div>
                  <div class="plasma-wave wave2"></div>
                </div>
              </div>
            </div>

            <div class="glucose-concentration-bar">
               <div class="hud-status-tag" :style="{ '--status-color': bloodWarning.color || '#f7971e' }">
                 <div class="status-dot"></div>
                 <span>{{ bloodWarning.level > 0 ? '异常' : bloodData.length > 0 ? '正常' : '无数据' }}</span>
               </div>
               <div class="concentration-track">
                  <div class="concentration-cursor" :style="{ left: bloodData.length > 0 ? Math.min(100, Math.max(0, (bloodData[bloodData.length - 1] / 15) * 100)) + '%' : '0%', backgroundColor: bloodWarning.color || '#f7971e', boxShadow: '0 0 12px ' + (bloodWarning.color || '#f7971e') }"></div>
               </div>
               <div class="concentration-labels">
                 <span>3.9 MIN</span>
                 <span>7.8 NORM</span>
                 <span>15.0 MAX</span>
               </div>
            </div>
          </div>

          <div class="card-chart-wrapper" :class="{ 'is-open': expandedCards.blood }">
            <div class="card-chart">
              <div class="chart-header">
                <span class="chart-title">7D TIMELINE</span>
                <span class="chart-range">[ 3.9 - 10.0 ]</span>
              </div>
              <BloodData :data="bloodData" :warning="bloodWarning" :key="`blood-${chartKey}`" />
            </div>
          </div>
        </div>
      </div>

      <div class="cyber-card-frame theme-bp" :class="{ 'warning-pulse': pressureWarning.level >= 2 }">
        <div class="orbital-glow"></div>
        <div class="card-bracket top-left"></div>
        <div class="card-bracket top-right"></div>
        <div class="card-bracket bottom-left"></div>
        <div class="card-bracket bottom-right"></div>

        <div class="card-inner">
          <div class="bg-grid-overlay"></div>
          <div class="bg-scanline"></div>

          <div class="card-header">
            <div class="header-left">
              <span class="card-icon">∿</span>
              <span class="card-title">血压监测</span>
              <span class="card-id" style="color: #9c27b0;">血压</span>
            </div>
            <button class="icon-btn toggle-btn" @click="toggleCard('pressure')" :class="{'expanded': expandedCards.pressure}">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" /></svg>
            </button>
          </div>

          <div class="bp-orbit-container">
            <div class="bp-orbit-block systolic">
              <div class="orbit-spinner"></div>
              <div class="bp-inner-content">
                <span class="bp-label">SYS</span>
                <div class="bp-value cyber-glitch-text" :data-text="pressureData[0] || '--'">
                  {{ pressureData[0] || '--' }}
                </div>
                <span class="bp-range">90-120</span>
              </div>
            </div>

            <div class="bp-connection">
              <div class="pulse-dot left"></div>
              <div class="energy-beam">
                <div class="beam-particle"></div>
              </div>
              <div class="pulse-dot right"></div>
            </div>

            <div class="bp-orbit-block diastolic">
              <div class="orbit-spinner"></div>
              <div class="bp-inner-content">
                <span class="bp-label">DIA</span>
                <div class="bp-value cyber-glitch-text" :data-text="pressureData[1] || '--'">
                  {{ pressureData[1] || '--' }}
                </div>
                <span class="bp-range">60-80</span>
              </div>
            </div>
          </div>

          <div class="hud-status-tag" :style="{ '--status-color': pressureWarning.color || '#00e5ff' }">
            <span class="status-dot"></span>
            {{ pressureWarning.level > 0 && pressureData[0] ? '异常' : pressureData[0] ? '正常' : '无数据' }}
          </div>
          <div style="height: 38px;"></div>

          <div class="card-chart-wrapper" :class="{ 'is-open': expandedCards.pressure }">
            <div class="card-chart">
              <div class="chart-header">
                <span class="chart-title">LATEST READ</span>
                <span class="chart-time">{{ pressureData[0] ? formatTime(new Date()) : '--' }}</span>
              </div>
              <PressureData :data="pressureData" :warning="pressureWarning" :key="`pressure-${chartKey}`" />
            </div>
          </div>
        </div>
      </div>

      <div class="cyber-card-frame theme-oxygen" :class="{ 'warning-pulse': oxygenWarning.level >= 2 }">
        <div class="orbital-glow"></div>
        <div class="card-bracket top-left"></div>
        <div class="card-bracket top-right"></div>
        <div class="card-bracket bottom-left"></div>
        <div class="card-bracket bottom-right"></div>

        <div class="card-inner">
          <div class="bg-grid-overlay"></div>
          <div class="bg-scanline"></div>

          <div class="card-header">
            <div class="header-left">
              <span class="card-icon">O₂</span>
              <span class="card-title">血氧饱和</span>
              <span class="card-id" style="color: #2196f3;">血氧</span>
            </div>
            <button class="icon-btn toggle-btn" @click="toggleCard('oxygen')" :class="{'expanded': expandedCards.oxygen}">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" /></svg>
            </button>
          </div>

          <div class="o2-turbine-container">
            <div class="turbine-main-display">
              <div class="o2-data-panel">
                <div class="o2-value-group">
                  <span class="cyber-glitch-text" :data-text="oxygenData > 0 ? (oxygenData * 100).toFixed(1) : '--'">
                    {{ oxygenData > 0 ? (oxygenData * 100).toFixed(1) : '--' }}
                  </span>
                  <span class="o2-percent">%</span>
                </div>
                <div class="o2-meta">
                  <div class="o2-pulse-wave">
                    <span class="wave-bar" v-for="i in 5" :key="i" :style="{ animationDelay: `${i * 0.15}s` }"></span>
                  </div>
                  <span class="o2-label-text" style="color: #2196f3;">SATURATION</span>
                </div>
              </div>

              <div class="turbine-reactor">
                <div class="turbine-ring-outer"></div>
                <div class="turbine-blades" :style="{ 'animation-duration': oxygenData > 0 ? (2 - oxygenData) + 's' : '3s' }"></div>
                <div class="turbine-core">
                  <div class="turbine-core-glow" :style="{ opacity: oxygenData > 0 ? oxygenData : 0.2 }"></div>
                </div>
              </div>
            </div>

            <div class="o2-injection-bar">
              <div class="injection-track">
                <div class="injection-fill" :style="{ width: oxygenData > 0 ? (oxygenData * 100) + '%' : '0%' }">
                  <div class="injection-glow-head"></div>
                </div>
              </div>
              <div class="hud-status-tag" :style="{ '--status-color': oxygenWarning.color || '#00e5ff', marginTop: '15px' }">
                <span class="status-dot"></span>
                {{ oxygenWarning.level > 0 && oxygenData > 0 ? '异常' : oxygenData > 0 ? '正常' : '无数据' }}
              </div>
            </div>
          </div>

          <div class="card-chart-wrapper" :class="{ 'is-open': expandedCards.oxygen }">
            <div class="card-chart">
              <div class="chart-header">
                <span class="chart-title">O2 TREND</span>
                <span class="chart-range">NORM: ≥95%</span>
              </div>
              <OxygenData :data="oxygenData" :warning="oxygenWarning" :key="`oxygen-${chartKey}`" />
            </div>
          </div>
        </div>
      </div>

      <div class="cyber-card-frame theme-pi" :class="{ 'warning-pulse': piWarning.level >= 2 }">
        <div class="orbital-glow"></div>
        <div class="card-bracket top-left"></div>
        <div class="card-bracket top-right"></div>
        <div class="card-bracket bottom-left"></div>
        <div class="card-bracket bottom-right"></div>

        <div class="card-inner">
          <div class="bg-grid-overlay"></div>
          <div class="bg-scanline"></div>

          <div class="card-header">
            <div class="header-left">
              <span class="card-icon">◎</span>
              <span class="card-title">灌注指数</span>
              <span class="card-id" style="color: #4caf50;">体温</span>
            </div>
            <button class="icon-btn toggle-btn" @click="toggleCard('pi')" :class="{'expanded': expandedCards.pi}">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" /></svg>
            </button>
          </div>

          <div class="pi-radar-container">
            <div class="pi-data-panel">
              <div class="cyber-glitch-text" :data-text="piData[piData.length - 1] || '--'">
                {{ piData[piData.length - 1] || '--' }}
              </div>
              <div class="pi-meta-box">
                <span class="pi-label-text" style="color: #4caf50;">INDEX</span>
              </div>
            </div>

            <div class="radar-box">
              <div class="radar-grid"></div>
              <div class="radar-sweep"></div>
              <div class="radar-ping" :class="{'ping-active': piData.length > 0 && piData[piData.length - 1] > 0.5}"></div>
            </div>
          </div>

          <div class="hud-status-tag" :style="{ '--status-color': piWarning.color || '#11998e', marginTop: '45px' }">
            <div class="status-dot"></div>
            <span>{{ piWarning.level > 0 ? '异常' : piData.length > 0 ? '正常' : '无信号' }}</span>
          </div>

          <div class="card-chart-wrapper" :class="{ 'is-open': expandedCards.pi }">
            <div class="card-chart">
              <div class="chart-header">
                <span class="chart-title">4H TIMELINE</span>
                <span class="chart-range">[ 0.5 - 10 ]</span>
              </div>
              <PiData :data="piData" :warning="piWarning" :key="`pi-${chartKey}`" />
            </div>
          </div>
        </div>
      </div>

      <div class="cyber-card-frame theme-sleep" :class="{ 'warning-pulse': sleepWarning.level >= 2 }">
        <div class="orbital-glow"></div>
        <div class="card-bracket top-left"></div>
        <div class="card-bracket top-right"></div>
        <div class="card-bracket bottom-left"></div>
        <div class="card-bracket bottom-right"></div>

        <div class="card-inner">
          <div class="bg-grid-overlay"></div>
          <div class="bg-scanline"></div>

          <div class="card-header">
            <div class="header-left">
              <span class="card-icon">☾</span>
              <span class="card-title">深度睡眠</span>
              <span class="card-id" style="color: #9c27b0;">睡眠</span>
            </div>
            <button class="icon-btn toggle-btn" @click="toggleCard('sleep')" :class="{'expanded': expandedCards.sleep}">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" /></svg>
            </button>
          </div>

          <div class="sleep-orbit-container">
            <div class="sleep-data-panel">
              <div class="sleep-value-group">
                <span class="cyber-glitch-text" :data-text="formatSleepHours(sleepData[sleepData.length - 1]).replace('h', '') || '--'">
                  {{ formatSleepHours(sleepData[sleepData.length - 1]).replace('h', '') || '--' }}
                </span>
                <span class="sleep-unit-large" style="color: #9c27b0;">HRS</span>
              </div>
              <div class="sleep-meta">
                <span class="sleep-label-text" style="color: #9c27b0;">RECOVERY PHASE</span>
              </div>
            </div>

            <div class="orbit-system-3d">
              <div class="core-glow"></div>

              <div class="planet-core">
                <div class="core-inner-pattern"></div>
              </div>

              <div class="orbit-group x-axis">
                <div class="orbit-bg"></div>
                <div class="orbit-ring ring-x"></div>
              </div>

              <div class="orbit-group y-axis">
                <div class="orbit-bg"></div>
                <div class="orbit-ring ring-y"></div>
              </div>

              <div class="orbit-group z-axis">
                <div class="orbit-bg dashed"></div>
                <div class="orbit-ring ring-z">
                  <div class="satellite-wrapper">
                     <div class="orbit-satellite"></div>
                     <div class="satellite-trail"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="hud-status-tag" :style="{ '--status-color': sleepWarning.color || '#9d4edd', marginTop: '45px' }">
            <span class="status-dot"></span>
            {{ sleepWarning.level > 0 && sleepData.length > 0 ? '异常' : sleepData.length > 0 ? '正常' : '无数据' }}
          </div>

          <div class="card-chart-wrapper" :class="{ 'is-open': expandedCards.sleep }">
            <div class="card-chart">
              <div class="chart-header">
                <span class="chart-title">SLEEP CYCLE</span>
                <span class="chart-range">SUGGEST: 7-9H</span>
              </div>
              <SleepData :data="sleepData" :key="`sleep-${chartKey}`" />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- 警告详情弹窗 -->
  <Transition name="modal">
    <div v-if="showAlertModal" class="alert-modal-overlay" @click.self="closeAlertModal">
      <div class="alert-modal" :class="{ 'alert-modal-long': !isAllCollapsed }">
        <div class="modal-header">
          <div class="modal-header-title">
            <svg class="modal-alert-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
            </svg>
            <h3>健康异常详情</h3>
          </div>
          <button class="close-btn" @click="closeAlertModal">×</button>
        </div>

        <div class="modal-content">
          <AlertDetail :alert="currentAlert" @action="handleAlertAction" />
        </div>
      </div>
    </div>
  </Transition>
</div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { getBloodData, getHeartData, getOxygenData, getPiData, getPreData, getSlpData, disconnectUserConnections } from '../api/healthData';
import {
  subscribeHeartData, subscribeBloodData, subscribeOxygenData,
  subscribePiData, subscribePreData, subscribeSlpData, unsubscribeUserAllRealTimeData
} from '../api/healthData';
import { HeartRateRules, BloodSugarRules, BloodPressureRules, BloodOxygenRules, PerfusionIndexRules, SleepRules } from '../utils/healthAnalyzer';

// 引入子组件
import HeartData from './HeartData.vue';
import BloodData from './BloodData.vue';
import PiData from './PiData.vue';
import OxygenData from './OxygenData.vue';
import SleepData from './SleepData.vue';
import PressureData from './PressureData.vue';
import AlertDetail from './alerts/AlertDetail.vue';

// ========== 状态变量与原逻辑完全保持一致 ==========
const props = defineProps({ selectedParentId: { type: [Number, String], required: true, default: null } });
const emit = defineEmits(['card-toggled']);
const currentUserId = ref(null);
const chartKey = ref(0);

const heartData = ref([]);
const bloodData = ref([]);
const piData = ref([]);
const oxygenData = ref(0);
const sleepData = ref([]);
const pressureData = ref([]);

const heartWarning = ref({ level: 0, message: '', suggestion: '', color: '#00e5ff' });
const bloodWarning = ref({ level: 0, message: '', suggestion: '', color: '#00e5ff' });
const pressureWarning = ref({ level: 0, message: '', suggestion: '', color: '#00e5ff' });
const oxygenWarning = ref({ level: 0, message: '', suggestion: '', color: '#00e5ff' });
const piWarning = ref({ level: 0, message: '', suggestion: '', color: '#00e5ff' });
const sleepWarning = ref({ level: 0, message: '', suggestion: '', color: '#00e5ff' });

const heartTrend = ref('');
const bloodTrend = ref('');

const expandedCards = ref({ heart: false, blood: false, pressure: false, oxygen: false, pi: false, sleep: false });

// 健康警报弹窗状态
const showAlertModal = ref(false);
const currentAlert = ref({});

const buildAlertObject = () => {
  const alerts = [];

  // 收集所有异常数据（每个类型作为一项）
  const anomalies = [];

  if (pressureWarning.value.level > 0 && pressureData.value.length >= 2) {
    const systolic = pressureData.value[0];
    const diastolic = pressureData.value[1];
    anomalies.push({
      type: 'bloodPressure',
      label: '血压',
      value: `${systolic}/${diastolic}`,
      unit: 'mmHg',
      range: '<140/90',
      status: pressureWarning.value.level >= 2 ? 'danger' : 'warning',
      message: pressureWarning.value.message,
      suggestion: '减少高盐高脂饮食，保持清淡饮食；适当进行有氧运动'
    });
    alerts.push({
      type: 'health',
      severity: pressureWarning.value.level >= 2 ? 'critical' : 'warning',
      title: '血压异常',
      content: pressureWarning.value.message,
      timestamp: new Date().toISOString(),
      parentName: '监护人',
      actions: ['查看详情', '联系医生', '记录处理'],
      history: []
    });
  }

  if (heartWarning.value.level > 0 && heartData.value.length > 0) {
    const latest = heartData.value[0];
    anomalies.push({
      type: 'heartRate',
      label: '心率',
      value: latest.value,
      unit: 'BPM',
      range: '60-100',
      status: heartWarning.value.level >= 2 ? 'danger' : 'warning',
      message: heartWarning.value.message,
      suggestion: '保持充足睡眠，避免情绪波动；避免咖啡因和刺激性饮料'
    });
    alerts.push({
      type: 'health',
      severity: heartWarning.value.level >= 2 ? 'critical' : 'warning',
      title: '心率异常',
      content: heartWarning.value.message,
      timestamp: new Date().toISOString(),
      parentName: '监护人',
      actions: ['查看详情', '联系医生', '记录处理'],
      history: []
    });
  }

  if (bloodWarning.value.level > 0 && bloodData.value.length > 0) {
    const latest = bloodData.value[0];
    anomalies.push({
      type: 'bloodSugar',
      label: '血糖',
      value: latest.value,
      unit: 'mmol/L',
      range: '3.9-6.1',
      status: bloodWarning.value.level >= 2 ? 'danger' : 'warning',
      message: bloodWarning.value.message,
      suggestion: '控制饮食，避免高糖食物；定时定量进餐'
    });
    alerts.push({
      type: 'health',
      severity: bloodWarning.value.level >= 2 ? 'critical' : 'warning',
      title: '血糖异常',
      content: bloodWarning.value.message,
      timestamp: new Date().toISOString(),
      parentName: '监护人',
      actions: ['查看详情', '联系医生', '记录处理'],
      history: []
    });
  }

  if (oxygenWarning.value.level > 0 && oxygenData.value > 0) {
    anomalies.push({
      type: 'bloodOxygen',
      label: '血氧',
      value: oxygenData.value,
      unit: '%',
      range: '95-100',
      status: oxygenWarning.value.level >= 2 ? 'danger' : 'warning',
      message: oxygenWarning.value.message,
      suggestion: '保持室内空气流通；适当进行深呼吸练习'
    });
    alerts.push({
      type: 'health',
      severity: oxygenWarning.value.level >= 2 ? 'critical' : 'warning',
      title: '血氧异常',
      content: oxygenWarning.value.message,
      timestamp: new Date().toISOString(),
      parentName: '监护人',
      actions: ['查看详情', '联系医生', '记录处理'],
      history: []
    });
  }

  if (sleepWarning.value.level > 0 && sleepData.value.length > 0) {
    const sleepScore = sleepData.value[0] || 0;
    anomalies.push({
      type: 'sleep',
      label: '睡眠质量',
      value: sleepScore,
      unit: '分',
      range: '>60',
      status: sleepWarning.value.level >= 2 ? 'danger' : 'warning',
      message: sleepWarning.value.message,
      suggestion: '养成规律作息习惯；睡前避免使用电子设备'
    });
    alerts.push({
      type: 'health',
      severity: sleepWarning.value.level >= 2 ? 'critical' : 'warning',
      title: '睡眠异常',
      content: sleepWarning.value.message,
      timestamp: new Date().toISOString(),
      parentName: '监护人',
      actions: ['查看详情', '联系医生', '记录处理'],
      history: []
    });
  }

  // 计算总体异常数量和严重程度
  const criticalCount = anomalies.filter(a => a.status === 'danger').length;
  const warningCount = anomalies.filter(a => a.status === 'warning').length;

  // 确定整体健康状况
  let overallStatus = { text: '正常', level: 'normal' };
  if (criticalCount >= 2) {
    overallStatus = { text: '危险', level: 'danger' };
  } else if (criticalCount >= 1 || warningCount >= 2) {
    overallStatus = { text: '较差', level: 'warning' };
  } else if (warningCount >= 1) {
    overallStatus = { text: '一般', level: 'warning' };
  }

  // 收集所有改进建议
  const improvements = anomalies.map(a => a.suggestion).filter(Boolean);

  const baseAlert = alerts[0] || {
    type: 'health',
    severity: 'info',
    title: '健康数据',
    content: '暂无异常数据',
    timestamp: new Date().toISOString(),
    parentName: '监护人',
    actions: ['关闭'],
    history: []
  };

  // 合并多个异常的标题和内容
  const allTitles = [...new Set(alerts.map(a => a.title))];

  let mergedTitle = baseAlert.title;
  let mergedContent = baseAlert.content;

  if (allTitles.length > 1) {
    mergedTitle = `${allTitles[0]}等${allTitles.length}项异常`;
    // 用标题代替详细描述
    mergedContent = allTitles.join('；');
  } else if (allTitles.length === 1) {
    mergedTitle = allTitles[0];
    mergedContent = allTitles[0];
  }

  // 返回带有完整数据的 alert 对象
  return {
    ...baseAlert,
    title: mergedTitle,
    content: mergedContent,
    anomalyCount: anomalies.length,
    anomalies: anomalies, // 每个异常单独的数据
    currentStatus: {
      overall: overallStatus,
      trend: anomalies.length >= 2 ? '多项数据异常，需密切关注' : '数据异常，需注意监测',
      description: anomalies.length > 0
        ? `共检测到 ${anomalies.length} 项异常指标，其中 ${criticalCount} 项严重，${warningCount} 项轻度异常`
        : '所有健康数据均在正常范围内'
    },
    improvement: improvements.length > 0 ? improvements : ['保持良好的生活习惯', '定期进行健康体检']
  };
  // 原来的逻辑结束
};

const closeAlertModal = () => {
  showAlertModal.value = false;
};

const handleAlertAction = (action) => {
  console.log('Alert action:', action);
  showAlertModal.value = false;
};

// 获取严重程度文本
const getSeverityText = (level) => {
  switch(level) {
    case 1: return '轻度';
    case 2: return '中度';
    case 3: return '严重';
    default: return '正常';
  }
};

// 获取严重异常数量
const getSevereCount = () => {
  let count = 0;
  if (heartWarning.value.level >= 2 && heartData.value.length > 0) count++;
  if (bloodWarning.value.level >= 2 && bloodData.value.length > 0) count++;
  if (pressureWarning.value.level >= 2 && pressureData.value[0]) count++;
  if (oxygenWarning.value.level >= 2 && oxygenData.value > 0) count++;
  if (piWarning.value.level >= 2 && piData.value.length > 0) count++;
  if (sleepWarning.value.level >= 2 && sleepData.value.length > 0) count++;
  return count;
};

// 格式化睡眠时间
const formatSleepTime = (minutes) => {
  if (!minutes) return '--';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}小时${mins}分钟`;
};

const isAllCollapsed = computed(() => Object.values(expandedCards.value).every(state => state === false));
const toggleAllCards = () => {
  const targetState = isAllCollapsed.value;
  Object.keys(expandedCards.value).forEach(key => { expandedCards.value[key] = targetState; });
  emit('card-toggled', targetState);
};
const toggleCard = (cardKey) => {
  expandedCards.value[cardKey] = !expandedCards.value[cardKey];
  if (expandedCards.value[cardKey]) nextTick(() => { chartKey.value++; });
};

const hasWarnings = computed(() => [heartWarning, bloodWarning, pressureWarning, oxygenWarning, piWarning, sleepWarning].some(w => w.value.level >= 2));
const getAlertCount = () => {
  let count = 0;
  if (heartWarning.value.level > 0 && heartData.value.length > 0) count++;
  if (bloodWarning.value.level > 0 && bloodData.value.length > 0) count++;
  if (pressureWarning.value.level > 0 && pressureData.value[0]) count++;
  if (oxygenWarning.value.level > 0 && oxygenData.value > 0) count++;
  if (piWarning.value.level > 0 && piData.value.length > 0) count++;
  if (sleepWarning.value.level > 0 && sleepData.value.length > 0) count++;
  return count;
};

const formatSleepHours = (minutes) => !minutes ? '--' : `${(minutes / 60).toFixed(1)}h`;
const formatTime = (date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

// 数据分析函数 (保留原有逻辑，将默认颜色替换为赛博风色彩)
const analyzeHeartRate = () => {
  if (!heartData.value.length) { heartTrend.value = ''; heartWarning.value = { level: 0, color: '#00e5ff' }; return; }
  heartWarning.value = HeartRateRules.analyzeSingleHeartRate(heartData.value[heartData.value.length - 1]);
  heartTrend.value = heartData.value.length >= 3 ? getTrendIcon(HeartRateRules.analyzeHeartRateTrend(heartData.value).trend) : '';
};
const analyzeBloodSugar = () => {
  if (!bloodData.value.length) { bloodTrend.value = ''; bloodWarning.value = { level: 0, color: '#00e5ff' }; return; }
  bloodWarning.value = BloodSugarRules.analyzeSinglePoint(bloodData.value[bloodData.value.length - 1]);
  bloodTrend.value = bloodData.value.length >= 3 ? getTrendIcon(BloodSugarRules.analyzeTrend(bloodData.value).trend) : '';
};
const analyzeBloodPressure = () => {
  if (pressureData.value.length < 2) { pressureWarning.value = { level: 0, color: '#00e5ff' }; return; }
  pressureWarning.value = BloodPressureRules.analyzeSinglePoint(pressureData.value[0], pressureData.value[1]);
};
const analyzeOxygen = () => {
  if (!oxygenData.value || oxygenData.value <= 0) { oxygenWarning.value = { level: 0, color: '#00e5ff' }; return; }
  oxygenWarning.value = BloodOxygenRules.analyzeSinglePoint(oxygenData.value * 100);
};
const analyzePi = () => {
  if (!piData.value.length) { piWarning.value = { level: 0, color: '#00e5ff' }; return; }
  piWarning.value = PerfusionIndexRules.analyzeSinglePoint(piData.value[piData.value.length - 1]);
};
const analyzeSleep = () => {
  if (!sleepData.value.length) { sleepWarning.value = { level: 0, color: '#00e5ff' }; return; }
  sleepWarning.value = SleepRules.analyzeSinglePoint(sleepData.value[sleepData.value.length - 1] / 60);
};
const getTrendIcon = (trend) => ({'快速上升': '↗','缓慢上升': '↗','快速下降': '↘','缓慢下降': '↘','保持稳定': '→','波动剧烈': '↕'}[trend] || '');

// 数据重置
const resetAllData = () => {
  console.log('重置所有数据');

  // 重置数据
  heartData.value = [];
  bloodData.value = [];
  piData.value = [];
  oxygenData.value = 0;
  sleepData.value = [];
  pressureData.value = [];

  // 重置警告状态
  heartWarning.value = { level: 0, message: '', suggestion: '', color: '#00e5ff' };
  bloodWarning.value = { level: 0, message: '', suggestion: '', color: '#00e5ff' };
  pressureWarning.value = { level: 0, message: '', suggestion: '', color: '#00e5ff' };
  oxygenWarning.value = { level: 0, message: '', suggestion: '', color: '#00e5ff' };
  piWarning.value = { level: 0, message: '', suggestion: '', color: '#00e5ff' };
  sleepWarning.value = { level: 0, message: '', suggestion: '', color: '#00e5ff' };
};

// 实时数据处理
const handleHeartData = (data) => {
  console.log('收到实时心率数据:', data);
  if (Array.isArray(data) && data.length > 0) {
    const heartCount = Math.min(4, data.length);
    const latestHeartUnprocessed = data.slice(0, heartCount);
    const latestHeartProcessed = latestHeartUnprocessed.reverse();
    heartData.value = latestHeartProcessed.map(item => Number(item.heartData));
    analyzeHeartRate();
    chartKey.value++;
  }
};

const handleBloodData = (data) => {
  console.log('收到实时血糖数据:', data);
  if (Array.isArray(data) && data.length > 0) {
    const bloodCount = Math.min(7, data.length);
    const latestBloodUnprocessed = data.slice(0, bloodCount);
    const latestBloodProcessed = latestBloodUnprocessed.reverse();
    bloodData.value = latestBloodProcessed.map(item => Number(item.bloodData));
    analyzeBloodSugar();
    chartKey.value++;
  }
};

const handlePressureData = (data) => {
  console.log('收到实时血压数据:', data);
  if (Array.isArray(data) && data.length > 0) {
    const latestBP = data[0];
    pressureData.value = [
      Number(latestBP.systolicBp),
      Number(latestBP.diastolicBp)
    ];
    analyzeBloodPressure();
  }
};

const handleOxygenData = (data) => {
  console.log('收到实时血氧数据:', data);
  if (Array.isArray(data) && data.length > 0) {
    const latestOxygen = data[0];
    oxygenData.value = Number(latestOxygen.oxygenData) * 0.01;
    analyzeOxygen();
    chartKey.value++;
  }
};

const handlePiData = (data) => {
  console.log('收到实时PI数据:', data);
  if (Array.isArray(data) && data.length > 0) {
    const piCount = Math.min(4, data.length);
    const latestPiUnprocessed = data.slice(0, piCount);
    const latestPiProcessed = latestPiUnprocessed.reverse();
    piData.value = latestPiProcessed.map(item => Number(item.piData));
    analyzePi();
    chartKey.value++;
  }
};

const handleSleepData = (data) => {
  console.log('收到实时睡眠数据:', data);
  if (Array.isArray(data) && data.length > 0) {
    const sleepCount = Math.min(4, data.length);
    const latestSleepUnprocessed = data.slice(0, sleepCount);
    const latestSleepProcessed = latestSleepUnprocessed.reverse();
    sleepData.value = latestSleepProcessed.map(item => Number(item.sleepData));
    analyzeSleep();
    chartKey.value++;
  }
};

// 数据订阅与初始化
const initDataSubscriptions = () => {
  if (!props.selectedParentId) return;

  subscribeHeartData(props.selectedParentId, handleHeartData);
  subscribeBloodData(props.selectedParentId, handleBloodData);
  subscribeOxygenData(props.selectedParentId, handleOxygenData);
  subscribePiData(props.selectedParentId, handlePiData);
  subscribePreData(props.selectedParentId, handlePressureData);
  subscribeSlpData(props.selectedParentId, handleSleepData);
};

// 获取历史数据
const fetchHistoricalData = async () => {
  console.log('开始获取历史数据...');
  console.log('当前选择的用户ID:', props.selectedParentId);

  if (!props.selectedParentId) return;

  // 先重置数据
  resetAllData();

  try {
    const [
      heartResponse,
      piResponse,
      sleepResponse,
      bloodResponse,
      pressureResponse,
      oxygenResponse
    ] = await Promise.allSettled([
      getHeartData(props.selectedParentId),
      getPiData(props.selectedParentId),
      getSlpData(props.selectedParentId),
      getBloodData(props.selectedParentId),
      getPreData(props.selectedParentId),
      getOxygenData(props.selectedParentId)
    ]);

    console.log('数据获取结果:', {
      heart: heartResponse.status,
      pi: piResponse.status,
      sleep: sleepResponse.status,
      blood: bloodResponse.status,
      pressure: pressureResponse.status,
      oxygen: oxygenResponse.status
    });

    // 处理心率数据
    if (heartResponse.status === 'fulfilled') {
      const response = heartResponse.value;
      if (Array.isArray(response) && response.length > 0) {
        const heartCount = Math.min(4, response.length);
        const latestHeartUnprocessed = response.slice(0, heartCount);
        const latestHeartProcessed = latestHeartUnprocessed.reverse();
        heartData.value = latestHeartProcessed.map(item => Number(item.heartData));
      } else {
        heartData.value = [];
      }
      analyzeHeartRate();
    } else {
      heartData.value = [];
      analyzeHeartRate();
    }

    // 处理血糖数据
    if (bloodResponse.status === 'fulfilled') {
      const response = bloodResponse.value;
      if (Array.isArray(response) && response.length > 0) {
        const bloodCount = Math.min(7, response.length);
        const latestBloodUnprocessed = response.slice(0, bloodCount);
        const latestBloodProcessed = latestBloodUnprocessed.reverse();
        bloodData.value = latestBloodProcessed.map(item => Number(item.bloodData));
      } else {
        bloodData.value = [];
      }
      analyzeBloodSugar();
    } else {
      bloodData.value = [];
      analyzeBloodSugar();
    }

    // 处理血压数据
    if (pressureResponse.status === 'fulfilled') {
      const response = pressureResponse.value;
      if (response && response.length > 0) {
        const latestBP = response[0];
        pressureData.value = [
          Number(latestBP.systolicBp),
          Number(latestBP.diastolicBp)
        ];
      } else {
        pressureData.value = [];
      }
      analyzeBloodPressure();
    } else {
      pressureData.value = [];
      analyzeBloodPressure();
    }

    // 处理血氧数据
    if (oxygenResponse.status === 'fulfilled') {
      const response = oxygenResponse.value;
      if (response && response.length > 0) {
        const latestOxygen = response[0];
        oxygenData.value = Number(latestOxygen.oxygenData) * 0.01;
      } else {
        oxygenData.value = 0;
      }
      analyzeOxygen();
    } else {
      oxygenData.value = 0;
      analyzeOxygen();
    }

    // 处理PI数据
    if (piResponse.status === 'fulfilled') {
      const response = piResponse.value;
      if (Array.isArray(response) && response.length > 0) {
        const piCount = Math.min(4, response.length);
        const latestPiUnprocessed = response.slice(0, piCount);
        const latestPiProcessed = latestPiUnprocessed.reverse();
        piData.value = latestPiProcessed.map(item => Number(item.piData));
      } else {
        piData.value = [];
      }
      analyzePi();
    } else {
      piData.value = [];
      analyzePi();
    }

    // 处理睡眠数据
    if (sleepResponse.status === 'fulfilled') {
      const response = sleepResponse.value;
      if (Array.isArray(response) && response.length > 0) {
        const sleepCount = Math.min(4, response.length);
        const latestSleepUnprocessed = response.slice(0, sleepCount);
        const latestSleepProcessed = latestSleepUnprocessed.reverse();
        sleepData.value = latestSleepProcessed.map(item => Number(item.sleepData));
      } else {
        sleepData.value = [];
      }
      analyzeSleep();
    } else {
      sleepData.value = [];
      analyzeSleep();
    }

    // 初始化实时订阅
    initDataSubscriptions();
    chartKey.value++;
  } catch (error) {
    console.error('获取历史数据失败:', error);
  }
};

// 监听选中用户变化
watch(() => props.selectedParentId, (newId) => {
  console.log('选中用户变化:', newId);
  if (newId) {
    currentUserId.value = newId;
    fetchHistoricalData();
  }
});

const openAlertModal = () => {
  currentAlert.value = buildAlertObject();
  showAlertModal.value = true;
};

// 组件挂载时获取数据
onMounted(() => {
  console.log('DataDashboard 组件挂载');
  if (props.selectedParentId) {
    fetchHistoricalData();
  }
});

// 组件卸载时断开连接
onUnmounted(() => {
  console.log('DataDashboard 组件卸载');
  if (props.selectedParentId) {
    unsubscribeUserAllRealTimeData(props.selectedParentId);
    disconnectUserConnections(props.selectedParentId);
  }
});
</script>

<style scoped>
/* =========================================================================
   极致赛博/战术指挥舱 UI (Dark Cyber-Tactical HUD)
   设计理念: 暗色特种玻璃、高斯模糊、全息发光轨道、硬切角边框
========================================================================= */
@import url('https://gs.jurieo.com/gemini/fonts-googleapis/css2?family=Rajdhani:wght@500;700;900&family=Share+Tech+Mono&display=swap');

.data-dashboard {
  width: 100%;
  padding: 0;
  position: relative;
  /* 基础字体设定为机甲风/终端风 */
  font-family: 'Rajdhani', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* ================= 顶部控制台 (Top Command Center) ================= */
.cyber-top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  margin-bottom: 20px;
  background: transparent;
  border: none;
  position: relative;
}

.hud-decorative-lines {
  position: absolute;
  top: 0; left: 0; right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}
.hud-decorative-lines span {
  height: 2px; background: #00e5ff;
}
.line-1 { width: 100px; box-shadow: 0 0 10px #00e5ff; }
.line-2 { width: 40px; opacity: 0.5; }
.line-3 { width: 150px; background: #ff0055; box-shadow: 0 0 10px #ff0055; }

/* 展开收起按钮 - 战术按键 */
.cyber-toggle-btn {
  position: relative;
  background: transparent;
  border: 1px solid rgba(0, 229, 255, 0.5);
  color: #00e5ff;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}
.cyber-toggle-btn:hover {
  background: rgba(0, 229, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.3) inset;
}
.btn-corner {
  position: absolute; width: 6px; height: 6px; border: 2px solid #00e5ff;
}
.btn-corner.top-left { top: 0; left: 0; border-right: none; border-bottom: none; }
.btn-corner.bottom-right { bottom: 0; right: 0; border-left: none; border-top: none; }

.cyber-toggle-icon { width: 18px; height: 18px; transition: transform 0.4s; }
.cyber-toggle-icon.rotated { transform: rotate(180deg); }
.cyber-btn-text { font-size: 15px; font-weight: 700; letter-spacing: 2px; }

/* 右侧控制区 */
.cyber-right-controls { display: flex; align-items: center; gap: 30px; }
.hud-time-display { display: flex; flex-direction: column; align-items: flex-end; }
.hud-time { font-family: 'Share Tech Mono', monospace; font-size: 24px; color: #333; text-shadow: 0 0 5px rgba(0,0,0,0.1); line-height: 1;}
.hud-time-label { font-size: 10px; color: #00e5ff; letter-spacing: 2px; }

/* 警告按钮 */
.cyber-alert-wrapper { display: flex; align-items: center; gap: 15px; }
.cyber-alert-btn {
  position: relative;
  width: 44px; height: 44px;
  background: rgba(255, 0, 85, 0.1);
  border: 1px solid #ff0055;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.alert-hazard-ring { position: absolute; inset: -4px; border: 1px dashed #ff0055; border-radius: 50%; animation: spin 16s linear infinite; }
.cyber-alert-icon { width: 20px; height: 20px; color: #ff0055; filter: drop-shadow(0 0 5px #ff0055); animation: pulse 2s infinite alternate;}
.cyber-alert-badge { display: flex; align-items: center; font-family: 'Share Tech Mono', monospace; }
.badge-bracket { color: #ff0055; font-size: 22px; }
.badge-count { color: #fff; font-size: 20px; text-shadow: 0 0 10px #ff0055; margin: 0 4px; }

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes pulse { 100% { opacity: 0.5; transform: scale(0.9); } }

/* ================= 核心数据网格 ================= */
.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  align-items: start;
}

/* ================= 卡片主框架: 黑曜石装甲 (Obsidian Frame) ================= */
.cyber-card-frame {
  position: relative;
  background: rgba(255, 255, 255, 0.95); /* 白色背景 */
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 12px;
  padding: 2px; /* 给光轨留出空间 */
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  z-index: 1;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.cyber-card-frame:hover {
  transform: translateY(-5px);
  z-index: 10;
}

/* --- 🌟 动态轨道流光扫描边框 (Orbital Glow Border) --- */
.orbital-glow {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  overflow: hidden;
  z-index: -1;
}
.orbital-glow::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: conic-gradient(from 0deg, transparent 70%, var(--theme-color) 100%);
  animation: orbital-spin 8s linear infinite;
}
.orbital-glow::after {
  content: '';
  position: absolute;
  inset: 2px;
  background: rgba(255, 255, 255, 0.98); /* 白色遮盖中间，只留边缘流光 */
  border-radius: 10px;
}
@keyframes orbital-spin { 100% { transform: rotate(360deg); } }

/* --- 战术四角固定栓 (HUD Brackets) --- */
.card-bracket {
  position: absolute;
  width: 15px; height: 15px;
  border: 2px solid var(--theme-color);
  opacity: 0.8;
  z-index: 5;
  transition: all 0.3s;
}
.cyber-card-frame:hover .card-bracket { width: 25px; height: 25px; box-shadow: 0 0 10px var(--theme-color); }
.top-left { top: -1px; left: -1px; border-right: none; border-bottom: none; border-top-left-radius: 12px;}
.top-right { top: -1px; right: -1px; border-left: none; border-bottom: none; border-top-right-radius: 12px;}
.bottom-left { bottom: -1px; left: -1px; border-right: none; border-top: none; border-bottom-left-radius: 12px;}
.bottom-right { bottom: -1px; right: -1px; border-left: none; border-top: none; border-bottom-right-radius: 12px;}

/* --- 卡片内部容器 --- */
.card-inner {
  position: relative;
  border-radius: 10px;
  padding: 16px;
  background: transparent;
  z-index: 2;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 暗黑内部网格底纹 */
.bg-grid-overlay {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 10px 10px;
  z-index: -1;
}
/* 垂直扫描线 */
.bg-scanline {
  position: absolute; top: 0; left: 0; width: 100%; height: 5px;
  background: linear-gradient(to bottom, transparent, var(--theme-color), transparent);
  opacity: 0.1;
  animation: scanline 12s linear infinite;
  z-index: -1;
}
@keyframes scanline { 0% { top: -10%; } 100% { top: 110%; } }

/* ================= 颜色主题变量映射 ================= */
.theme-heart { --theme-color: #ff0055; --theme-gradient: linear-gradient(135deg, #ff0055, #ff4b2b); }
.theme-drop { --theme-color: #ffaa00; --theme-gradient: linear-gradient(135deg, #ffaa00, #ffea00); min-height: 162px; }
.theme-bp { --theme-color: #aa00ff; --theme-gradient: linear-gradient(135deg, #aa00ff, #00d2ff); }
.theme-oxygen { --theme-color: #00e5ff; --theme-gradient: linear-gradient(135deg, #00e5ff, #0072ff); }
.theme-pi { --theme-color: #00ff88; --theme-gradient: linear-gradient(135deg, #00ff88, #00b359); }
.theme-sleep { --theme-color: #7b2cbf; --theme-gradient: linear-gradient(135deg, #9d4edd, #e0aaff); }

/* ================= 内部文本与头部样式 ================= */
.card-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding-bottom: 10px;
}
.header-left { display: flex; align-items: center; gap: 10px; }
.card-icon { font-size: 18px; color: var(--theme-color); text-shadow: 0 0 10px var(--theme-color); }
.card-title { font-size: 18px; font-weight: 900; color: #333; letter-spacing: 1px; }
.card-id { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.3); padding: 2px 6px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;}

.icon-btn.toggle-btn {
  background: transparent; border: none; color: var(--theme-color); cursor: pointer;
  width: 30px; height: 30px; border-radius: 4px; transition: all 0.3s;
}
.icon-btn.toggle-btn:hover { background: rgba(255,255,255,0.1); color: var(--theme-color); }
.icon-btn.toggle-btn.expanded svg { transform: rotate(180deg); }

/* 赛博字体 Glitch 发光效果 */
.cyber-glitch-text {
  font-family: 'Share Tech Mono', monospace;
  font-size: 56px; font-weight: 900;
  background: var(--theme-gradient);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  line-height: 1; text-shadow: 0 0 20px rgba(var(--theme-color), 0.5);
  position: relative;
}
.cyber-glitch-text::after {
  content: attr(data-text); position: absolute; left: 2px; top: 0;
  color: var(--theme-color); z-index: -1; opacity: 0.5; filter: blur(3px);
  animation: glitch-anim 6s infinite alternate-reverse;
}
@keyframes glitch-anim { 0% { transform: translate(0); } 20% { transform: translate(-2px, 1px); } 40% { transform: translate(2px, -1px); } 60% { transform: translate(0); } }

/* 状态指示徽章 */
.hud-status-tag {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 4px;
  background: color-mix(in srgb, var(--status-color) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--status-color) 30%, transparent);
  color: var(--status-color); font-size: 12px; font-weight: 800;
  text-shadow: 0 0 5px var(--status-color);
  margin-top: 25px;
}
.status-dot { width: 6px; height: 6px; background: var(--status-color); border-radius: 50%; box-shadow: 0 0 8px var(--status-color); animation: blink 2s infinite alternate; }

/* 图表区动态折叠容器 */
.card-chart-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.card-chart-wrapper.is-open { grid-template-rows: 1fr; }
.card-chart {
  overflow: hidden;
  margin-top: 15px;
  background: #ffffff;
  border: 1px solid rgba(167, 243, 208, 0.5);
  border-radius: 12px;
  padding: 15px;
}
.chart-header { display: flex; justify-content: space-between; border-bottom: 1px dashed #e5e0d8; padding-bottom: 8px; margin-bottom: 10px; font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #5c5c5c;}
.chart-range, .chart-time { color: var(--theme-color); }

/* ================== 各卡片专属炫酷引擎特效 ================== */

/* 1. 心率舱 - 全息脉动核心 */
.heart-hud-container { width: 100%; position: relative; display: flex; flex-direction: column; }
.hud-main { display: flex; justify-content: space-between; align-items: flex-start; }
.bpm-label-box { display: flex; gap: 10px; align-items: center; margin-top: 5px; }
.bpm-unit-hud { color: rgba(255,255,255,0.4); font-weight: bold; }
.heart-core-wrapper { position: relative; width: 80px; height: 80px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
.ring-orbit { position: absolute; border-radius: 50%; border: 1px dashed var(--theme-color); }
.ring-1 { width: 100%; height: 100%; animation: spin 8s linear infinite; opacity: 0.5; }
.ring-2 { width: 70%; height: 70%; animation: spin 6s linear infinite reverse; opacity: 0.8; border-style: solid; border-width: 2px 0; }
.heart-hologram { position: relative; z-index: 2; animation: pump 2s ease-in-out infinite; }
.heart-vector { width: 45px; height: 45px; fill: url(#heart-grad); filter: drop-shadow(0 0 10px #ff0055); }
.ecg-hologram-line { width: 100%; height: 35px; background: #fffbf5; border-radius: 4px; overflow: hidden; position: relative; border: 1px solid #e5e0d8;}
.ecg-svg { width: 100%; height: 100%; }
.ecg-trace { fill: none; stroke-width: 2px; }
.ecg-glow { stroke: #ff0055; opacity: 0.2; filter: blur(2px); }
.ecg-core { stroke: #ff0055; stroke-dasharray: 200; stroke-dashoffset: 200; animation: ecg-scan 2s linear infinite; }
@keyframes pump { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.15); } 30% { transform: scale(1); } }
@keyframes ecg-scan { to { stroke-dashoffset: -200; } }

/* 2. 血糖舱 - 六芒星反应堆 */
.glucose-cyber-container { width: 100%; }
.glucose-main-display { display: flex; justify-content: space-between; align-items: flex-start; }
.glucose-meta { display: flex; align-items: center; gap: 10px; margin-top: 5px;}
.glucose-unit { color: rgba(255,255,255,0.4); font-weight: bold;}
.glucose-hex-core { position: relative; width: 80px; height: 80px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;}
.hex-orbit-ring { position: absolute; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); border: 1px solid var(--theme-color); }
.hex-orbit-ring.outer { inset: -2px; animation: spin 10s linear infinite; opacity: 0.5; }
.hex-orbit-ring.inner { inset: 5px; animation: spin 8s linear infinite reverse; border-style: dashed; }
.hex-inner-crystal { position: absolute; inset: 10px; background: #fffbf5; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); overflow: hidden; box-shadow: inset 0 0 10px var(--theme-color); }
.plasma-wave { position: absolute; width: 200%; height: 200%; left: -50%; background: var(--core-color); opacity: 0.5; border-radius: 40%; top: calc(100% - var(--fill-level)); animation: spin 6s linear infinite; transition: top 1s;}
.plasma-wave.wave2 { animation-direction: reverse; opacity: 0.8; top: calc(100% - var(--fill-level) + 5%); }
.glucose-concentration-bar { margin-top: -3px; display: flex; flex-direction: column; gap: 8px; }
.concentration-track { height: 4px; background: linear-gradient(90deg, #00ff88, #ffaa00, #ff0055); border-radius: 2px; position: relative;}
.concentration-cursor { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px; background: #fff; border-radius: 50%; box-shadow: 0 0 10px #fff; transition: left 1s; }
.concentration-labels { display: flex; justify-content: space-between; font-size: 10px; color: #5c5c5c; font-family: 'Share Tech Mono'; margin-bottom: 10px;}

/* 3. 血压舱 - 能量桥接双轨 */
.bp-orbit-container { display: flex; align-items: flex-start; justify-content: space-between; }
.bp-orbit-block { position: relative; flex: 1; width: 80px; height: 80px; background: #fffbf5; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid #e5e0d8; flex-shrink: 0; }
.orbit-spinner { position: absolute; inset: -2px; border-radius: 50%; background: conic-gradient(transparent, var(--theme-color)); -webkit-mask: radial-gradient(transparent 65%, #fff 66%); animation: spin 4s linear infinite; }
.bp-orbit-block.diastolic .orbit-spinner { background: conic-gradient(transparent, #00d2ff); animation-direction: reverse; }
.bp-inner-content { position: relative; z-index: 2; text-align: center; }
.bp-label { font-size: 12px; color: #666; letter-spacing: 2px;}
.bp-value { font-size: 28px; line-height: 1; margin: 4px 0;}
.bp-range { font-size: 10px; background: #fffbf5; padding: 2px 6px; border-radius: 4px; color: #5c5c5c; border: 1px solid #e5e0d8;}
.bp-connection { flex: 1; height: 40px; display: flex; align-items: center; position: relative; }
.pulse-dot { width: 6px; height: 6px; background: #fff; border-radius: 50%; box-shadow: 0 0 10px #fff; }
.energy-beam { flex: 1; height: 2px; background: rgba(170,0,255,0.3); position: relative; overflow: hidden; margin: 0 5px;}
.beam-particle { position: absolute; top: 0; left: 0; width: 30px; height: 100%; background: #00d2ff; box-shadow: 0 0 10px #00d2ff; animation: shoot 1s linear infinite; }
@keyframes shoot { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }

/* 4. 血氧舱 - 航空涡轮引擎 */
.turbine-main-display { display: flex; justify-content: space-between; align-items: flex-start; }
.o2-value-group { display: flex; align-items: baseline; gap: 5px; }
.o2-percent { color: var(--theme-color); font-size: 24px; font-weight: bold; text-shadow: 0 0 10px var(--theme-color); }
.o2-meta { display: flex; align-items: center; gap: 10px; margin-top: 5px; }
.o2-pulse-wave { display: flex; gap: 3px; align-items: flex-end; height: 15px;}
.wave-bar { width: 3px; background: var(--theme-color); border-radius: 2px; animation: wave 2s infinite alternate; }
.o2-label-text { color: rgba(255,255,255,0.4); font-size: 12px; letter-spacing: 1px; }
.turbine-reactor { position: relative; width: 80px; height: 80px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
.turbine-ring-outer { position: absolute; inset: 0; border: 2px dashed rgba(0,229,255,0.5); border-radius: 50%; animation: spin 6s linear infinite reverse;}
.turbine-blades { position: absolute; inset: 5px; border-radius: 50%; background: repeating-conic-gradient(from 0deg, transparent 0 20deg, rgba(0,229,255,0.8) 20deg 40deg); -webkit-mask: radial-gradient(transparent 40%, #fff 41%); animation: spin 4s linear infinite;}
.turbine-core { width: 20px; height: 20px; background: #fff; border-radius: 50%; box-shadow: 0 0 15px #00e5ff; display: flex; justify-content: center; align-items: center;}
.turbine-core-glow { width: 10px; height: 10px; background: #0072ff; border-radius: 50%; animation: blink 1s infinite; }
.o2-injection-bar { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
.injection-track { height: 6px; background: rgba(0,0,0,0.08); border: 1px solid rgba(0,229,255,0.3); border-radius: 3px; overflow: hidden; }
.injection-fill { height: 100%; background: linear-gradient(90deg, #0072ff, #00e5ff); position: relative; transition: width 1s; }
.injection-glow-head { position: absolute; right: 0; top: -2px; width: 10px; height: 10px; background: #fff; border-radius: 50%; box-shadow: 0 0 10px #fff, 0 0 20px #00e5ff; filter: blur(2px); }
@keyframes wave { 0% { height: 4px; } 100% { height: 100%; box-shadow: 0 0 8px var(--theme-color);} }

/* 5. PI舱 - 生物雷达 */
.pi-radar-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.radar-box { position: relative; width: 80px; height: 80px; border-radius: 50%; background: rgba(0,255,136,0.05); border: 1px solid rgba(0,255,136,0.3); overflow: hidden; box-shadow: inset 0 0 20px rgba(0,255,136,0.1); flex-shrink: 0; }
.radar-grid { position: absolute; inset: 0; background: linear-gradient(90deg, transparent 49%, rgba(0,255,136,0.3) 50%, transparent 51%), linear-gradient(0deg, transparent 49%, rgba(0,255,136,0.3) 50%, transparent 51%); border-radius: 50%; }
.radar-grid::after { content: ''; position: absolute; inset: 15px; border: 1px solid rgba(0,255,136,0.2); border-radius: 50%; }
.radar-sweep { position: absolute; inset: 0; background: conic-gradient(from 0deg, transparent 70%, rgba(0,255,136,0.6) 100%); border-radius: 50%; animation: spin 4s linear infinite; }
.radar-ping { position: absolute; top: 30%; left: 60%; width: 6px; height: 6px; background: #fff; border-radius: 50%; box-shadow: 0 0 10px #fff, 0 0 20px #00ff88; opacity: 0; }
.ping-active { animation: radar-ping-anim 2s linear infinite 0.5s; }
.pi-data-panel { flex: 1; }
.pi-meta-box { display: flex; align-items: center; gap: 10px; margin-top: 10px;}
.pi-label-text { color: rgba(255,255,255,0.4); font-size: 12px; letter-spacing: 1px;}
@keyframes radar-ping-anim { 0%, 10% { opacity: 1; transform: scale(1.5); } 20%, 100% { opacity: 0; transform: scale(1); } }

/* 6. 睡眠舱 - 星轨梦境 */
.sleep-orbit-container { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
.sleep-value-group { display: flex; align-items: baseline; gap: 5px; }
.sleep-unit-large { color: var(--theme-color); font-weight: bold; font-size: 20px;}
.sleep-meta { margin-top: 10px; color: rgba(255,255,255,0.4); font-size: 12px; letter-spacing: 1px;}

/* 睡眠3D轨道系统 - 0.8倍缩小版 */
.orbit-system-3d {
  position: relative;
  width: 96px;
  height: 77px;
  perspective: 1200px;
  transform-style: preserve-3d;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.orbit-system-3d .core-glow {
  position: absolute;
  width: 48px;
  height: 48px;
  background: radial-gradient(circle, rgba(156, 39, 176, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(8px);
  animation: pulse-glow 3s ease-in-out infinite alternate;
}

.orbit-system-3d .planet-core {
  position: relative;
  width: 26px;
  height: 26px;
  background: radial-gradient(circle at 30% 30%, #fff, #9c27b0);
  border-radius: 50%;
  box-shadow:
    0 0 24px rgba(156, 39, 176, 0.4),
    inset -3px -3px 10px rgba(0,0,0,0.5);
  z-index: 10;
  animation: float-core 5s ease-in-out infinite alternate;
  transform-style: preserve-3d;
}

.orbit-system-3d .orbit-group {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  pointer-events: none;
}

.orbit-system-3d .orbit-bg {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(157, 78, 221, 0.1);
  border-radius: 50%;
}

.orbit-system-3d .orbit-bg.dashed { border-style: dashed; }

.orbit-system-3d .orbit-ring {
  position: absolute;
  inset: -1px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #9c27b0;
  -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 80%);
  mask-image: linear-gradient(to bottom, black 40%, transparent 80%);
  filter: drop-shadow(0 0 5px #9c27b0);
}

.orbit-system-3d .x-axis { transform: rotateX(75deg) rotateY(15deg); }
.orbit-system-3d .y-axis { transform: rotateX(15deg) rotateY(75deg); }
.orbit-system-3d .z-axis { transform: rotateZ(45deg) rotateX(65deg); }

.orbit-system-3d .ring-x { animation: spin-z 7s linear infinite; }
.orbit-system-3d .ring-y { animation: spin-z 10s linear infinite reverse; }
.orbit-system-3d .ring-z {
  animation: spin-z 14s linear infinite;
  border-top-style: dashed;
}

.orbit-system-3d .satellite-wrapper {
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translateX(-50%);
  transform-style: preserve-3d;
}

.orbit-system-3d .orbit-satellite {
  position: absolute;
  top: -4px;
  left: 50%;
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 12px #fff, 0 0 24px #9c27b0;
  transform: translateZ(2px);
}

.orbit-system-3d .satellite-trail {
  position: absolute;
  top: -3px;
  left: 50%;
  width: 32px;
  height: 3px;
  background: linear-gradient(to left, #9c27b0, transparent);
  transform: translateX(-100%);
  border-radius: 2px;
  opacity: 0.6;
}

@keyframes pulse-glow {
  0% { transform: scale(0.8); opacity: 0.4; }
  100% { transform: scale(1.2); opacity: 0.8; }
}

@keyframes float-core {
  0% { transform: translateZ(8px) translateY(0); }
  100% { transform: translateZ(8px) translateY(-8px); }
}

@keyframes spin-z {
  from { transform: rotateZ(0deg); }
  to { transform: rotateZ(360deg); }
}

/* ================= 警告呼吸特效 ================= */
.warning-pulse .orbital-glow::before { background: conic-gradient(from 0deg, transparent 50%, #ff0055 100%); animation: orbital-spin 2s linear infinite;}
.warning-pulse .card-bracket { border-color: #ff0055; box-shadow: 0 0 10px #ff0055; }
.warning-pulse .bg-scanline { background: linear-gradient(to bottom, transparent, #ff0055, transparent); opacity: 0.2; animation-duration: 2s;}

/* ================= 健康警报弹窗样式 ================= */

/* --- 1. 深度沉浸式全息投影场 --- */
.alert-modal-overlay {
  position: fixed; inset: 0;
  background: transparent;
  z-index: 9999;
}

.alert-modal-overlay::before {
  content: ''; position: absolute; inset: 0;
  pointer-events: none;
}

/* --- 2. 主装甲中枢 --- */
.alert-modal {
  display: flex; flex-direction: column;
  width: 100%; min-height: 300px;
  max-width: 100%; max-height: 83vh;
  position: relative;
  background: #ffffff;
  border: none;
  z-index: 10000;
}

.alert-modal.alert-modal-long {
  max-height: calc(83vh *1.6);
}

.alert-modal::before {
  display: none;
}

.alert-modal::after {
  display: none;
}

/* --- 3. 极危状态指令台 --- */
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 25px 40px;
  background: linear-gradient(135deg, #e6f9ed 0%, #d1f4e0 100%);
  position: sticky; top: 0; z-index: 10;
  border-bottom: 1px solid #c6ebd5;
}

.modal-header::before {
  content: '健康警报';
  position: absolute; top: 4px; left: 45px;
  font-family: 'Share Tech Mono'; font-size: 10px; color: #00e5ff; letter-spacing: 2px;
}

.modal-header-title { display: flex; align-items: center; gap: 15px; }

.modal-alert-icon {
  width: 36px; height: 36px; color: #ff0055;
  filter: drop-shadow(0 0 12px #ff0055);
  animation: core-pulse 1s ease-in-out infinite alternate;
}

.modal-header h3 {
  margin: 0; font-size: 28px; font-weight: 900;
  letter-spacing: 5px; color: #fff;
  text-shadow: 2px 2px 0px rgba(255, 0, 85, 0.5), -2px -2px 0px rgba(0, 229, 255, 0.5);
  font-family: 'Rajdhani', sans-serif;
  position: relative;
}

.close-btn {
  position: relative;
  background: rgba(255, 0, 85, 0.1); border: 1px solid #ff0055;
  color: #ff0055; font-size: 24px; cursor: pointer;
  width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;
  clip-path: polygon(30% 0%, 100% 0%, 100% 70%, 70% 100%, 0% 100%, 0% 30%);
  transition: all 0.3s;
}

.close-btn:hover {
  background: #ff0055; color: #fff;
  box-shadow: 0 0 20px #ff0055; transform: scale(1.1);
}

.close-btn::after {
  content: 'ESC'; position: absolute; bottom: 2px; right: 4px;
  font-size: 8px; font-family: 'Share Tech Mono'; color: currentColor;
}

/* --- 4. 内部数据链路流 --- */
.modal-content {
  flex: 1; padding: 40px; overflow-y: auto;
  position: relative;
  padding-bottom: 1cm;
}

.modal-content::-webkit-scrollbar { width: 8px; }
.modal-content::-webkit-scrollbar-track { background: rgba(16, 185, 129, 0.05); border-radius: 4px; }
.modal-content::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.3); border-radius: 4px;
}
.modal-content::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.5); }

/* --- 5. 量子雷达总览阵列 --- */
.alert-summary {
  display: flex; gap: 24px; margin-bottom: 40px;
  position: relative;
  justify-content: space-between;
}

.alert-summary::before {
  content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 2px;
  background: rgba(16, 185, 129, 0.2); z-index: 0;
}

.summary-item {
  flex: 1; display: flex; flex-direction: column; align-items: flex-start; justify-content: center;
  padding: 25px 30px;
  background: #ffffff;
  border: 1px solid #d1fae5;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.06);
  position: relative; z-index: 1;
}

.summary-item::after {
  content: ''; position: absolute; right: -20px; bottom: -30px;
  width: 120px; height: 120px;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.summary-label {
  font-size: 15px; color: #059669; margin-bottom: 8px;
  font-weight: bold;
}

.summary-value {
  font-size: 48px; font-weight: 800; color: #064e3b;
  font-family: 'Share Tech Mono', monospace;
  line-height: 1;
  text-align: left;
}

.severe-count { color: #e11d48; }

/* --- 6. 独立警报物理插槽 --- */
.alert-list { display: flex; flex-direction: column; gap: 30px; }

.alert-item {
  background: #ffffff;
  padding: 30px;
  border: 1px solid rgba(167, 243, 208, 0.5);
  border-left: 4px solid var(--status-color, #52c41a);
  box-shadow: 0 8px 25px rgba(4, 120, 87, 0.04);
  position: relative;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.alert-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(4, 120, 87, 0.08);
}

.alert-item-header {
  display: flex; align-items: center;
  margin-bottom: 25px; padding-bottom: 15px;
  border-bottom: 1px dashed #d1fae5;
  position: relative;
}

.alert-item-header::after {
  content: ''; position: absolute; bottom: -1px; left: 0; width: 50px; height: 1px;
  background: var(--status-color, #10b981);
}

.alert-item-title { display: flex; align-items: center; gap: 15px; }
.alert-item-icon { width: 28px; height: 28px; color: var(--status-color, #10b981); }
.alert-item-name { font-size: 20px; font-weight: bold; color: #065f46; }

.alert-severity {
  padding: 6px 18px; font-size: 13px; font-weight: bold;
  color: #fff;
  background: var(--status-color, #10b981);
  box-shadow: 0 4px 10px color-mix(in srgb, var(--status-color) 30%, transparent);
  letter-spacing: 1px;
  border-radius: 20px;
}

/* --- 7. 终端数据链 --- */
.alert-item-body { margin-bottom: 30px; display: flex; flex-direction: column; gap: 15px;}

.alert-message {
  font-size: 15px; font-weight: bold; color: #9a3412;
  padding: 15px 20px;
  background: #fff7ed;
  border: 1px solid #ffedd5;
  border-left: 4px solid #f97316;
  border-radius: 12px;
}

.alert-suggestion {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 14px; color: #065f46;
  padding: 15px 20px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-left: 4px solid #10b981;
  border-radius: 12px;
}

.suggestion-icon { width: 20px; height: 20px; color: #10b981; }

/* --- 8. 遥测读数反馈 --- */
.alert-item-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 25px;
  background: linear-gradient(90deg, #f0fdf4 0%, #e6f9ed 100%);
  border-top: 1px solid #d1fae5;
  border-radius: 0 0 16px 16px;
}

.value-badge { display: flex; align-items: baseline; gap: 10px; }

.value-label {
  font-size: 13px; color: #047857;
  font-weight: bold;
}

.value-display {
  font-size: 22px; font-weight: 800; color: #064e3b;
}

.time-badge {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #047857; font-weight: bold;
  background: #ffffff;
  padding: 6px 14px;
  border: 1px solid #a7f3d0;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.05);
}

.time-icon { width: 16px; height: 16px; color: #10b981; }

/* ================= 史诗级入场与系统微动效 ================= */
@keyframes bg-scan { 0% { background-position: 0 0; } 100% { background-position: 0 1000px; } }
@keyframes radar-spin { 100% { transform: rotate(360deg); } }
@keyframes energy-flow { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
@keyframes core-pulse { 0% { filter: drop-shadow(0 0 5px #ff0055); transform: scale(0.95); } 100% { filter: drop-shadow(0 0 20px #ff0055); transform: scale(1.1); } }

.modal-enter-active { animation: quantum-leap 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
.modal-leave-active { transition: all 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53); }

.modal-leave-to {
  opacity: 0; transform: scale3d(0.8, 0.8, 0.8) rotateX(20deg); filter: blur(20px);
}

@keyframes quantum-leap {
  0% {
    opacity: 0; transform: scale3d(0.5, 0.5, 0.5) rotateX(45deg) translateY(200px);
    filter: blur(20px) contrast(200%);
  }
  60% {
    opacity: 0.8; transform: scale3d(1.05, 1.05, 1.05) rotateX(-5deg) translateY(-20px);
    filter: blur(2px) contrast(150%);
  }
  100% {
    opacity: 1; transform: scale3d(1, 1, 1) rotateX(0deg) translateY(0);
    filter: blur(0px) contrast(100%);
  }
}
</style>
