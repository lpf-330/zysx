<template>
  <div class="child-home-container">
    <div class="page-header">
      <div class="header-left">
        <div class="logo-area">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
            </svg>
          </div>
          <div class="logo-text">
            <span class="logo-title">健康监护</span>
            <span class="logo-subtitle">监护人端</span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="notification-wrapper" ref="notificationRef">
          <button class="icon-btn" @click="toggleNotification">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21" />
            </svg>
            <span v-if="hasWarnings" class="badge"></span>
          </button>
          <div v-if="showNotification" class="dropdown notification-dropdown">
            <div class="dropdown-header">通知中心</div>
            <div class="dropdown-body">
              <div v-if="hasWarnings" class="notification-item warning" @click="openAlertModal">
                <svg viewBox="0 0 24 24" class="notification-icon">
                  <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
                </svg>
                <div class="notification-content">
                  <span class="notification-title">健康异常提醒</span>
                  <span class="notification-desc">检测到{{ alertCount }}项健康指标异常</span>
                </div>
              </div>
              <div v-else class="notification-item empty">
                <span>暂无新通知</span>
              </div>
            </div>
          </div>
        </div>
        <div class="user-wrapper" ref="userRef">
          <button class="user-btn" @click="toggleUserMenu">
            <div class="user-avatar">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
            </div>
            <span class="user-name">{{ childUserStore.username || '用户' }}</span>
            <svg viewBox="0 0 24 24" class="arrow-icon">
              <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
            </svg>
          </button>
          <div v-if="showUserMenu" class="dropdown user-dropdown">
            <div class="dropdown-item" @click="goToProfile">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
              <span>个人资料</span>
            </div>
            <div class="dropdown-item" @click="goToSettings">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
              </svg>
              <span>账户设置</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item logout" @click="handleLogout">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M17,17.25V14H10V10H17V6.75L22.25,12L17,17.25M13,2A2,2 0 0,1 15,4V8H13V4H4V20H13V16H15V20A2,2 0 0,1 13,22H4A2,2 0 0,1 2,20V4A2,2 0 0,1 4,2H13Z" />
              </svg>
              <span>退出登录</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div v-if="!selectedParentId" class="empty-state">
        <div class="empty-icon-wrapper">
          <svg viewBox="0 0 24 24" class="empty-icon">
            <path fill="currentColor"
              d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
          </svg>
        </div>
        <h2>欢迎使用健康监护系统</h2>
        <p>请先添加或选择一位监护对象</p>
        <button class="primary-btn" @click="openParentModal()">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          添加监护对象
        </button>
      </div>

      <template v-else>
        <div class="parent-card-section">
          <div class="parent-info-card">
            <div class="parent-avatar">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
              <div class="status-indicator" :class="currentParentStatus"></div>
            </div>
            <div class="parent-details">
              <div class="parent-name">{{ currentParent?.username || '未选择' }}</div>
              <div class="parent-meta">
                <span class="meta-item">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor"
                      d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1" />
                  </svg>
                  {{ calculateAge(currentParent?.birthDate) }}岁
                </span>
                <span class="meta-item">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor"
                      d="M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2M10.5,7H13.5A2,2 0 0,1 15.5,9V14.5H14V22H10V14.5H8.5V9A2,2 0 0,1 10.5,7Z" />
                  </svg>
                  {{ currentParent?.gender === 'male' ? '男' : '女' }}
                </span>
                <span class="meta-item" v-if="currentParent?.phone">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor"
                      d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" />
                  </svg>
                  {{ currentParent?.phone }}
                </span>
              </div>
            </div>
            <div class="parent-actions">
              <button class="action-btn outline" @click="openSwitchModal" title="切换监护对象">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                </svg>
                <span>切换</span>
              </button>
              <button class="action-btn outline" @click="openParentModal(selectedParentIndex)" title="管理监护对象">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                </svg>
                <span>管理</span>
              </button>
              <button class="action-btn primary" @click="openParentModal()" title="添加监护对象">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                </svg>
              </button>
            </div>
          </div>
          <div v-if="hasWarnings" class="alert-indicator" @click="openAlertModal">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
            </svg>
            <span>{{ alertCount }}项健康异常</span>
          </div>
        </div>

        <div class="section-header">
          <h2 class="section-title">健康数据监测</h2>
          <span class="section-subtitle">实时健康指标追踪</span>
        </div>

        <div class="data-grid">
          <div class="data-card" :class="{ warning: heartWarning.level >= 2 }">
            <div class="card-icon heart">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
              </svg>
            </div>
            <div class="card-content">
              <div class="card-label">心率</div>
              <div class="card-value">
                <span class="value">{{ heartData.length > 0 ? heartData[heartData.length - 1] : '--' }}</span>
                <span class="unit">bpm</span>
              </div>
              <div class="card-status" :style="{ color: heartWarning.color }">
                {{ heartWarning.level > 0 ? heartWarning.message : (heartData.length > 0 ? '正常' : '暂无数据') }}
              </div>
            </div>
            <div class="card-chart">
              <canvas ref="heartChartRef"></canvas>
            </div>
          </div>

          <div class="data-card" :class="{ warning: bloodWarning.level >= 2 }">
            <div class="card-icon blood">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M12,2C12,2 7,7 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12C17,7 12,2 12,2M12,15A3,3 0 0,1 9,12C9,10 10.5,8 12,8C13.5,8 15,10 15,12A3,3 0 0,1 12,15Z" />
              </svg>
            </div>
            <div class="card-content">
              <div class="card-label">血糖</div>
              <div class="card-value">
                <span class="value">{{ bloodData.length > 0 ? bloodData[bloodData.length - 1] : '--' }}</span>
                <span class="unit">mmol/L</span>
              </div>
              <div class="card-status" :style="{ color: bloodWarning.color }">
                {{ bloodWarning.level > 0 ? bloodWarning.message : (bloodData.length > 0 ? '正常' : '暂无数据') }}
              </div>
            </div>
            <div class="card-chart">
              <canvas ref="bloodChartRef"></canvas>
            </div>
          </div>

          <div class="data-card" :class="{ warning: pressureWarning.level >= 2 }">
            <div class="card-icon pressure">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
              </svg>
            </div>
            <div class="card-content">
              <div class="card-label">血压</div>
              <div class="card-value bp">
                <span class="value" :class="{ warning: pressureWarning.level >= 2 && pressureData[0] > 130 }">{{
                  pressureData[0] || '--' }}</span>
                <span class="separator">/</span>
                <span class="value" :class="{ warning: pressureWarning.level >= 2 && pressureData[1] > 80 }">{{
                  pressureData[1] || '--' }}</span>
                <span class="unit">mmHg</span>
              </div>
              <div class="card-status" :style="{ color: pressureWarning.color }">
                {{ pressureWarning.level > 0 ? pressureWarning.message : (pressureData[0] ? '正常' : '暂无数据') }}
              </div>
            </div>
          </div>

          <div class="data-card" :class="{ warning: oxygenWarning.level >= 2 }">
            <div class="card-icon oxygen">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12H14A2,2 0 0,0 12,10V8Z" />
              </svg>
            </div>
            <div class="card-content">
              <div class="card-label">血氧</div>
              <div class="card-value">
                <span class="value">{{ oxygenData > 0 ? (oxygenData * 100).toFixed(1) : '--' }}</span>
                <span class="unit">%</span>
              </div>
              <div class="card-status" :style="{ color: oxygenWarning.color }">
                {{ oxygenWarning.level > 0 ? oxygenWarning.message : (oxygenData > 0 ? '正常' : '暂无数据') }}
              </div>
            </div>
            <div class="oxygen-ring"
              :style="{ '--progress': oxygenData > 0 ? oxygenData * 100 : 0, '--color': oxygenWarning.color }">
              <svg viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" stroke-width="3" />
                <circle cx="18" cy="18" r="16" fill="none" :stroke="oxygenWarning.color" stroke-width="3"
                  :stroke-dasharray="`${oxygenData > 0 ? oxygenData * 100 : 0}, 100`" transform="rotate(-90 18 18)" />
              </svg>
              <span class="ring-value">{{ oxygenData > 0 ? (oxygenData * 100).toFixed(0) : '--' }}</span>
            </div>
          </div>

          <div class="data-card" :class="{ warning: piWarning.level >= 2 }">
            <div class="card-icon pi">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12H8A4,4 0 0,1 12,8V6Z" />
              </svg>
            </div>
            <div class="card-content">
              <div class="card-label">灌注指数</div>
              <div class="card-value">
                <span class="value">{{ piData.length > 0 ? piData[piData.length - 1] : '--' }}</span>
                <span class="unit">PI</span>
              </div>
              <div class="card-status" :style="{ color: piWarning.color }">
                {{ piWarning.level > 0 ? piWarning.message : (piData.length > 0 ? '正常' : '暂无数据') }}
              </div>
            </div>
            <div class="card-chart">
              <canvas ref="piChartRef"></canvas>
            </div>
          </div>

          <div class="data-card" :class="{ warning: sleepWarning.level >= 2 }">
            <div class="card-icon sleep">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95Z" />
              </svg>
            </div>
            <div class="card-content">
              <div class="card-label">睡眠</div>
              <div class="card-value">
                <span class="value">{{ formatSleepHours(sleepData[sleepData.length - 1]) }}</span>
              </div>
              <div class="card-status" :style="{ color: sleepWarning.color }">
                {{ sleepWarning.level > 0 ? sleepWarning.message : (sleepData.length > 0 ? '正常' : '暂无数据') }}
              </div>
            </div>
            <div class="card-chart">
              <canvas ref="sleepChartRef"></canvas>
            </div>
          </div>
        </div>

        <div class="section-header">
          <h2 class="section-title">健康报告</h2>
          <button class="text-btn" @click="openReportListModal" v-if="reports.length > 3">
            查看全部
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
            </svg>
          </button>
        </div>

        <div class="report-section">
          <div class="report-actions-top">
            <button class="primary-btn" @click="generateReport" :disabled="isGenerating">
              <svg v-if="isGenerating" class="spin" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
              </svg>
              <svg v-else viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              {{ isGenerating ? '生成中...' : '生成报告' }}
            </button>
          </div>

          <div v-if="recentReports.length > 0" class="report-cards">
            <div v-for="report in recentReports" :key="report.id" class="report-card" @click="viewReport(report)">
              <div class="report-icon">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <div class="report-info">
                <div class="report-title">健康报告 #{{ report.id }}</div>
                <div class="report-date">{{ formatDate(report.createTime) }}</div>
              </div>
              <div class="report-arrow">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                </svg>
              </div>
            </div>
          </div>
          <div v-else class="empty-reports">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <p>暂无健康报告</p>
            <span>点击上方按钮生成第一份报告</span>
          </div>
        </div>
      </template>
    </div>

    <div v-if="showSwitchModal" class="modal-overlay" @click.self="closeSwitchModal">
      <div class="modal switch-modal">
        <div class="modal-header">
          <h3>选择监护对象</h3>
          <button class="modal-close" @click="closeSwitchModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="parent-grid">
            <div v-for="(parent, index) in parents" :key="parent.id" class="parent-select-card"
              :class="{ active: selectedParentIndex === index }" @click="selectParentAndClose(index)">
              <div class="parent-avatar-small">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
              </div>
              <div class="parent-name">{{ parent.username }}</div>
              <div class="parent-detail">{{ calculateAge(parent.birthDate) }}岁 · {{ parent.gender === 'male' ? '男' : '女'
              }}
              </div>
              <div v-if="selectedParentIndex === index" class="selected-badge">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                </svg>
              </div>
            </div>
          </div>
          <div v-if="parents.length === 0" class="empty-list">
            <p>暂无监护对象</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="outline-btn" @click="closeSwitchModal">取消</button>
          <button class="primary-btn" @click="openParentModal(); closeSwitchModal()">添加监护对象</button>
        </div>
      </div>
    </div>

    <div v-if="showParentModal" class="modal-overlay" @click.self="closeParentModal">
      <div class="modal parent-modal">
        <div class="modal-header">
          <h3>{{ isEditingParent ? '编辑监护对象' : '添加监护对象' }}</h3>
          <button class="modal-close" @click="closeParentModal">&times;</button>
        </div>
        <form @submit.prevent="saveParent" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>姓名</label>
              <input v-model="parentForm.username" type="text" placeholder="请输入姓名" required />
            </div>
            <div class="form-group">
              <label>性别</label>
              <select v-model="parentForm.gender" required>
                <option value="M">男</option>
                <option value="F">女</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>出生日期</label>
              <input v-model="parentForm.birth_date" type="date" required />
            </div>
            <div class="form-group">
              <label>电话号码</label>
              <input v-model="parentForm.phone" type="tel" placeholder="请输入电话" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>身高 (cm)</label>
              <input v-model.number="parentForm.height" type="number" placeholder="身高" required />
            </div>
            <div class="form-group">
              <label>体重 (kg)</label>
              <input v-model.number="parentForm.weight" type="number" placeholder="体重" required />
            </div>
          </div>
        </form>
        <div class="modal-footer">
          <button type="button" class="outline-btn" @click="closeParentModal">取消</button>
          <button type="button" class="primary-btn" @click="saveParent" :disabled="isSubmitting">
            {{ isSubmitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showManageModal" class="modal-overlay" @click.self="closeManageModal">
      <div class="modal manage-modal">
        <div class="modal-header">
          <h3>管理监护对象</h3>
          <button class="modal-close" @click="closeManageModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="manage-list">
            <div v-for="(parent, index) in parents" :key="parent.id" class="manage-item">
              <div class="manage-item-info">
                <div class="parent-avatar-small">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor"
                      d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                  </svg>
                </div>
                <div>
                  <div class="manage-item-name">{{ parent.username }}</div>
                  <div class="manage-item-detail">{{ calculateAge(parent.birthDate) }}岁 · {{ parent.gender === 'male' ?
                    '男'
                    : '女' }}</div>
                </div>
              </div>
              <div class="manage-item-actions">
                <button class="icon-btn-sm" @click="openParentModal(index); closeManageModal()" title="编辑">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor"
                      d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                  </svg>
                </button>
                <button class="icon-btn-sm danger" @click="confirmDeleteParent(index)" title="删除">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor"
                      d="M19,4H15.5L14.5,3H10.5L9.5,4H6V6H19M7,18A2,2 0 0,0 9,20H15A2,2 0 0,0 17,18V8H7V18Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div v-if="parents.length === 0" class="empty-list">
            <p>暂无监护对象</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="primary-btn" @click="closeManageModal(); openParentModal()">添加监护对象</button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="closeDeleteConfirm">
      <div class="modal confirm-modal">
        <div class="modal-header danger">
          <h3>确认删除</h3>
          <button class="modal-close" @click="closeDeleteConfirm">&times;</button>
        </div>
        <div class="modal-body">
          <p>确定要删除监护对象「{{ parents[deletingParentIndex]?.username }}」吗？</p>
          <p class="warning-text">此操作不可撤销</p>
        </div>
        <div class="modal-footer">
          <button class="outline-btn" @click="closeDeleteConfirm">取消</button>
          <button class="danger-btn" @click="executeDeleteParent">确认删除</button>
        </div>
      </div>
    </div>

    <div v-if="showAlertModal" class="modal-overlay" @click.self="closeAlertModal">
      <div class="modal alert-modal">
        <div class="modal-header warning">
          <h3>健康异常详情</h3>
          <button class="modal-close" @click="closeAlertModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="alert-summary">
            <div class="summary-card">
              <div class="summary-value">{{ alertCount }}</div>
              <div class="summary-label">异常总数</div>
            </div>
            <div class="summary-card danger">
              <div class="summary-value">{{ severeCount }}</div>
              <div class="summary-label">严重异常</div>
            </div>
          </div>
          <div class="alert-list">
            <div v-if="heartWarning.level > 0 && heartData.length > 0" class="alert-item">
              <div class="alert-item-header">
                <span class="alert-item-title">心率异常</span>
                <span class="alert-badge" :style="{ backgroundColor: heartWarning.color }">{{
                  getSeverityText(heartWarning.level) }}</span>
              </div>
              <div class="alert-item-message">{{ heartWarning.message }}</div>
              <div class="alert-item-suggestion">{{ heartWarning.suggestion }}</div>
            </div>
            <div v-if="bloodWarning.level > 0 && bloodData.length > 0" class="alert-item">
              <div class="alert-item-header">
                <span class="alert-item-title">血糖异常</span>
                <span class="alert-badge" :style="{ backgroundColor: bloodWarning.color }">{{
                  getSeverityText(bloodWarning.level) }}</span>
              </div>
              <div class="alert-item-message">{{ bloodWarning.message }}</div>
              <div class="alert-item-suggestion">{{ bloodWarning.suggestion }}</div>
            </div>
            <div v-if="pressureWarning.level > 0 && pressureData[0]" class="alert-item">
              <div class="alert-item-header">
                <span class="alert-item-title">血压异常</span>
                <span class="alert-badge" :style="{ backgroundColor: pressureWarning.color }">{{
                  getSeverityText(pressureWarning.level) }}</span>
              </div>
              <div class="alert-item-message">{{ pressureWarning.message }}</div>
              <div class="alert-item-suggestion">{{ pressureWarning.suggestion }}</div>
            </div>
            <div v-if="oxygenWarning.level > 0 && oxygenData > 0" class="alert-item">
              <div class="alert-item-header">
                <span class="alert-item-title">血氧异常</span>
                <span class="alert-badge" :style="{ backgroundColor: oxygenWarning.color }">{{
                  getSeverityText(oxygenWarning.level) }}</span>
              </div>
              <div class="alert-item-message">{{ oxygenWarning.message }}</div>
              <div class="alert-item-suggestion">{{ oxygenWarning.suggestion }}</div>
            </div>
            <div v-if="piWarning.level > 0 && piData.length > 0" class="alert-item">
              <div class="alert-item-header">
                <span class="alert-item-title">灌注指数异常</span>
                <span class="alert-badge" :style="{ backgroundColor: piWarning.color }">{{
                  getSeverityText(piWarning.level)
                }}</span>
              </div>
              <div class="alert-item-message">{{ piWarning.message }}</div>
              <div class="alert-item-suggestion">{{ piWarning.suggestion }}</div>
            </div>
            <div v-if="sleepWarning.level > 0 && sleepData.length > 0" class="alert-item">
              <div class="alert-item-header">
                <span class="alert-item-title">睡眠异常</span>
                <span class="alert-badge" :style="{ backgroundColor: sleepWarning.color }">{{
                  getSeverityText(sleepWarning.level) }}</span>
              </div>
              <div class="alert-item-message">{{ sleepWarning.message }}</div>
              <div class="alert-item-suggestion">{{ sleepWarning.suggestion }}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="primary-btn" @click="closeAlertModal">我知道了</button>
        </div>
      </div>
    </div>

    <div v-if="showReportListModal" class="modal-overlay" @click.self="closeReportListModal">
      <div class="modal report-list-modal">
        <div class="modal-header">
          <h3>全部健康报告</h3>
          <button class="modal-close" @click="closeReportListModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="report-list-full">
            <div v-for="report in reports" :key="report.id" class="report-list-item"
              @click="viewReport(report); closeReportListModal()">
              <div class="report-list-icon">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <div class="report-list-info">
                <div class="report-list-title">健康报告 #{{ report.id }}</div>
                <div class="report-list-date">{{ formatDetailedDate(report.createTime) }}</div>
              </div>
              <div class="report-list-actions" @click.stop>
                <button class="icon-btn-sm" @click="downloadReport(report)" title="下载">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                  </svg>
                </button>
                <button class="icon-btn-sm danger" @click="deleteReport(report.id)" title="删除">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor"
                      d="M19,4H15.5L14.5,3H10.5L9.5,4H6V6H19M7,18A2,2 0 0,0 9,20H15A2,2 0 0,0 17,18V8H7V18Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div v-if="reports.length === 0" class="empty-list">
            <p>暂无健康报告</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showReportDetailModal" class="modal-overlay" @click.self="closeReportDetailModal">
      <div class="modal report-detail-modal">
        <div class="modal-header">
          <h3>报告详情</h3>
          <button class="modal-close" @click="closeReportDetailModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="report-meta">
            <span>报告ID: {{ currentReport?.id }}</span>
            <span>生成时间: {{ formatDetailedDate(currentReport?.createTime) }}</span>
          </div>
          <div class="report-content-actions">
            <button class="text-btn" @click="copyReportContent">{{ copyButtonText }}</button>
            <button class="text-btn" @click="toggleReportFormat">{{ showFormattedReport ? '查看源码' : '查看格式化' }}</button>
          </div>
          <pre v-if="!showFormattedReport" class="report-content raw">{{ currentReport?.report }}</pre>
          <div v-else class="report-content formatted" v-html="formattedReportContent"></div>
        </div>
        <div class="modal-footer">
          <button class="outline-btn" @click="closeReportDetailModal">关闭</button>
          <button class="primary-btn" @click="downloadCurrentReport">下载报告</button>
        </div>
      </div>
    </div>

    <div v-if="showProgressModal" class="modal-overlay">
      <div class="modal progress-modal">
        <div class="progress-content">
          <div class="progress-icon">
            <svg class="spin" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
            </svg>
          </div>
          <h3>正在生成报告</h3>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <p>{{ progressText }}</p>
        </div>
      </div>
    </div>

    <div v-if="showMessageModal" class="modal-overlay" @click.self="closeMessageModal">
      <div class="modal message-modal">
        <div class="modal-header" :class="messageType">
          <h3>{{ messageType === 'success' ? '成功' : '错误' }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ messageText }}</p>
        </div>
        <div class="modal-footer">
          <button class="primary-btn" @click="closeMessageModal">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import useChildUserStore from '../stores/childUser'
import {
  getHeartData, getBloodData, getOxygenData, getPiData, getPreData, getSlpData,
  subscribeHeartData, subscribeBloodData, subscribeOxygenData, subscribePiData, subscribePreData, subscribeSlpData,
  unsubscribeUserAllRealTimeData, disconnectUserConnections
} from '../api/healthData'
import {
  getHealthReportList, getHealthReport, deleteHealthReport as deleteReportApi,
  generateHealthReport, saveHealthReport
} from '../api/healthReport'
import {
  addChildParent, updateChildParent, deleteChildParent
} from '../api/parentManagement'
import { HeartRateRules, BloodSugarRules, BloodPressureRules, BloodOxygenRules, PerfusionIndexRules, SleepRules } from '../utils/healthAnalyzer'

const router = useRouter()
const childUserStore = useChildUserStore()

const parents = computed(() => childUserStore.parents)
const selectedParentIndex = ref(-1)
const selectedParentId = computed(() => {
  if (selectedParentIndex.value >= 0 && parents.value[selectedParentIndex.value]) {
    return parents.value[selectedParentIndex.value].id
  }
  return null
})
const currentParent = computed(() => {
  if (selectedParentIndex.value >= 0 && parents.value[selectedParentIndex.value]) {
    return parents.value[selectedParentIndex.value]
  }
  return null
})
const currentParentStatus = computed(() => {
  if (!currentParent.value?.lastActive) return 'offline'
  const now = new Date().getTime()
  const diff = now - currentParent.value.lastActive
  const hours = diff / (1000 * 60 * 60)
  if (hours < 1) return 'online'
  if (hours < 24) return 'recently'
  return 'offline'
})

const showUserMenu = ref(false)
const showNotification = ref(false)
const userRef = ref(null)
const notificationRef = ref(null)

const showSwitchModal = ref(false)
const showManageModal = ref(false)
const showParentModal = ref(false)
const isEditingParent = ref(false)
const editingParentIndex = ref(-1)
const isSubmitting = ref(false)
const parentForm = ref({
  username: '',
  birth_date: '',
  gender: 'M',
  height: null,
  weight: null,
  phone: ''
})

const showDeleteConfirm = ref(false)
const deletingParentIndex = ref(-1)

const heartData = ref([])
const bloodData = ref([])
const oxygenData = ref(0)
const piData = ref([])
const pressureData = ref([])
const sleepData = ref([])

const heartWarning = ref({ level: 0, message: '', suggestion: '', color: '#22c55e' })
const bloodWarning = ref({ level: 0, message: '', suggestion: '', color: '#22c55e' })
const pressureWarning = ref({ level: 0, message: '', suggestion: '', color: '#22c55e' })
const oxygenWarning = ref({ level: 0, message: '', suggestion: '', color: '#22c55e' })
const piWarning = ref({ level: 0, message: '', suggestion: '', color: '#22c55e' })
const sleepWarning = ref({ level: 0, message: '', suggestion: '', color: '#22c55e' })

const heartChartRef = ref(null)
const bloodChartRef = ref(null)
const piChartRef = ref(null)
const sleepChartRef = ref(null)

const showAlertModal = ref(false)
const hasWarnings = computed(() => {
  return heartWarning.value.level >= 2 || bloodWarning.value.level >= 2 ||
    pressureWarning.value.level >= 2 || oxygenWarning.value.level >= 2 ||
    piWarning.value.level >= 2 || sleepWarning.value.level >= 2
})
const alertCount = computed(() => {
  let count = 0
  if (heartWarning.value.level > 0 && heartData.value.length > 0) count++
  if (bloodWarning.value.level > 0 && bloodData.value.length > 0) count++
  if (pressureWarning.value.level > 0 && pressureData.value[0]) count++
  if (oxygenWarning.value.level > 0 && oxygenData.value > 0) count++
  if (piWarning.value.level > 0 && piData.value.length > 0) count++
  if (sleepWarning.value.level > 0 && sleepData.value.length > 0) count++
  return count
})
const severeCount = computed(() => {
  let count = 0
  if (heartWarning.value.level >= 3 && heartData.value.length > 0) count++
  if (bloodWarning.value.level >= 3 && bloodData.value.length > 0) count++
  if (pressureWarning.value.level >= 3 && pressureData.value[0]) count++
  if (oxygenWarning.value.level >= 3 && oxygenData.value > 0) count++
  if (piWarning.value.level >= 3 && piData.value.length > 0) count++
  if (sleepWarning.value.level >= 3 && sleepData.value.length > 0) count++
  return count
})

const reports = ref([])
const recentReports = computed(() => reports.value.slice(0, 3))
const isGenerating = ref(false)
const showReportListModal = ref(false)
const showReportDetailModal = ref(false)
const currentReport = ref(null)
const showFormattedReport = ref(true)
const isCopying = ref(false)
const copyButtonText = computed(() => isCopying.value ? '已复制' : '复制')
const formattedReportContent = computed(() => formatReportContent(currentReport.value?.report || ''))

const showProgressModal = ref(false)
const progressPercent = ref(0)
const progressText = ref('')

const showMessageModal = ref(false)
const messageText = ref('')
const messageType = ref('success')

const currentUserId = ref(null)

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
  showNotification.value = false
}

