<template>
<div class="data-dashboard">
  <!-- 警告按钮（当存在异常数据时显示） -->
  <div v-if="hasWarnings" class="alert-header">
    <button class="alert-btn" @click="openAlertModal">
      <svg class="alert-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
      </svg>
      <span>检测到健康异常</span>
      <span class="alert-count">{{ getAlertCount() }}</span>
    </button>
  </div>

  <!-- 主数据展示区域 -->
  <div class="data-container">
    <div class="data-grid">
      <!-- 心率卡片 -->
      <div
        class="data-card"
        :class="{ 'warning': heartWarning.level >= 2 }"
      >
        <div class="card-header">
          <span class="card-title">心率</span>
          <span class="card-unit">bpm</span>
          <span v-if="heartWarning.level > 0" class="warning-indicator" :style="{ backgroundColor: heartWarning.color }"></span>
        </div>
        <div class="card-value">
          <div class="value-display">
            {{ heartData[heartData.length - 1] || '--' }}
            <span class="trend-icon" v-if="heartTrend && heartData.length > 0">{{ heartTrend }}</span>
          </div>
          <div class="value-status" :style="{ color: heartWarning.color }">
            <svg class="status-icon" :style="{ fill: heartWarning.color }" viewBox="0 0 24 24">
              <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
            </svg>
            <span class="status-text">{{ heartWarning.level > 0 ? '异常' : heartData.length > 0 ? '正常' : '无数据' }}</span>
          </div>
        </div>
        <div class="card-chart">
          <div class="chart-header">
            <span class="chart-title">24小时趋势</span>
            <span class="chart-range">40-180 bpm</span>
          </div>
          <HeartData :data="heartData" :warning="heartWarning" :key="`heart-${chartKey}`" />
        </div>
        <div class="card-footer" :style="{ color: heartWarning.color }">
          <svg class="footer-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
          </svg>
          {{ heartData.length > 0 ? (heartWarning.message || '心率在正常范围内') : '暂无心率数据' }}
        </div>
      </div>

      <!-- 血糖卡片 -->
      <div
        class="data-card"
        :class="{ 'warning': bloodWarning.level >= 2 }"
      >
        <div class="card-header">
          <span class="card-title">血糖</span>
          <span class="card-unit">mmol/L</span>
          <span v-if="bloodWarning.level > 0" class="warning-indicator" :style="{ backgroundColor: bloodWarning.color }"></span>
        </div>
        <div class="card-value">
          <div class="value-display">
            {{ bloodData[bloodData.length - 1] || '--' }}
            <span class="trend-icon" v-if="bloodTrend && bloodData.length > 0">{{ bloodTrend }}</span>
          </div>
          <div class="value-status" :style="{ color: bloodWarning.color }">
            <svg class="status-icon" :style="{ fill: bloodWarning.color }" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
            </svg>
            <span class="status-text">{{ bloodWarning.level > 0 ? '异常' : bloodData.length > 0 ? '正常' : '无数据' }}</span>
          </div>
        </div>
        <div class="card-chart">
          <div class="chart-header">
            <span class="chart-title">7天趋势</span>
            <span class="chart-range">3.9-10.0 mmol/L</span>
          </div>
          <BloodData :data="bloodData" :warning="bloodWarning" :key="`blood-${chartKey}`" />
        </div>
        <div class="card-footer" :style="{ color: bloodWarning.color }">
          <svg class="footer-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
          </svg>
          {{ bloodData.length > 0 ? (bloodWarning.message || '血糖在正常范围内') : '暂无血糖数据' }}
        </div>
      </div>

      <!-- 血压卡片 -->
      <div
        class="data-card blood-pressure"
        :class="{ 'warning': pressureWarning.level >= 2 }"
      >
        <div class="card-header">
          <span class="card-title">血压</span>
          <span class="card-unit">mmHg</span>
          <span v-if="pressureWarning.level > 0" class="warning-indicator" :style="{ backgroundColor: pressureWarning.color }"></span>
        </div>
        <div class="bp-values">
          <div class="bp-systolic">
            <div class="bp-label">收缩压</div>
            <div class="bp-value" :class="{ 'warning': pressureWarning.level >= 2 && pressureData[0] > 130 }">
              {{ pressureData[0] || '--' }}
            </div>
            <div class="bp-range">正常: 90-120</div>
          </div>
          <div class="separator">/</div>
          <div class="bp-diastolic">
            <div class="bp-label">舒张压</div>
            <div class="bp-value" :class="{ 'warning': pressureWarning.level >= 2 && pressureData[1] > 80 }">
              {{ pressureData[1] || '--' }}
            </div>
            <div class="bp-range">正常: 60-80</div>
          </div>
        </div>
        <div class="card-chart">
          <div class="chart-header">
            <span class="chart-title">最新测量</span>
            <span class="chart-time">{{ pressureData[0] ? formatTime(new Date()) : '--' }}</span>
          </div>
          <div class="pre">
            <PressureData :data="pressureData" :warning="pressureWarning" :key="`pressure-${chartKey}`" />
          </div>
        </div>
        <div class="card-footer" :style="{ color: pressureWarning.color }">
          <svg class="footer-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M7,10.5A1.5,1.5 0 0,1 8.5,12A1.5,1.5 0 0,1 7,13.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 7,10.5M17,10.5A1.5,1.5 0 0,1 18.5,12A1.5,1.5 0 0,1 17,13.5A1.5,1.5 0 0,1 15.5,12A1.5,1.5 0 0,1 17,10.5M12,17.23C10.25,17.23 8.71,16.5 7.81,15.42L9.23,14C9.68,14.72 10.75,15.23 12,15.23C13.25,15.23 14.32,14.72 14.77,14L16.19,15.42C15.29,16.5 13.75,17.23 12,17.23Z" />
          </svg>
          {{ pressureData[0] ? (pressureWarning.message || '血压在正常范围内') : '暂无血压数据' }}
        </div>
      </div>

      <!-- 血氧卡片 -->
      <div
        class="data-card"
        :class="{ 'warning': oxygenWarning.level >= 2 }"
      >
        <div class="card-header">
          <span class="card-title">血氧</span>
          <span class="card-unit">%</span>
          <span v-if="oxygenWarning.level > 0" class="warning-indicator" :style="{ backgroundColor: oxygenWarning.color }"></span>
        </div>
        <div class="oxygen-display">
          <div class="oxygen-value">
            {{ oxygenData > 0 ? (oxygenData * 100).toFixed(1) : '--' }}
            <span class="oxygen-unit">%</span>
          </div>
          <div class="oxygen-circle-container">
            <div class="oxygen-circle" :style="{
              '--progress': oxygenData > 0 ? oxygenData * 100 : 0,
              '--color': oxygenWarning.color
            }">
              <div class="oxygen-circle-inner">
                <span class="oxygen-circle-value">{{ oxygenData > 0 ? (oxygenData * 100).toFixed(0) : '--' }}</span>
                <span class="oxygen-circle-unit">%</span>
              </div>
            </div>
            <div class="oxygen-status" :style="{ color: oxygenWarning.color }">
              <svg class="status-icon" :style="{ fill: oxygenWarning.color }" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
              </svg>
              <span class="status-text">{{ oxygenWarning.level > 0 ? '异常' : oxygenData > 0 ? '正常' : '无数据' }}</span>
            </div>
          </div>
        </div>
        <div class="card-chart">
          <div class="chart-header">
            <span class="chart-title">血氧饱和度</span>
            <span class="chart-range">正常: ≥95%</span>
          </div>
          <div class="oxygen-mini-chart">
            <div class="oxygen-bar" v-for="i in 12" :key="i">
              <div class="oxygen-bar-fill" :style="{
                height: oxygenData > 0 ? Math.min(100, (oxygenData * 100) + (Math.random() * 10 - 5)) + '%' : '0%',
                backgroundColor: oxygenWarning.color
              }"></div>
            </div>
          </div>
        </div>
        <div class="card-footer" :style="{ color: oxygenWarning.color }">
          <svg class="footer-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
          </svg>
          {{ oxygenData > 0 ? (oxygenWarning.message || '血氧在正常范围内') : '暂无血氧数据' }}
        </div>
      </div>

      <!-- 灌注指数卡片 -->
      <div
        class="data-card"
        :class="{ 'warning': piWarning.level >= 2 }"
      >
        <div class="card-header">
          <span class="card-title">灌注指数</span>
          <span class="card-unit">PI</span>
          <span v-if="piWarning.level > 0" class="warning-indicator" :style="{ backgroundColor: piWarning.color }"></span>
        </div>
        <div class="card-value">
          <div class="value-display">
            {{ piData[piData.length - 1] || '--' }}
            <div class="pi-indicator" :class="{
              'low': piData[piData.length - 1] < 0.5,
              'normal': piData[piData.length - 1] >= 0.5 && piData[piData.length - 1] <= 10,
              'high': piData[piData.length - 1] > 10
            }"></div>
          </div>
          <div class="value-status" :style="{ color: piWarning.color }">
            <svg class="status-icon" :style="{ fill: piWarning.color }" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
            </svg>
            <span class="status-text">{{ piWarning.level > 0 ? '异常' : piData.length > 0 ? '正常' : '无数据' }}</span>
          </div>
        </div>
        <div class="card-chart">
          <div class="chart-header">
            <span class="chart-title">4小时趋势</span>
            <span class="chart-range">正常: 0.5-10 PI</span>
          </div>
          <PiData :data="piData" :warning="piWarning" :key="`pi-${chartKey}`" />
        </div>
        <div class="card-footer" :style="{ color: piWarning.color }">
          <svg class="footer-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
          </svg>
          {{ piData.length > 0 ? (piWarning.message || '灌注指数在正常范围内') : '暂无灌注指数数据' }}
        </div>
      </div>

      <!-- 睡眠卡片 -->
      <div
        class="data-card"
        :class="{ 'warning': sleepWarning.level >= 2 }"
      >
        <div class="card-header">
          <span class="card-title">睡眠</span>
          <span class="card-unit">小时</span>
          <span v-if="sleepWarning.level > 0" class="warning-indicator" :style="{ backgroundColor: sleepWarning.color }"></span>
        </div>
        <div class="card-value">
          <div class="value-display">
            {{ formatSleepHours(sleepData[sleepData.length - 1]) }}
            <div class="sleep-icon">
              <svg viewBox="0 0 24 24" :style="{ fill: sleepWarning.color }">
                <path d="M19,13H5V11H19V13M12,5A2,2 0 0,1 14,7A2,2 0 0,1 12,9A2,2 0 0,1 10,7A2,2 0 0,1 12,5M12,15A2,2 0 0,1 14,17A2,2 0 0,1 12,19A2,2 0 0,1 10,17A2,2 0 0,1 12,15Z" />
              </svg>
            </div>
          </div>
          <div class="value-status" :style="{ color: sleepWarning.color }">
            <svg class="status-icon" :style="{ fill: sleepWarning.color }" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
            </svg>
            <span class="status-text">{{ sleepWarning.level > 0 ? '异常' : sleepData.length > 0 ? '正常' : '无数据' }}</span>
          </div>
        </div>
        <div class="card-chart">
          <div class="chart-header">
            <span class="chart-title">睡眠趋势</span>
            <span class="chart-range">建议: 7-9小时</span>
          </div>
          <SleepData :data="sleepData" :key="`sleep-${chartKey}`" />
        </div>
        <div class="card-footer" :style="{ color: sleepWarning.color }">
          <svg class="footer-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,13H5V11H19V13M12,5A2,2 0 0,1 14,7A2,2 0 0,1 12,9A2,2 0 0,1 10,7A2,2 0 0,1 12,5M12,15A2,2 0 0,1 14,17A2,2 0 0,1 12,19A2,2 0 0,1 10,17A2,2 0 0,1 12,15Z" />
          </svg>
          {{ sleepData.length > 0 ? (sleepWarning.message || '睡眠时长在正常范围内') : '暂无睡眠数据' }}
        </div>
      </div>
    </div>
  </div>

  <!-- 警告详情模态框 -->
  <Transition name="modal">
    <div v-if="showAlertModal" class="alert-modal-overlay" @click.self="closeAlertModal">
      <div class="alert-modal">
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
          <div class="alert-summary">
            <div class="summary-item">
              <span class="summary-label">异常总数</span>
              <span class="summary-value">{{ getAlertCount() }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">严重异常</span>
              <span class="summary-value severe-count">{{ getSevereCount() }}</span>
            </div>
          </div>
          
          <div class="alert-list">
            <!-- 血压警告 -->
            <div v-if="pressureWarning.level > 0 && pressureData[0]" class="alert-item">
              <div class="alert-item-header">
                <div class="alert-item-title">
                  <svg class="alert-item-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M7,10.5A1.5,1.5 0 0,1 8.5,12A1.5,1.5 0 0,1 7,13.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 7,10.5M17,10.5A1.5,1.5 0 0,1 18.5,12A1.5,1.5 0 0,1 17,13.5A1.5,1.5 0 0,1 15.5,12A1.5,1.5 0 0,1 17,10.5M12,17.23C10.25,17.23 8.71,16.5 7.81,15.42L9.23,14C9.68,14.72 10.75,15.23 12,15.23C13.25,15.23 14.32,14.72 14.77,14L16.19,15.42C15.29,16.5 13.75,17.23 12,17.23Z" />
                  </svg>
                  <span class="alert-item-name">血压异常</span>
                </div>
                <div class="alert-severity" :style="{ 
                  backgroundColor: pressureWarning.color,
                  borderColor: pressureWarning.color
                }">
                  {{ getSeverityText(pressureWarning.level) }}
                </div>
              </div>
              
              <div class="alert-item-body">
                <div class="alert-message">{{ pressureWarning.message }}</div>
                <div class="alert-suggestion">
                  <svg class="suggestion-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M13.5,4A1.5,1.5 0 0,0 12,5.5A1.5,1.5 0 0,0 13.5,7A1.5,1.5 0 0,0 15,5.5A1.5,1.5 0 0,0 13.5,4M13.14,8.77C11.95,8.87 8.7,11.46 8.7,11.46C8.5,11.61 8.56,11.6 8.72,11.88C8.88,12.15 8.86,12.17 9.05,12.04C9.25,11.91 9.58,11.7 10.13,11.36C12.25,10 10.47,13.14 9.56,18.43C9.2,21.05 11.56,19.7 12.17,19.3C12.77,18.91 14.38,17.8 14.54,17.69C14.76,17.54 14.6,17.42 14.43,17.17C14.31,17 14.19,17.12 14.19,17.12C13.54,17.55 12.35,18.45 12.19,17.88C12,17.31 13.22,13.4 13.89,10.71C14,10.07 14.3,8.67 13.14,8.77Z" />
                  </svg>
                  <span>{{ pressureWarning.suggestion }}</span>
                </div>
              </div>
              
              <div class="alert-item-footer">
                <div class="value-badge">
                  <span class="value-label">当前值</span>
                  <span class="value-display">{{ pressureData[0] }}/{{ pressureData[1] }} mmHg</span>
                </div>
                <div class="time-badge">
                  <svg class="time-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                  </svg>
                  <span>{{ formatTime(new Date()) }}</span>
                </div>
              </div>
            </div>

            <!-- 灌注指数警告 -->
            <div v-if="piWarning.level > 0 && piData.length > 0" class="alert-item">
              <div class="alert-item-header">
                <div class="alert-item-title">
                  <svg class="alert-item-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
                  </svg>
                  <span class="alert-item-name">灌注指数异常</span>
                </div>
                <div class="alert-severity" :style="{ 
                  backgroundColor: piWarning.color,
                  borderColor: piWarning.color
                }">
                  {{ getSeverityText(piWarning.level) }}
                </div>
              </div>
              
              <div class="alert-item-body">
                <div class="alert-message">{{ piWarning.message }}</div>
                <div class="alert-suggestion">
                  <svg class="suggestion-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M13.5,4A1.5,1.5 0 0,0 12,5.5A1.5,1.5 0 0,0 13.5,7A1.5,1.5 0 0,0 15,5.5A1.5,1.5 0 0,0 13.5,4M13.14,8.77C11.95,8.87 8.7,11.46 8.7,11.46C8.5,11.61 8.56,11.6 8.72,11.88C8.88,12.15 8.86,12.17 9.05,12.04C9.25,11.91 9.58,11.7 10.13,11.36C12.25,10 10.47,13.14 9.56,18.43C9.2,21.05 11.56,19.7 12.17,19.3C12.77,18.91 14.38,17.8 14.54,17.69C14.76,17.54 14.6,17.42 14.43,17.17C14.31,17 14.19,17.12 14.19,17.12C13.54,17.55 12.35,18.45 12.19,17.88C12,17.31 13.22,13.4 13.89,10.71C14,10.07 14.3,8.67 13.14,8.77Z" />
                  </svg>
                  <span>{{ piWarning.suggestion }}</span>
                </div>
              </div>
              
              <div class="alert-item-footer">
                <div class="value-badge">
                  <span class="value-label">当前值</span>
                  <span class="value-display">{{ piData[piData.length - 1] }} PI</span>
                </div>
                <div class="time-badge">
                  <svg class="time-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                  </svg>
                  <span>{{ formatTime(new Date()) }}</span>
                </div>
              </div>
            </div>

            <!-- 睡眠警告 -->
            <div v-if="sleepWarning.level > 0 && sleepData.length > 0" class="alert-item">
              <div class="alert-item-header">
                <div class="alert-item-title">
                  <svg class="alert-item-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19,13H5V11H19V13M12,5A2,2 0 0,1 14,7A2,2 0 0,1 12,9A2,2 0 0,1 10,7A2,2 0 0,1 12,5M12,15A2,2 0 0,1 14,17A2,2 0 0,1 12,19A2,2 0 0,1 10,17A2,2 0 0,1 12,15Z" />
                  </svg>
                  <span class="alert-item-name">睡眠异常</span>
                </div>
                <div class="alert-severity" :style="{ 
                  backgroundColor: sleepWarning.color,
                  borderColor: sleepWarning.color
                }">
                  {{ getSeverityText(sleepWarning.level) }}
                </div>
              </div>
              
              <div class="alert-item-body">
                <div class="alert-message">{{ sleepWarning.message }}</div>
                <div class="alert-suggestion">
                  <svg class="suggestion-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M13.5,4A1.5,1.5 0 0,0 12,5.5A1.5,1.5 0 0,0 13.5,7A1.5,1.5 0 0,0 15,5.5A1.5,1.5 0 0,0 13.5,4M13.14,8.77C11.95,8.87 8.7,11.46 8.7,11.46C8.5,11.61 8.56,11.6 8.72,11.88C8.88,12.15 8.86,12.17 9.05,12.04C9.25,11.91 9.58,11.7 10.13,11.36C12.25,10 10.47,13.14 9.56,18.43C9.2,21.05 11.56,19.7 12.17,19.3C12.77,18.91 14.38,17.8 14.54,17.69C14.76,17.54 14.6,17.42 14.43,17.17C14.31,17 14.19,17.12 14.19,17.12C13.54,17.55 12.35,18.45 12.19,17.88C12,17.31 13.22,13.4 13.89,10.71C14,10.07 14.3,8.67 13.14,8.77Z" />
                  </svg>
                  <span>{{ sleepWarning.suggestion }}</span>
                </div>
              </div>
              
              <div class="alert-item-footer">
                <div class="value-badge">
                  <span class="value-label">当前时长</span>
                  <span class="value-display">{{ formatSleepTime(sleepData[sleepData.length - 1]) }}</span>
                </div>
                <div class="time-badge">
                  <svg class="time-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                  </svg>
                  <span>{{ formatTime(new Date()) }}</span>
                </div>
              </div>
            </div>

            <!-- 心率警告 -->
            <div v-if="heartWarning.level > 0 && heartData.length > 0" class="alert-item">
              <div class="alert-item-header">
                <div class="alert-item-title">
                  <svg class="alert-item-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                  </svg>
                  <span class="alert-item-name">心率异常</span>
                </div>
                <div class="alert-severity" :style="{ 
                  backgroundColor: heartWarning.color,
                  borderColor: heartWarning.color
                }">
                  {{ getSeverityText(heartWarning.level) }}
                </div>
              </div>
              
              <div class="alert-item-body">
                <div class="alert-message">{{ heartWarning.message }}</div>
                <div class="alert-suggestion">
                  <svg class="suggestion-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M13.5,4A1.5,1.5 0 0,0 12,5.5A1.5,1.5 0 0,0 13.5,7A1.5,1.5 0 0,0 15,5.5A1.5,1.5 0 0,0 13.5,4M13.14,8.77C11.95,8.87 8.7,11.46 8.7,11.46C8.5,11.61 8.56,11.6 8.72,11.88C8.88,12.15 8.86,12.17 9.05,12.04C9.25,11.91 9.58,11.7 10.13,11.36C12.25,10 10.47,13.14 9.56,18.43C9.2,21.05 11.56,19.7 12.17,19.3C12.77,18.91 14.38,17.8 14.54,17.69C14.76,17.54 14.6,17.42 14.43,17.17C14.31,17 14.19,17.12 14.19,17.12C13.54,17.55 12.35,18.45 12.19,17.88C12,17.31 13.22,13.4 13.89,10.71C14,10.07 14.3,8.67 13.14,8.77Z" />
                  </svg>
                  <span>{{ heartWarning.suggestion }}</span>
                </div>
              </div>
              
              <div class="alert-item-footer">
                <div class="value-badge">
                  <span class="value-label">当前值</span>
                  <span class="value-display">{{ heartData[heartData.length - 1] }} bpm</span>
                </div>
                <div class="time-badge">
                  <svg class="time-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                  </svg>
                  <span>{{ formatTime(new Date()) }}</span>
                </div>
              </div>
            </div>

            <!-- 血糖警告 -->
            <div v-if="bloodWarning.level > 0 && bloodData.length > 0" class="alert-item">
              <div class="alert-item-header">
                <div class="alert-item-title">
                  <svg class="alert-item-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
                  </svg>
                  <span class="alert-item-name">血糖异常</span>
                </div>
                <div class="alert-severity" :style="{ 
                  backgroundColor: bloodWarning.color,
                  borderColor: bloodWarning.color
                }">
                  {{ getSeverityText(bloodWarning.level) }}
                </div>
              </div>
              
              <div class="alert-item-body">
                <div class="alert-message">{{ bloodWarning.message }}</div>
                <div class="alert-suggestion">
                  <svg class="suggestion-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M13.5,4A1.5,1.5 0 0,0 12,5.5A1.5,1.5 0 0,0 13.5,7A1.5,1.5 0 0,0 15,5.5A1.5,1.5 0 0,0 13.5,4M13.14,8.77C11.95,8.87 8.7,11.46 8.7,11.46C8.5,11.61 8.56,11.6 8.72,11.88C8.88,12.15 8.86,12.17 9.05,12.04C9.25,11.91 9.58,11.7 10.13,11.36C12.25,10 10.47,13.14 9.56,18.43C9.2,21.05 11.56,19.7 12.17,19.3C12.77,18.91 14.38,17.8 14.54,17.69C14.76,17.54 14.6,17.42 14.43,17.17C14.31,17 14.19,17.12 14.19,17.12C13.54,17.55 12.35,18.45 12.19,17.88C12,17.31 13.22,13.4 13.89,10.71C14,10.07 14.3,8.67 13.14,8.77Z" />
                  </svg>
                  <span>{{ bloodWarning.suggestion }}</span>
                </div>
              </div>
              
              <div class="alert-item-footer">
                <div class="value-badge">
                  <span class="value-label">当前值</span>
                  <span class="value-display">{{ bloodData[bloodData.length - 1] }} mmol/L</span>
                </div>
                <div class="time-badge">
                  <svg class="time-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                  </svg>
                  <span>{{ formatTime(new Date()) }}</span>
                </div>
              </div>
            </div>

            <!-- 血氧警告 -->
            <div v-if="oxygenWarning.level > 0 && oxygenData > 0" class="alert-item">
              <div class="alert-item-header">
                <div class="alert-item-title">
                  <svg class="alert-item-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
                  </svg>
                  <span class="alert-item-name">血氧异常</span>
                </div>
                <div class="alert-severity" :style="{ 
                  backgroundColor: oxygenWarning.color,
                  borderColor: oxygenWarning.color
                }">
                  {{ getSeverityText(oxygenWarning.level) }}
                </div>
              </div>
              
              <div class="alert-item-body">
                <div class="alert-message">{{ oxygenWarning.message }}</div>
                <div class="alert-suggestion">
                  <svg class="suggestion-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M13.5,4A1.5,1.5 0 0,0 12,5.5A1.5,1.5 0 0,0 13.5,7A1.5,1.5 0 0,0 15,5.5A1.5,1.5 0 0,0 13.5,4M13.14,8.77C11.95,8.87 8.7,11.46 8.7,11.46C8.5,11.61 8.56,11.6 8.72,11.88C8.88,12.15 8.86,12.17 9.05,12.04C9.25,11.91 9.58,11.7 10.13,11.36C12.25,10 10.47,13.14 9.56,18.43C9.2,21.05 11.56,19.7 12.17,19.3C12.77,18.91 14.38,17.8 14.54,17.69C14.76,17.54 14.6,17.42 14.43,17.17C14.31,17 14.19,17.12 14.19,17.12C13.54,17.55 12.35,18.45 12.19,17.88C12,17.31 13.22,13.4 13.89,10.71C14,10.07 14.3,8.67 13.14,8.77Z" />
                  </svg>
                  <span>{{ oxygenWarning.suggestion }}</span>
                </div>
              </div>
              
              <div class="alert-item-footer">
                <div class="value-badge">
                  <span class="value-label">当前值</span>
                  <span class="value-display">{{ (oxygenData * 100).toFixed(1) }}%</span>
                </div>
                <div class="time-badge">
                  <svg class="time-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                  </svg>
                  <span>{{ formatTime(new Date()) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-close" @click="closeAlertModal">
              <svg class="btn-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { getBloodData, getHeartData, getOxygenData, getPiData, getPreData, getSlpData, disconnectUserConnections } from '../api/healthData';
import { HeartRateRules, BloodSugarRules, BloodPressureRules, BloodOxygenRules, PerfusionIndexRules, SleepRules } from '../utils/healthAnalyzer';
import HeartData from './HeartData.vue';
import BloodData from './BloodData.vue';
import PiData from './PiData.vue';
import OxygenData from './OxygenData.vue';
import SleepData from './SleepData.vue';
import PressureData from './PressureData.vue';

// 添加响应式变量
const currentUserId = ref(null);

// 添加图表刷新key
const chartKey = ref(0);

// 定义 props
const props = defineProps({
  selectedParentId: {
    type: [Number, String],
    required: true,
    default: null
  }
});

// 数据响应式引用
const heartData = ref([]);
const bloodData = ref([]);
const piData = ref([]);
const oxygenData = ref(0);
const sleepData = ref([]);
const pressureData = ref([]);

// 警告状态
const heartWarning = ref({ level: 0, message: '', suggestion: '', color: '#52c41a' });
const bloodWarning = ref({ level: 0, message: '', suggestion: '', color: '#52c41a' });
const pressureWarning = ref({ level: 0, message: '', suggestion: '', color: '#52c41a' });
const oxygenWarning = ref({ level: 0, message: '', suggestion: '', color: '#52c41a' });
const piWarning = ref({ level: 0, message: '', suggestion: '', color: '#52c41a' });
const sleepWarning = ref({ level: 0, message: '', suggestion: '', color: '#52c41a' });

// 趋势分析
const heartTrend = ref('');
const bloodTrend = ref('');

// 模态框控制
const showAlertModal = ref(false);

// 计算是否有警告
const hasWarnings = computed(() => {
  return heartWarning.value.level >= 2 ||
    bloodWarning.value.level >= 2 ||
    pressureWarning.value.level >= 2 ||
    oxygenWarning.value.level >= 2 ||
    piWarning.value.level >= 2 ||
    sleepWarning.value.level >= 2;
});

// 获取严重程度文本
const getSeverityText = (level) => {
  switch(level) {
    case 1: return '轻度';
    case 2: return '中度';
    case 3: return '严重';
    default: return '';
  }
};

// 格式化睡眠时间
const formatSleepTime = (minutes) => {
  if (!minutes) return '--:--';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins}min`;
};

// 新增方法：格式化睡眠小时数
const formatSleepHours = (minutes) => {
  if (!minutes) return '--';
  const hours = (minutes / 60).toFixed(1);
  return `${hours}h`;
};

// 新增方法：格式化时间
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 新增方法：打开警报模态框
const openAlertModal = () => {
  console.log('打开警报模态框');
  showAlertModal.value = true;
};

// 新增方法：关闭警报模态框
const closeAlertModal = () => {
  console.log('关闭警报模态框');
  showAlertModal.value = false;
};

// 获取异常总数
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

// 获取严重异常数量
const getSevereCount = () => {
  let count = 0;
  if (heartWarning.value.level >= 3 && heartData.value.length > 0) count++;
  if (bloodWarning.value.level >= 3 && bloodData.value.length > 0) count++;
  if (pressureWarning.value.level >= 3 && pressureData.value[0]) count++;
  if (oxygenWarning.value.level >= 3 && oxygenData.value > 0) count++;
  if (piWarning.value.level >= 3 && piData.value.length > 0) count++;
  if (sleepWarning.value.level >= 3 && sleepData.value.length > 0) count++;
  return count;
};

// 分析心率数据
const analyzeHeartRate = () => {
  if (heartData.value.length === 0) {
    heartTrend.value = '';
    heartWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' };
    return;
  }
  
  const latestHeartRate = heartData.value[heartData.value.length - 1];
  const analysis = HeartRateRules.analyzeSingleHeartRate(latestHeartRate);
  
  // 只有有足够数据时才分析趋势
  if (heartData.value.length >= 3) {
    const trend = HeartRateRules.analyzeHeartRateTrend(heartData.value);
    heartTrend.value = getTrendIcon(trend.trend);
  } else {
    heartTrend.value = '';
  }
  
  heartWarning.value = analysis;
};

// 分析血糖数据
const analyzeBloodSugar = () => {
  if (bloodData.value.length === 0) {
    bloodTrend.value = '';
    bloodWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' };
    return;
  }
  
  const latestBloodSugar = bloodData.value[bloodData.value.length - 1];
  const analysis = BloodSugarRules.analyzeSinglePoint(latestBloodSugar);
  
  // 只有有足够数据时才分析趋势
  if (bloodData.value.length >= 3) {
    const trend = BloodSugarRules.analyzeTrend(bloodData.value);
    bloodTrend.value = getTrendIcon(trend.trend);
  } else {
    bloodTrend.value = '';
  }
  
  bloodWarning.value = analysis;
};

// 分析血压数据
const analyzeBloodPressure = () => {
  if (pressureData.value.length < 2) {
    pressureWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' };
    return;
  }
  
  const systolic = pressureData.value[0];
  const diastolic = pressureData.value[1];
  const analysis = BloodPressureRules.analyzeSinglePoint(systolic, diastolic);
  pressureWarning.value = analysis;
};

// 分析血氧数据
const analyzeOxygen = () => {
  if (!oxygenData.value || oxygenData.value <= 0) {
    oxygenWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' };
    return;
  }
  
  const oxygenValue = oxygenData.value * 100;
  const analysis = BloodOxygenRules.analyzeSinglePoint(oxygenValue);
  oxygenWarning.value = analysis;
};

// 分析灌注指数
const analyzePi = () => {
  if (piData.value.length === 0) {
    piWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' };
    return;
  }
  
  const latestPi = piData.value[piData.value.length - 1];
  const analysis = PerfusionIndexRules.analyzeSinglePoint(latestPi);
  piWarning.value = analysis;
};

// 分析睡眠数据
const analyzeSleep = () => {
  if (sleepData.value.length === 0) {
    sleepWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' };
    return;
  }
  
  const latestSleep = sleepData.value[sleepData.value.length - 1];
  const sleepHours = latestSleep / 60;
  const analysis = SleepRules.analyzeSinglePoint(sleepHours);
  sleepWarning.value = analysis;
};

// 获取趋势图标
const getTrendIcon = (trend) => {
  const icons = {
    '快速上升': '↗',
    '缓慢上升': '↗',
    '快速下降': '↘',
    '缓慢下降': '↘',
    '保持稳定': '→',
    '波动剧烈': '↕'
  };
  return icons[trend] || '';
};

// 重置所有数据
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
  heartWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' };
  bloodWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' };
  pressureWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' };
  oxygenWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' };
  piWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' };
  sleepWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' };
  
  // 重置趋势
  heartTrend.value = '';
  bloodTrend.value = '';
  
  // 增加图表key以强制重新渲染
  chartKey.value++;
};

// 获取数据
const fetchData = async () => {
  if (!props.selectedParentId) {
    console.warn('没有选中的父母ID，跳过数据获取');
    return;
  }

  // 如果用户切换，先断开旧连接并重置所有数据
  if (currentUserId.value && currentUserId.value !== props.selectedParentId) {
    console.log(`切换用户: ${currentUserId.value} -> ${props.selectedParentId}`);
    disconnectUserConnections(currentUserId.value);
    resetAllData();
  }

  currentUserId.value = props.selectedParentId;

  try {
    // 使用 Promise.allSettled 并行获取数据
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

    // 处理灌注指数
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
    
    // 数据获取完成后，强制更新图表
    chartKey.value++;
    
  } catch (error) {
    console.error("获取数据过程中发生错误", error);
    // 发生错误时重置所有数据
    resetAllData();
  }
};

// 监听数据变化，重新分析
watch([heartData, bloodData, pressureData, oxygenData, piData, sleepData], () => {
  analyzeHeartRate();
  analyzeBloodSugar();
  analyzeBloodPressure();
  analyzeOxygen();
  analyzePi();
  analyzeSleep();
}, { deep: true });

// 监听 selectedParentId 变化
watch(() => props.selectedParentId, (newId, oldId) => {
  console.log(`选中的父母ID从 ${oldId} 变为 ${newId}`);
  if (newId !== oldId) {
    // 立即重置数据，防止显示旧数据
    if (oldId) {
      resetAllData();
    }
    // 延迟获取数据，确保DOM已更新
    setTimeout(() => {
      fetchData();
    }, 50);
  }
}, { immediate: true });

// 在组件卸载时清理连接
onUnmounted(() => {
  if (currentUserId.value) {
    disconnectUserConnections(currentUserId.value);
  }
});

onMounted(() => {
  // 组件挂载时初始化数据
  if (props.selectedParentId) {
    fetchData();
  }
});
</script>

<style scoped>
.data-dashboard {
  width: 100%;
  height: 7rem;
  background: rgb(243, 248, 253);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 警告头部 */
.alert-header {
  position: relative;
  margin-bottom: 0.1rem;
  margin-right: 30px;
  z-index: 100;
}

.alert-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;
  position: relative;
  z-index: 101;
}

.alert-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.6);
}

.alert-icon {
  width: 20px;
  height: 20px;
  animation: pulse 2s infinite;
}

.alert-count {
  background: white;
  color: #ff6b6b;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  margin-left: 4px;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* 数据容器 */
.data-container {
  height: 95%;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 20px;
  height: 100%;
}

/* 数据卡片 */
.data-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  min-height: 320px;
}

.data-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: #007AFF;
}

.data-card.warning {
  border-color: #ff6b6b;
  background: linear-gradient(145deg, #fff5f5, #ffe6e6);
  animation: warning-pulse 2s infinite;
}

@keyframes warning-pulse {
  0% { box-shadow: 0 6px 20px rgba(255, 107, 107, 0.1); }
  50% { box-shadow: 0 6px 30px rgba(255, 107, 107, 0.3); }
  100% { box-shadow: 0 6px 20px rgba(255, 107, 107, 0.1); }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  letter-spacing: 0.5px;
}

.card-unit {
  font-size: 12px;
  color: #7f8c8d;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.warning-indicator {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 卡片数值显示区域 */
.card-value {
  margin: 16px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.value-display {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 42px;
  font-weight: 800;
  color: #2c3e50;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.trend-icon {
  font-size: 28px;
  color: #007AFF;
  font-weight: bold;
  animation: trend-bounce 2s infinite;
}

@keyframes trend-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.value-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.status-icon {
  width: 16px;
  height: 16px;
}

.status-text {
  font-size: 12px;
  font-weight: 700;
}

/* 图表区域美化 */
.card-chart {
  flex: 1;
  min-height: 140px;
  margin: 20px 0;
  background: linear-gradient(135deg, rgba(248, 249, 250, 0.8), rgba(233, 236, 239, 0.6));
  border-radius: 16px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.03);
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.02);
}

.card-chart::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 122, 255, 0.2), transparent);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.chart-title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chart-range {
  font-size: 11px;
  color: #95a5a6;
  background: white;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 500;
}

/* 血压卡片特殊样式 */
.blood-pressure .card-value {
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
}

.bp-values {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.bp-systolic, .bp-diastolic {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.bp-systolic:hover, .bp-diastolic:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.bp-label {
  font-size: 13px;
  color: #7f8c8d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.bp-value {
  font-size: 36px;
  font-weight: 800;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.bp-value.warning {
  color: #f5222d;
  animation: value-warning 2s infinite;
}

@keyframes value-warning {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.bp-range {
  font-size: 11px;
  color: #95a5a6;
  padding: 3px 8px;
  background: white;
  border-radius: 10px;
  font-weight: 500;
}

.separator {
  font-size: 28px;
  color: #bdc3c7;
  font-weight: 300;
  margin: 0 8px;
}

/* 血氧显示美化 */
.oxygen-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;
}

.oxygen-value {
  font-size: 42px;
  font-weight: 800;
  color: #2c3e50;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.oxygen-unit {
  font-size: 24px;
  font-weight: 600;
  color: #7f8c8d;
}

.oxygen-circle-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.oxygen-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(
    var(--color, #007AFF) calc(var(--progress) * 1%),
    #e0e0e0 0
  );
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.2);
  animation: circle-rotate 20s linear infinite;
}

@keyframes circle-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.oxygen-circle::before {
  content: '';
  position: absolute;
  width: 70px;
  height: 70px;
  background: white;
  border-radius: 50%;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
}

.oxygen-circle-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.oxygen-circle-value {
  font-size: 24px;
  font-weight: 800;
  color: #2c3e50;
}

.oxygen-circle-unit {
  font-size: 12px;
  color: #7f8c8d;
  font-weight: 600;
}

.oxygen-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

/* 血氧迷你图表 */
.oxygen-mini-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 80px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  gap: 4px;
}

.oxygen-bar {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
  border-radius: 4px 4px 0 0;
  overflow: hidden;
}

.oxygen-bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 1.5s ease-in-out;
  animation: bar-grow 2s ease-out;
}

@keyframes bar-grow {
  from { height: 0%; }
  to { height: var(--height); }
}

/* 灌注指数指示器 */
.pi-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid #f0f0f0;
  position: relative;
}

.pi-indicator.low {
  background: conic-gradient(#f5222d 180deg, #f0f0f0 0);
}

.pi-indicator.normal {
  background: conic-gradient(#52c41a 270deg, #f0f0f0 0);
}

.pi-indicator.high {
  background: conic-gradient(#fa8c16 360deg, #f0f0f0 0);
}

.pi-indicator::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

/* 睡眠图表美化 */
.sleep-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sleep-icon svg {
  width: 100%;
  height: 100%;
}

.sleep-chart {
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sleep-periods {
  display: flex;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.sleep-period {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.sleep-period:hover {
  transform: scale(1.05);
  z-index: 2;
}

.sleep-period.deep {
  background: linear-gradient(135deg, #1890ff, #52c41a);
}

.sleep-period.light {
  background: linear-gradient(135deg, #52c41a, #faad14);
}

.sleep-period.rem {
  background: linear-gradient(135deg, #fa8c16, #f5222d);
}

.sleep-period.awake {
  background: linear-gradient(135deg, #f5222d, #722ed1);
}

.period-label {
  font-size: 10px;
  opacity: 0.9;
  margin-bottom: 2px;
}

.period-value {
  font-size: 11px;
  opacity: 0.8;
}

.sleep-hours {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.hour-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hour-label {
  font-size: 10px;
  color: #95a5a6;
  font-weight: 500;
}

/* 卡片底部 */
.card-footer {
  font-size: 14px;
  font-weight: 600;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  min-height: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #52c41a;
}

.footer-icon {
  width: 16px;
  height: 16px;
}

/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 警告详情模态框样式 */
.alert-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.alert-modal {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 24px;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  z-index: 10000;
  position: relative;
}

/* 模态框头部样式优化 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-alert-icon {
  width: 28px;
  height: 28px;
  animation: pulse 2s infinite;
}

.modal-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 50%;
}

.close-btn:hover {
  transform: scale(1.2) rotate(90deg);
  background: rgba(255, 255, 255, 0.3);
}

.modal-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  max-height: calc(85vh - 120px);
}

/* 自定义滚动条样式 */
.modal-content::-webkit-scrollbar {
  width: 10px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #ff6b6b, #ff8e8e);
  border-radius: 5px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #ff5252, #ff7b7b);
}

/* 对于 Firefox */
.modal-content {
  scrollbar-width: thin;
  scrollbar-color: #ff6b6b rgba(255, 255, 255, 0.1);
}

/* 异常摘要样式 */
.alert-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 28px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1));
  border-radius: 18px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 14px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.summary-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.summary-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 32px;
  font-weight: 800;
  color: #2c3e50;
}

.severe-count {
  color: #f5222d;
  text-shadow: 0 2px 4px rgba(245, 34, 45, 0.2);
}

/* 警告项样式优化 */
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.alert-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.alert-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(180deg, var(--item-color, #007AFF), transparent);
}

.alert-item:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.alert-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

.alert-item-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.alert-item-icon {
  width: 24px;
  height: 24px;
  color: #666;
  flex-shrink: 0;
}

.alert-item-name {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  letter-spacing: 0.5px;
}

.alert-severity {
  padding: 8px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 800;
  color: white;
  border: 2px solid;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
  text-transform: uppercase;
  min-width: 80px;
  text-align: center;
}

.alert-item-body {
  margin-bottom: 24px;
}

.alert-message {
  font-size: 16px;
  font-weight: 700;
  color: #e74c3c;
  margin-bottom: 16px;
  padding: 12px 18px;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(231, 76, 60, 0.05));
  border-radius: 12px;
  border-left: 5px solid #e74c3c;
  line-height: 1.5;
  box-shadow: 0 3px 10px rgba(231, 76, 60, 0.1);
}

.alert-suggestion {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 15px;
  color: #555;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  line-height: 1.6;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.03);
}

.suggestion-icon {
  width: 20px;
  height: 20px;
  color: #007AFF;
  flex-shrink: 0;
  margin-top: 3px;
}

.alert-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 2px solid rgba(0, 0, 0, 0.05);
}

.value-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.value-label {
  font-size: 13px;
  color: #95a5a6;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
}

.value-display {
  font-size: 20px;
  font-weight: 900;
  color: #2c3e50;
  padding: 10px 20px;
  background: linear-gradient(135deg, #f0f2f5 0%, #e4e6e9 100%);
  border-radius: 30px;
  box-shadow: 
    inset 0 3px 8px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.time-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #7f8c8d;
  padding: 8px 18px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  border: 1px solid rgba(224, 224, 224, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}

.time-icon {
  width: 18px;
  height: 18px;
  color: #7f8c8d;
}

.modal-footer {
  display: flex;
  justify-content: center;
  padding: 30px 32px 0;
  margin-top: 24px;
  border-top: 2px solid rgba(0, 0, 0, 0.05);
}

/* 关闭按钮优化 */
.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, #007AFF 0%, #0056cc 100%);
  color: white;
  border: none;
  border-radius: 35px;
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  box-shadow: 0 8px 30px rgba(0, 122, 255, 0.3);
  letter-spacing: 0.8px;
  position: relative;
  overflow: hidden;
}

.btn-close::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.btn-close:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 15px 40px rgba(0, 122, 255, 0.5);
}

.btn-close:hover::before {
  left: 100%;
}

.btn-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;
}

.btn-close:hover .btn-icon {
  transform: rotate(90deg);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .data-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }
  
  .value-display {
    font-size: 36px;
  }
  
  .bp-value {
    font-size: 32px;
  }
  
  .oxygen-circle {
    width: 70px;
    height: 70px;
  }
  
  .oxygen-circle::before {
    width: 60px;
    height: 60px;
  }
  
  .alert-modal {
    max-width: 90%;
  }
}

@media (max-width: 768px) {
  .data-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, auto);
    gap: 16px;
  }
  
  .data-card {
    min-height: 280px;
    padding: 20px;
  }
  
  .value-display {
    font-size: 32px;
  }
  
  .card-chart {
    min-height: 120px;
    padding: 12px;
  }
  
  .bp-values {
    flex-direction: column;
    gap: 16px;
  }
  
  .bp-systolic, .bp-diastolic {
    width: 100%;
  }
  
  .separator {
    transform: rotate(90deg);
    margin: 8px 0;
  }
  
  .oxygen-display {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .oxygen-mini-chart {
    height: 60px;
  }
  
  .alert-summary {
    flex-direction: column;
    gap: 16px;
  }
  
  .summary-item {
    width: 100%;
  }
  
  .alert-item-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .time-badge {
    align-self: flex-start;
  }
  
  .alert-modal {
    width: 95%;
    margin: 10px;
    max-height: 90vh;
    border-radius: 20px;
  }
  
  .modal-content {
    padding: 20px;
    max-height: calc(90vh - 120px);
  }
  
  .modal-header {
    padding: 18px 20px;
  }
  
  .modal-header h3 {
    font-size: 18px;
  }
  
  .alert-item {
    padding: 18px;
  }
  
  .alert-item-name {
    font-size: 16px;
  }
  
  .alert-message {
    font-size: 14px;
  }
  
  .btn-close {
    padding: 14px 32px;
    font-size: 16px;
    width: 100%;
  }
  
  .alert-header {
    position: fixed;
    top: 20px;
    right: 20px;
  }
  
  .alert-btn {
    padding: 10px 20px;
    font-size: 13px;
  }
}

.pre{
  margin-top: 0.1rem;
}
</style>