function toggleNotification() {
  showNotification.value = !showNotification.value
  showUserMenu.value = false
}

function goToProfile() {
  showUserMenu.value = false
}

function goToSettings() {
  showUserMenu.value = false
}

function handleLogout() {
  showUserMenu.value = false
  childUserStore.fullReset()
  router.push('/login')
}

function calculateAge(birthDateString) {
  if (!birthDateString) return 0
  const birthDate = new Date(birthDateString)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

function selectParent(index) {
  selectedParentIndex.value = index
  childUserStore.selectParent(index)
  if (parents.value[index]) {
    fetchData()
    startRealTimeSubscriptions()
  }
}

function selectParentAndClose(index) {
  selectParent(index)
  closeSwitchModal()
}

function openSwitchModal() {
  showSwitchModal.value = true
}

function closeSwitchModal() {
  showSwitchModal.value = false
}

function openManageModal() {
  showManageModal.value = true
}

function closeManageModal() {
  showManageModal.value = false
}

function openParentModal(index = null) {
  if (typeof index === 'number' && index >= 0) {
    isEditingParent.value = true
    editingParentIndex.value = index
    const parent = parents.value[index]
    parentForm.value = {
      username: parent.username || '',
      birth_date: parent.birthDate || parent.birth_date || '',
      gender: parent.gender === 'male' ? 'M' : (parent.gender === 'female' ? 'F' : parent.gender || 'M'),
      height: parent.height || null,
      weight: parent.weight || null,
      phone: parent.phone || ''
    }
  } else {
    isEditingParent.value = false
    editingParentIndex.value = -1
    parentForm.value = {
      username: '',
      birth_date: '',
      gender: 'M',
      height: null,
      weight: null,
      phone: ''
    }
  }
  showParentModal.value = true
}

function closeParentModal() {
  showParentModal.value = false
  isSubmitting.value = false
}

async function saveParent() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    const payload = { ...parentForm.value }
    let response
    if (isEditingParent.value) {
      response = await updateChildParent(childUserStore.child_id, parents.value[editingParentIndex.value].id, payload)
      if (response.code === 1) {
        childUserStore.updateParent(editingParentIndex.value, response.data)
        showMessage('监护对象更新成功', 'success')
        closeParentModal()
      } else {
        throw new Error(response.msg || '更新失败')
      }
    } else {
      response = await addChildParent(childUserStore.child_id, payload)
      if (response.code === 1) {
        childUserStore.addParent(response.data)
        showMessage('监护对象添加成功', 'success')
        closeParentModal()
      } else {
        throw new Error(response.msg || '添加失败')
      }
    }
  } catch (error) {
    showMessage(`操作失败: ${error.message || '未知错误'}`, 'error')
  } finally {
    isSubmitting.value = false
  }
}

function confirmDeleteParent(index) {
  deletingParentIndex.value = index
  showDeleteConfirm.value = true
}

function closeDeleteConfirm() {
  showDeleteConfirm.value = false
  deletingParentIndex.value = -1
}

async function executeDeleteParent() {
  if (deletingParentIndex.value < 0) return
  const parentId = parents.value[deletingParentIndex.value].id
  try {
    const response = await deleteChildParent(childUserStore.child_id, parentId)
    if (response.code === 1) {
      childUserStore.deleteParent(deletingParentIndex.value)
      if (selectedParentIndex.value === deletingParentIndex.value) {
        selectedParentIndex.value = parents.value.length > 0 ? 0 : -1
      }
      showMessage('监护对象删除成功', 'success')
      closeDeleteConfirm()
    } else {
      throw new Error(response.msg || '删除失败')
    }
  } catch (error) {
    showMessage(`删除失败: ${error.message || '未知错误'}`, 'error')
  }
}

function openAlertModal() {
  showAlertModal.value = true
  showNotification.value = false
}

function closeAlertModal() {
  showAlertModal.value = false
}

function getSeverityText(level) {
  switch (level) {
    case 1: return '轻度'
    case 2: return '中度'
    case 3: return '严重'
    default: return ''
  }
}

function formatSleepHours(minutes) {
  if (!minutes) return '--'
  const hours = (minutes / 60).toFixed(1)
  return `${hours}h`
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffMinutes < 1) return '刚刚'
    if (diffMinutes < 60) return `${diffMinutes}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    return `${date.getMonth() + 1}/${date.getDate()}`
  } catch (e) {
    return dateString || '未知时间'
  }
}

function formatDetailedDate(dateString) {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  } catch (e) {
    return dateString || '未知时间'
  }
}

function analyzeHeartRate() {
  if (heartData.value.length === 0) {
    heartWarning.value = { level: 0, message: '', suggestion: '', color: '#22c55e' }
    return
  }
  const latest = heartData.value[heartData.value.length - 1]
  heartWarning.value = HeartRateRules.analyzeSingleHeartRate(latest)
}

function analyzeBloodSugar() {
  if (bloodData.value.length === 0) {
    bloodWarning.value = { level: 0, message: '', suggestion: '', color: '#22c55e' }
    return
  }
  const latest = bloodData.value[bloodData.value.length - 1]
  bloodWarning.value = BloodSugarRules.analyzeSinglePoint(latest)
}

function analyzeBloodPressure() {
  if (pressureData.value.length < 2) {
    pressureWarning.value = { level: 0, message: '', suggestion: '', color: '#22c55e' }
    return
  }
  pressureWarning.value = BloodPressureRules.analyzeSinglePoint(pressureData.value[0], pressureData.value[1])
}

function analyzeOxygen() {
  if (!oxygenData.value || oxygenData.value <= 0) {
    oxygenWarning.value = { level: 0, message: '', suggestion: '', color: '#22c55e' }
    return
  }
  oxygenWarning.value = BloodOxygenRules.analyzeSinglePoint(oxygenData.value * 100)
}

function analyzePi() {
  if (piData.value.length === 0) {
    piWarning.value = { level: 0, message: '', suggestion: '', color: '#22c55e' }
    return
  }
  const latest = piData.value[piData.value.length - 1]
  piWarning.value = PerfusionIndexRules.analyzeSinglePoint(latest)
}

function analyzeSleep() {
  if (sleepData.value.length === 0) {
    sleepWarning.value = { level: 0, message: '', suggestion: '', color: '#22c55e' }
    return
  }
  const latest = sleepData.value[sleepData.value.length - 1]
  sleepWarning.value = SleepRules.analyzeSinglePoint(latest / 60)
}

function resetAllData() {
  heartData.value = []
  bloodData.value = []
  oxygenData.value = 0
  piData.value = []
  pressureData.value = []
  sleepData.value = []
  heartWarning.value = { level: 0, message: '', suggestion: '', color: '#22c55e' }
  bloodWarning.value = { level: 0, message: '', suggestion: '', color: '#22c55e' }
  pressureWarning.value = { level: 0, message: '', suggestion: '', color: '#22c55e' }
  oxygenWarning.value = { level: 0, message: '', suggestion: '', color: '#22c55e' }
  piWarning.value = { level: 0, message: '', suggestion: '', color: '#22c55e' }
  sleepWarning.value = { level: 0, message: '', suggestion: '', color: '#22c55e' }
}

async function fetchData() {
  if (!selectedParentId.value) return
  if (currentUserId.value && currentUserId.value !== selectedParentId.value) {
    disconnectUserConnections(currentUserId.value)
    unsubscribeUserAllRealTimeData(currentUserId.value)
    resetAllData()
  }
  currentUserId.value = selectedParentId.value
  try {
    const [heartRes, bloodRes, oxygenRes, piRes, preRes, slpRes] = await Promise.allSettled([
      getHeartData(selectedParentId.value),
      getBloodData(selectedParentId.value),
      getOxygenData(selectedParentId.value),
      getPiData(selectedParentId.value),
      getPreData(selectedParentId.value),
      getSlpData(selectedParentId.value)
    ])
    if (heartRes.status === 'fulfilled' && Array.isArray(heartRes.value)) {
      const data = heartRes.value.slice(0, 4).reverse()
      heartData.value = data.map(item => Number(item.heartData))
    }
    if (bloodRes.status === 'fulfilled' && Array.isArray(bloodRes.value)) {
      const data = bloodRes.value.slice(0, 7).reverse()
      bloodData.value = data.map(item => Number(item.bloodData))
    }
    if (oxygenRes.status === 'fulfilled' && oxygenRes.value?.length > 0) {
      oxygenData.value = Number(oxygenRes.value[0].oxygenData) * 0.01
    }
    if (piRes.status === 'fulfilled' && Array.isArray(piRes.value)) {
      const data = piRes.value.slice(0, 4).reverse()
      piData.value = data.map(item => Number(item.piData))
    }
    if (preRes.status === 'fulfilled' && preRes.value?.length > 0) {
      pressureData.value = [Number(preRes.value[0].systolicBp), Number(preRes.value[0].diastolicBp)]
    }
    if (slpRes.status === 'fulfilled' && Array.isArray(slpRes.value)) {
      const data = slpRes.value.slice(0, 4).reverse()
      sleepData.value = data.map(item => Number(item.sleepData))
    }
    analyzeHeartRate()
    analyzeBloodSugar()
    analyzeBloodPressure()
    analyzeOxygen()
    analyzePi()
    analyzeSleep()
    await nextTick()
    drawAllCharts()
  } catch (error) {
    console.error('获取数据错误:', error)
  }
}

function startRealTimeSubscriptions() {
  if (!selectedParentId.value) return
  unsubscribeUserAllRealTimeData(selectedParentId.value)
  subscribeHeartData(selectedParentId.value, (data) => {
    if (Array.isArray(data) && data.length > 0) {
      const processed = data.slice(0, 4).reverse().map(item => Number(item.heartData))
      heartData.value = processed
      analyzeHeartRate()
      drawChart(heartChartRef.value, heartData.value, '#22c55e')
    }
  })
  subscribeBloodData(selectedParentId.value, (data) => {
    if (Array.isArray(data) && data.length > 0) {
      const processed = data.slice(0, 7).reverse().map(item => Number(item.bloodData))
      bloodData.value = processed
      analyzeBloodSugar()
      drawChart(bloodChartRef.value, bloodData.value, '#3b82f6')
    }
  })
  subscribeOxygenData(selectedParentId.value, (data) => {
    if (Array.isArray(data) && data.length > 0) {
      oxygenData.value = Number(data[0].oxygenData) * 0.01
      analyzeOxygen()
    }
  })
  subscribePiData(selectedParentId.value, (data) => {
    if (Array.isArray(data) && data.length > 0) {
      const processed = data.slice(0, 4).reverse().map(item => Number(item.piData))
      piData.value = processed
      analyzePi()
      drawChart(piChartRef.value, piData.value, '#8b5cf6')
    }
  })
  subscribePreData(selectedParentId.value, (data) => {
    if (Array.isArray(data) && data.length > 0) {
      pressureData.value = [Number(data[0].systolicBp), Number(data[0].diastolicBp)]
      analyzeBloodPressure()
    }
  })
  subscribeSlpData(selectedParentId.value, (data) => {
    if (Array.isArray(data) && data.length > 0) {
      const processed = data.slice(0, 4).reverse().map(item => Number(item.sleepData))
      sleepData.value = processed
      analyzeSleep()
      drawChart(sleepChartRef.value, sleepData.value, '#f59e0b')
    }
  })
}

function drawChart(canvasRef, data, color) {
  if (!canvasRef || !data || data.length === 0) return
  const ctx = canvasRef.getContext('2d')
  const width = canvasRef.width = canvasRef.offsetWidth * 2
  const height = canvasRef.height = canvasRef.offsetHeight * 2
  ctx.scale(2, 2)
  const w = width / 2
  const h = height / 2
  ctx.clearRect(0, 0, w, h)
  const padding = 8
  const chartW = w - padding * 2
  const chartH = h - padding * 2
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = chartW / (data.length - 1 || 1)
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  data.forEach((val, i) => {
    const x = padding + i * stepX
    const y = padding + chartH - ((val - min) / range) * chartH
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()
  ctx.beginPath()
  const gradient = ctx.createLinearGradient(0, padding, 0, h - padding)
  gradient.addColorStop(0, color + '30')
  gradient.addColorStop(1, color + '00')
  ctx.fillStyle = gradient
  data.forEach((val, i) => {
    const x = padding + i * stepX
    const y = padding + chartH - ((val - min) / range) * chartH
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.lineTo(padding + (data.length - 1) * stepX, h - padding)
  ctx.lineTo(padding, h - padding)
  ctx.closePath()
  ctx.fill()
}

function drawAllCharts() {
  drawChart(heartChartRef.value, heartData.value, '#22c55e')
  drawChart(bloodChartRef.value, bloodData.value, '#3b82f6')
  drawChart(piChartRef.value, piData.value, '#8b5cf6')
  drawChart(sleepChartRef.value, sleepData.value, '#f59e0b')
}

async function fetchReports() {
  if (!selectedParentId.value) return
  try {
    const response = await getHealthReportList(selectedParentId.value)
    if (response.code === 200) {
      reports.value = (response.data || []).sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    }
  } catch (error) {
    console.error('获取报告列表错误:', error)
  }
}

async function generateReport() {
  if (!selectedParentId.value || isGenerating.value) return
  isGenerating.value = true
  showProgressModal.value = true
  progressPercent.value = 0
  progressText.value = '正在连接服务器...'
  try {
    const { reader } = await generateHealthReport(selectedParentId.value)
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let accumulatedReport = ''
    progressPercent.value = 10
    progressText.value = '正在生成报告内容...'
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine || !trimmedLine.startsWith('data:')) continue
        const dataContent = trimmedLine.substring(5).trim()
        if (dataContent === '[DONE]') continue
        if (dataContent) {
          try {
            const parsed = JSON.parse(dataContent)
            if (parsed.answer) accumulatedReport += parsed.answer
          } catch (e) {
            accumulatedReport += dataContent
          }
        }
      }
      const progress = Math.min(90, 10 + (accumulatedReport.length / 5000) * 80)
      progressPercent.value = Math.floor(progress)
      progressText.value = `正在生成... (${accumulatedReport.length}字)`
    }
    progressText.value = '正在保存报告...'
    progressPercent.value = 95
    const saveResponse = await saveHealthReport(selectedParentId.value, accumulatedReport.trim())
    if (saveResponse.code === 200) {
      progressPercent.value = 100
      progressText.value = '报告生成完成！'
      setTimeout(() => {
        showProgressModal.value = false
        isGenerating.value = false
        showMessage('健康报告生成成功！', 'success')
        fetchReports()
      }, 1000)
    } else {
      throw new Error(saveResponse.message || '保存失败')
    }
  } catch (error) {
    showProgressModal.value = false
    isGenerating.value = false
    showMessage(`生成报告失败: ${error.message || '未知错误'}`, 'error')
  }
}

function openReportListModal() {
  showReportListModal.value = true
}

function closeReportListModal() {
  showReportListModal.value = false
}

async function viewReport(report) {
  try {
    const response = await getHealthReport(report.id)
    if (response.code === 200) {
      currentReport.value = {
        id: report.id,
        report: response.data.report || '',
        createTime: response.data.createTime
      }
      showReportDetailModal.value = true
    }
  } catch (error) {
    showMessage('获取报告失败', 'error')
  }
}

function closeReportDetailModal() {
  showReportDetailModal.value = false
  currentReport.value = null
}

function formatReportContent(content) {
  if (!content) return ''
  let formatted = content.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]))
  formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  formatted = formatted.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  formatted = formatted.replace(/\n/g, '<br>')
  return formatted
}

function toggleReportFormat() {
  showFormattedReport.value = !showFormattedReport.value
}

async function copyReportContent() {
  if (!currentReport.value?.report) return
  try {
    await navigator.clipboard.writeText(currentReport.value.report)
    isCopying.value = true
    setTimeout(() => { isCopying.value = false }, 2000)
    showMessage('报告内容已复制', 'success')
  } catch (e) {
    showMessage('复制失败', 'error')
  }
}

function downloadCurrentReport() {
  if (!currentReport.value?.report) return
  const blob = new Blob([currentReport.value.report], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `健康报告_${currentReport.value.id}_${new Date().toISOString().split('T')[0]}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function downloadReport(report) {
  const blob = new Blob([report.report || ''], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `健康报告_${report.id}_${new Date(report.createTime).toISOString().split('T')[0]}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function deleteReport(reportId) {
  if (!confirm('确定要删除这份报告吗？')) return
  try {
    const response = await deleteReportApi(reportId)
    if (response.code === 200) {
      reports.value = reports.value.filter(r => r.id !== reportId)
      showMessage('报告删除成功', 'success')
    }
  } catch (error) {
    showMessage('删除失败', 'error')
  }
}

function showMessage(text, type = 'success') {
  messageText.value = text
  messageType.value = type
  showMessageModal.value = true
}

function closeMessageModal() {
  showMessageModal.value = false
}

function handleClickOutside(e) {
  if (userRef.value && !userRef.value.contains(e.target)) {
    showUserMenu.value = false
  }
  if (notificationRef.value && !notificationRef.value.contains(e.target)) {
    showNotification.value = false
  }
}

onMounted(() => {
  childUserStore.loadFromStorage()
  document.addEventListener('click', handleClickOutside)
  if (parents.value.length > 0) {
    selectedParentIndex.value = 0
    fetchData()
    startRealTimeSubscriptions()
    fetchReports()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (currentUserId.value) {
    disconnectUserConnections(currentUserId.value)
    unsubscribeUserAllRealTimeData(currentUserId.value)
  }
})

watch(selectedParentId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchReports()
  }
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.child-home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 30%, #f0fdf4 60%, #ecfdf5 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  position: relative;
}

.child-home-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(52, 211, 153, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(167, 243, 208, 0.04) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  height: 72px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(16, 185, 129, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 30px rgba(16, 185, 129, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.logo-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
}

.logo-icon svg {
  width: 22px;
  height: 22px;
  color: white;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  color: #064e3b;
  letter-spacing: 0.5px;
}

.logo-subtitle {
  font-size: 12px;
  color: #059669;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.notification-wrapper,
.user-wrapper {
  position: relative;
}

.icon-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  position: relative;
}

.icon-btn:hover {
  background: rgba(16, 185, 129, 0.15);
  transform: translateY(-2px);
}

.icon-btn svg {
  width: 22px;
  height: 22px;
  color: #059669;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

.dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.1);
  min-width: 300px;
  overflow: hidden;
  z-index: 1000;
  animation: dropdownIn 0.3s ease;
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-12px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-header {
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #064e3b;
  border-bottom: 1px solid rgba(16, 185, 129, 0.15);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%);
}

.dropdown-body {
  padding: 12px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.notification-item:hover {
  background: rgba(16, 185, 129, 0.08);
}

.notification-item.warning {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.04) 100%);
}

.notification-item.warning:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.06) 100%);
}

.notification-icon {
  width: 22px;
  height: 22px;
  color: #ef4444;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #064e3b;
}

.notification-desc {
  font-size: 13px;
  color: #6b7280;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px 8px 8px;
  border: none;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 28px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.user-btn:hover {
  background: rgba(16, 185, 129, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
}

.user-avatar svg {
  width: 20px;
  height: 20px;
  color: white;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #064e3b;
}

.arrow-icon {
  width: 18px;
  height: 18px;
  color: #059669;
}

.user-dropdown {
  min-width: 220px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: #064e3b;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 10px;
  margin: 2px 8px;
}

.dropdown-item:hover {
  background: rgba(16, 185, 129, 0.1);
}

.dropdown-item svg {
  width: 20px;
  height: 20px;
  color: #059669;
}

.dropdown-item.logout {
  color: #ef4444;
}

.dropdown-item.logout svg {
  color: #ef4444;
}

.dropdown-item.logout:hover {
  background: rgba(239, 68, 68, 0.1);
}

.dropdown-divider {
  height: 1px;
  background: rgba(16, 185, 129, 0.15);
  margin: 8px 16px;
}

.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px;
  position: relative;
  z-index: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 65vh;
  text-align: center;
}

.empty-icon-wrapper {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  box-shadow: 0 10px 40px rgba(16, 185, 129, 0.2);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #059669;
}

.empty-state h2 {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 700;
  color: #064e3b;
}

.empty-state p {
  margin: 0 0 32px;
  font-size: 16px;
  color: #6b7280;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.45);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.primary-btn svg {
  width: 20px;
  height: 20px;
}

.outline-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: white;
  color: #064e3b;
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.outline-btn:hover {
  background: rgba(16, 185, 129, 0.08);
  border-color: #10b981;
  transform: translateY(-2px);
}

.danger-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
}

.danger-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4);
}

.text-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  background: transparent;
  color: #059669;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.text-btn:hover {
  color: #10b981;
}

.text-btn svg {
  width: 18px;
  height: 18px;
}

.parent-card-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 36px;
}

.parent-info-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px 28px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 4px 30px rgba(16, 185, 129, 0.1), 0 0 0 1px rgba(16, 185, 129, 0.1);
  transition: all 0.3s ease;
}

.parent-info-card:hover {
  box-shadow: 0 8px 40px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.15);
  transform: translateY(-2px);
}

.parent-avatar {
  position: relative;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
}

.parent-avatar svg {
  width: 32px;
  height: 32px;
  color: #059669;
}

.status-indicator {
  position: absolute;
  bottom: 3px;
  right: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.status-indicator.online {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.status-indicator.recently {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.status-indicator.offline {
  background: #94a3b8;
}

.parent-details {
  flex: 1;
}

.parent-name {
  font-size: 20px;
  font-weight: 700;
  color: #064e3b;
  margin-bottom: 8px;
}

.parent-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

.meta-item svg {
  width: 16px;
  height: 16px;
  color: #059669;
}

.parent-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn.outline {
  background: white;
  color: #059669;
  border: 2px solid rgba(16, 185, 129, 0.3);
}

.action-btn.outline:hover {
  background: rgba(16, 185, 129, 0.08);
  border-color: #10b981;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
}

.action-btn.primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 12px;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.alert-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  border-radius: 14px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.alert-indicator:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2);
}

.alert-indicator svg {
  width: 20px;
  height: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #064e3b;
}

.section-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-left: 14px;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.data-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(16, 185, 129, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.data-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.data-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.15);
}

.data-card:hover::before {
  opacity: 1;
}

.data-card.warning {
  border-color: rgba(239, 68, 68, 0.3);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 242, 242, 0.95) 100%);
}

.data-card.warning::before {
  background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
  opacity: 1;
}

.card-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card-icon svg {
  width: 26px;
  height: 26px;
  color: white;
}

.card-icon.heart {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.card-icon.blood {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.card-icon.pressure {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.card-icon.oxygen {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.card-icon.pi {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.card-icon.sleep {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.card-content {
  margin-bottom: 14px;
}

.card-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 10px;
  font-weight: 500;
}

.card-value {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.card-value .value {
  font-size: 36px;
  font-weight: 700;
  color: #064e3b;
}

.card-value .value.warning {
  color: #ef4444;
}

.card-value .unit {
  font-size: 15px;
  color: #6b7280;
  font-weight: 500;
}

.card-value.bp {
  align-items: baseline;
}

.card-value.bp .separator {
  font-size: 28px;
  color: #a7f3d0;
  margin: 0 6px;
  font-weight: 300;
}

.card-status {
  font-size: 13px;
  margin-top: 6px;
  font-weight: 500;
}

.card-chart {
  height: 70px;
  margin-top: 14px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(52, 211, 153, 0.03) 100%);
  border-radius: 12px;
  overflow: hidden;
}

.card-chart canvas {
  width: 100%;
  height: 100%;
}

.oxygen-ring {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 70px;
  height: 70px;
}

.oxygen-ring svg {
  width: 100%;
  height: 100%;
}

.ring-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  font-weight: 700;
  color: #064e3b;
}

.report-section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 28px;
  border: 1px solid rgba(16, 185, 129, 0.1);
  box-shadow: 0 4px 30px rgba(16, 185, 129, 0.08);
}

.report-actions-top {
  margin-bottom: 24px;
}

.report-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.report-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(52, 211, 153, 0.03) 100%);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(16, 185, 129, 0.1);
}

.report-card:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.2);
}

.report-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
}

.report-icon svg {
  width: 24px;
  height: 24px;
  color: #059669;
}

.report-info {
  flex: 1;
}

.report-title {
  font-size: 15px;
  font-weight: 600;
  color: #064e3b;
  margin-bottom: 6px;
}

.report-date {
  font-size: 13px;
  color: #6b7280;
}

.report-arrow {
  color: #a7f3d0;
  transition: transform 0.3s ease;
}

.report-card:hover .report-arrow {
  transform: translateX(4px);
  color: #10b981;
}

.report-arrow svg {
  width: 22px;
  height: 22px;
}

.empty-reports {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
}

.empty-reports svg {
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
  color: #a7f3d0;
}

.empty-reports p {
  margin: 0 0 8px;
  font-size: 16px;
  color: #064e3b;
  font-weight: 600;
}

.empty-reports span {
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(6, 78, 59, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  max-width: 90%;
  max-height: 85vh;
  overflow: hidden;
  animation: slideUp 0.4s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 80px rgba(16, 185, 129, 0.25);
  border: 1px solid rgba(16, 185, 129, 0.15);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(16, 185, 129, 0.15);
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #064e3b;
}

.modal-header.danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, transparent 100%);
}

.modal-header.danger h3 {
  color: #dc2626;
}

.modal-header.warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, transparent 100%);
}

.modal-header.warning h3 {
  color: #d97706;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #059669;
  transition: all 0.25s ease;
}

.modal-close:hover {
  background: rgba(16, 185, 129, 0.2);
  color: #064e3b;
  transform: rotate(90deg);
}

.modal-body {
  padding: 28px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  padding: 20px 28px;
  border-top: 1px solid rgba(16, 185, 129, 0.15);
  flex-shrink: 0;
  background: rgba(16, 185, 129, 0.02);
}

.switch-modal {
  width: 540px;
}

.parent-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.parent-select-card {
  position: relative;
  padding: 20px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, transparent 100%);
  border: 2px solid rgba(16, 185, 129, 0.15);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.parent-select-card:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(52, 211, 153, 0.03) 100%);
  border-color: rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

.parent-select-card.active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(52, 211, 153, 0.06) 100%);
  border-color: #10b981;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
}

.parent-avatar-small {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
}

.parent-avatar-small svg {
  width: 28px;
  height: 28px;
  color: #059669;
}

.parent-select-card .parent-name {
  font-size: 16px;
  font-weight: 600;
  color: #064e3b;
  margin-bottom: 6px;
}

.parent-select-card .parent-detail {
  font-size: 13px;
  color: #6b7280;
}

.selected-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4);
}

.selected-badge svg {
  width: 14px;
  height: 14px;
  color: white;
}

.parent-modal {
  width: 520px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #064e3b;
  margin-bottom: 8px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  font-size: 15px;
  color: #064e3b;
  transition: all 0.25s ease;
  background: white;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.form-group input::placeholder {
  color: #9ca3af;
}

.manage-modal {
  width: 540px;
}

.manage-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.manage-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, transparent 100%);
  border-radius: 14px;
  border: 1px solid rgba(16, 185, 129, 0.1);
  transition: all 0.25s ease;
}

.manage-item:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(52, 211, 153, 0.02) 100%);
  border-color: rgba(16, 185, 129, 0.2);
}

.manage-item-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.manage-item-name {
  font-size: 15px;
  font-weight: 600;
  color: #064e3b;
}

.manage-item-detail {
  font-size: 13px;
  color: #6b7280;
}

.manage-item-actions {
  display: flex;
  gap: 6px;
}

.icon-btn-sm {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.icon-btn-sm svg {
  width: 18px;
  height: 18px;
  color: #059669;
}

.icon-btn-sm:hover {
  background: rgba(16, 185, 129, 0.15);
  transform: translateY(-2px);
}

.icon-btn-sm.danger svg {
  color: #ef4444;
}

.icon-btn-sm.danger:hover {
  background: rgba(239, 68, 68, 0.15);
}

.confirm-modal {
  width: 420px;
}

.confirm-modal .modal-body {
  text-align: center;
}

.confirm-modal .modal-body p {
  margin: 0 0 10px;
  font-size: 16px;
  color: #064e3b;
}

.warning-text {
  font-size: 14px;
  color: #ef4444;
}

.alert-modal {
  width: 600px;
}

.alert-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.summary-card {
  flex: 1;
  padding: 24px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(52, 211, 153, 0.04) 100%);
  border-radius: 16px;
  text-align: center;
  border: 1px solid rgba(16, 185, 129, 0.15);
}

.summary-card.danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.04) 100%);
  border-color: rgba(239, 68, 68, 0.2);
}

.summary-value {
  font-size: 36px;
  font-weight: 700;
  color: #059669;
  margin-bottom: 6px;
}

.summary-card.danger .summary-value {
  color: #ef4444;
}

.summary-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.alert-item {
  padding: 18px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(239, 68, 68, 0.02) 100%);
  border-radius: 14px;
  border-left: 4px solid #ef4444;
}

.alert-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.alert-item-title {
  font-size: 15px;
  font-weight: 600;
  color: #064e3b;
}

.alert-badge {
  padding: 5px 12px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.alert-item-message {
  font-size: 14px;
  color: #ef4444;
  margin-bottom: 8px;
  font-weight: 500;
}

.alert-item-suggestion {
  font-size: 13px;
  color: #6b7280;
}

.report-list-modal {
  width: 640px;
}

.report-list-full {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, transparent 100%);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid rgba(16, 185, 129, 0.1);
}

.report-list-item:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(52, 211, 153, 0.03) 100%);
  border-color: rgba(16, 185, 129, 0.2);
  transform: translateX(4px);
}

.report-list-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
}

.report-list-icon svg {
  width: 24px;
  height: 24px;
  color: #059669;
}

.report-list-info {
  flex: 1;
}

.report-list-title {
  font-size: 15px;
  font-weight: 600;
  color: #064e3b;
  margin-bottom: 6px;
}

.report-list-date {
  font-size: 13px;
  color: #6b7280;
}

.report-list-actions {
  display: flex;
  gap: 8px;
}

.report-detail-modal {
  width: 760px;
}

.report-meta {
  display: flex;
  gap: 28px;
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%);
  border-radius: 12px;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 20px;
  border: 1px solid rgba(16, 185, 129, 0.1);
}

.report-content-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.report-content {
  padding: 20px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, transparent 100%);
  border-radius: 12px;
  max-height: 420px;
  overflow-y: auto;
  border: 1px solid rgba(16, 185, 129, 0.1);
}

.report-content.raw {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.report-content.formatted {
  font-size: 15px;
  line-height: 1.8;
  color: #374151;
}

.report-content.formatted h1 {
  font-size: 20px;
  margin: 20px 0 12px;
  color: #064e3b;
  font-weight: 700;
}

.report-content.formatted h2 {
  font-size: 18px;
  margin: 18px 0 10px;
  color: #064e3b;
  font-weight: 600;
}

.report-content.formatted h3 {
  font-size: 16px;
  margin: 16px 0 8px;
  color: #064e3b;
  font-weight: 600;
}

.progress-modal {
  width: 400px;
}

.progress-content {
  text-align: center;
  padding: 32px;
}

.progress-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 20px;
}

.progress-icon svg {
  width: 56px;
  height: 56px;
  color: #10b981;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.progress-content h3 {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 700;
  color: #064e3b;
}

.progress-bar {
  height: 8px;
  background: rgba(16, 185, 129, 0.15);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  border-radius: 4px;
  transition: width 0.4s ease;
}

.progress-content p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.message-modal {
  width: 400px;
}

.message-modal .modal-body {
  text-align: center;
}

.message-modal .modal-body p {
  margin: 0;
  font-size: 16px;
  color: #064e3b;
}

.empty-list {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
}

@media (max-width: 1200px) {
  .data-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .report-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 0 20px;
    height: 64px;
  }

  .main-content {
    padding: 24px 20px;
  }

  .data-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .report-cards {
    grid-template-columns: 1fr;
  }

  .parent-info-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .parent-meta {
    justify-content: center;
  }

  .parent-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .user-name {
    display: none;
  }

  .parent-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 18px;
  }

  .card-value .value {
    font-size: 28px;
  }

  .modal {
    border-radius: 20px;
    margin: 16px;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 16px 20px;
    flex-direction: column;
  }

  .modal-footer button {
    width: 100%;
    justify-content: center;
  }
}
</style>
