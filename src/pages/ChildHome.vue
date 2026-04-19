<template>
  <div class="child-home-container">
    <div class="page-header">
      <div class="breadcrumb">
        <span class="breadcrumb-item">首页</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">监护人端</span>
      </div>
      <div class="header-actions">
        <div class="notification-wrapper" ref="notificationRef">
          <button class="notification-btn" @click="toggleNotification">
            <svg viewBox="0 0 24 24" class="icon">
              <path fill="currentColor"
                d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21" />
            </svg>
            <span v-if="hasWarnings" class="notification-badge"></span>
          </button>
          <div v-if="showNotification" class="notification-dropdown">
            <div class="dropdown-header">通知</div>
            <div class="dropdown-content">
              <div v-if="hasWarnings" class="notification-item warning" @click="openAlertModal">
                <svg viewBox="0 0 24 24" class="notification-icon">
                  <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
                </svg>
                <span>检测到健康异常</span>
              </div>
              <div v-else class="notification-item">
                <span>暂无新通知</span>
              </div>
            </div>
          </div>
        </div>
        <div class="user-wrapper" ref="userRef">
          <button class="user-btn" @click="toggleUserMenu">
            <div class="user-avatar">
              <svg viewBox="0 0 24 24" class="icon">
                <path fill="currentColor"
                  d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
            </div>
            <span class="user-name">{{ childUserStore.username || '用户' }}</span>
            <svg viewBox="0 0 24 24" class="arrow-icon">
              <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
            </svg>
          </button>
          <div v-if="showUserMenu" class="user-dropdown">
            <div class="dropdown-item" @click="goToProfile">
              <svg viewBox="0 0 24 24" class="dropdown-icon">
                <path fill="currentColor"
                  d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
              <span>个人资料</span>
            </div>
            <div class="dropdown-item" @click="goToSettings">
              <svg viewBox="0 0 24 24" class="dropdown-icon">
                <path fill="currentColor"
                  d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
              </svg>
              <span>账户设置</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item logout" @click="handleLogout">
              <svg viewBox="0 0 24 24" class="dropdown-icon">
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
      <div class="sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">监护对象</h3>
          <button class="add-btn" @click="openParentModal()">
            <svg viewBox="0 0 24 24" class="icon">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
          </button>
        </div>
        <div class="parent-list" ref="parentListRef">
          <div v-for="(parent, index) in parents" :key="parent.id" class="parent-card"
            :class="{ active: selectedParentIndex === index }" @click="selectParent(index)">
            <div class="card-avatar">
              <svg viewBox="0 0 24 24" class="avatar-icon">
                <path fill="currentColor"
                  d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
              <div class="status-dot" :class="getStatusClass(parent.lastActive)"></div>
            </div>
            <div class="card-info">
              <div class="card-name">{{ parent.username }}</div>
              <div class="card-detail">{{ calculateAge(parent.birthDate) }}岁 · {{ parent.gender === 'male' ? '男' : '女'
              }}</div>
            </div>
            <div class="card-actions" @click.stop>
              <button class="action-btn edit" @click="openParentModal(index)">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                </svg>
              </button>
              <button class="action-btn delete" @click="confirmDeleteParent(index)">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M19,4H15.5L14.5,3H10.5L9.5,4H6V6H19M7,18A2,2 0 0,0 9,20H15A2,2 0 0,0 17,18V8H7V18Z" />
                </svg>
              </button>
            </div>
          </div>
          <div v-if="parents.length === 0" class="empty-parent">
            <svg viewBox="0 0 24 24" class="empty-icon">
              <path fill="currentColor"
                d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
            </svg>
            <p>暂无监护对象</p>
            <button class="add-first-btn" @click="openParentModal()">添加第一位监护对象</button>
          </div>
        </div>
      </div>

      <div class="content-area">
        <div v-if="!selectedParentId" class="no-selection">
          <svg viewBox="0 0 24 24" class="no-selection-icon">
            <path fill="currentColor"
              d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
          </svg>
          <h3>请选择一位监护对象</h3>
          <p>从左侧列表中选择监护对象以查看健康数据</p>
        </div>

        <template v-else>
          <div v-if="hasWarnings" class="alert-banner">
            <button class="alert-btn" @click="openAlertModal">
              <svg viewBox="0 0 24 24" class="alert-icon">
                <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
              </svg>
              <span>检测到健康异常</span>
              <span class="alert-count">{{ alertCount }}</span>
            </button>
          </div>

          <div class="data-grid">
            <div class="data-card" :class="{ warning: heartWarning.level >= 2 }">
              <div class="card-header">
                <span class="card-title">心率</span>
                <span class="card-unit">bpm</span>
                <span v-if="heartWarning.level > 0" class="warning-dot"
                  :style="{ backgroundColor: heartWarning.color }"></span>
              </div>
              <div class="card-value">
                <div class="value-display">{{ heartData.length > 0 ? heartData[heartData.length - 1] : '--' }}</div>
                <div class="value-status" :style="{ color: heartWarning.color }">
                  {{ heartWarning.level > 0 ? '异常' : heartData.length > 0 ? '正常' : '无数据' }}
                </div>
              </div>
              <div class="card-chart">
                <canvas ref="heartChartRef" class="chart-canvas"></canvas>
              </div>
              <div class="card-footer" :style="{ color: heartWarning.color }">
                {{ heartData.length > 0 ? (heartWarning.message || '心率在正常范围内') : '暂无心率数据' }}
              </div>
            </div>

            <div class="data-card" :class="{ warning: bloodWarning.level >= 2 }">
              <div class="card-header">
                <span class="card-title">血糖</span>
                <span class="card-unit">mmol/L</span>
                <span v-if="bloodWarning.level > 0" class="warning-dot"
                  :style="{ backgroundColor: bloodWarning.color }"></span>
              </div>
              <div class="card-value">
                <div class="value-display">{{ bloodData.length > 0 ? bloodData[bloodData.length - 1] : '--' }}</div>
                <div class="value-status" :style="{ color: bloodWarning.color }">
                  {{ bloodWarning.level > 0 ? '异常' : bloodData.length > 0 ? '正常' : '无数据' }}
                </div>
              </div>
              <div class="card-chart">
                <canvas ref="bloodChartRef" class="chart-canvas"></canvas>
              </div>
              <div class="card-footer" :style="{ color: bloodWarning.color }">
                {{ bloodData.length > 0 ? (bloodWarning.message || '血糖在正常范围内') : '暂无血糖数据' }}
              </div>
            </div>

            <div class="data-card" :class="{ warning: pressureWarning.level >= 2 }">
              <div class="card-header">
                <span class="card-title">血压</span>
                <span class="card-unit">mmHg</span>
                <span v-if="pressureWarning.level > 0" class="warning-dot"
                  :style="{ backgroundColor: pressureWarning.color }"></span>
              </div>
              <div class="bp-values">
                <div class="bp-item">
                  <div class="bp-label">收缩压</div>
                  <div class="bp-value" :class="{ warning: pressureWarning.level >= 2 && pressureData[0] > 130 }">
                    {{ pressureData[0] || '--' }}
                  </div>
                  <div class="bp-range">正常: 90-120</div>
                </div>
                <div class="bp-separator">/</div>
                <div class="bp-item">
                  <div class="bp-label">舒张压</div>
                  <div class="bp-value" :class="{ warning: pressureWarning.level >= 2 && pressureData[1] > 80 }">
                    {{ pressureData[1] || '--' }}
                  </div>
                  <div class="bp-range">正常: 60-80</div>
                </div>
              </div>
              <div class="card-footer" :style="{ color: pressureWarning.color }">
                {{ pressureData[0] ? (pressureWarning.message || '血压在正常范围内') : '暂无血压数据' }}
              </div>
            </div>

            <div class="data-card" :class="{ warning: oxygenWarning.level >= 2 }">
              <div class="card-header">
                <span class="card-title">血氧</span>
                <span class="card-unit">%</span>
                <span v-if="oxygenWarning.level > 0" class="warning-dot"
                  :style="{ backgroundColor: oxygenWarning.color }"></span>
              </div>
              <div class="oxygen-display">
                <div class="oxygen-value">{{ oxygenData > 0 ? (oxygenData * 100).toFixed(1) : '--' }}<span
                    class="unit">%</span></div>
                <div class="oxygen-circle"
                  :style="{ '--progress': oxygenData > 0 ? oxygenData * 100 : 0, '--color': oxygenWarning.color }">
                  <div class="oxygen-inner">
                    <span class="oxygen-percent">{{ oxygenData > 0 ? (oxygenData * 100).toFixed(0) : '--' }}</span>
                    <span class="oxygen-unit">%</span>
                  </div>
                </div>
              </div>
              <div class="card-footer" :style="{ color: oxygenWarning.color }">
                {{ oxygenData > 0 ? (oxygenWarning.message || '血氧在正常范围内') : '暂无血氧数据' }}
              </div>
            </div>

            <div class="data-card" :class="{ warning: piWarning.level >= 2 }">
              <div class="card-header">
                <span class="card-title">灌注指数</span>
                <span class="card-unit">PI</span>
                <span v-if="piWarning.level > 0" class="warning-dot"
                  :style="{ backgroundColor: piWarning.color }"></span>
              </div>
              <div class="card-value">
                <div class="value-display">{{ piData.length > 0 ? piData[piData.length - 1] : '--' }}</div>
                <div class="value-status" :style="{ color: piWarning.color }">
                  {{ piWarning.level > 0 ? '异常' : piData.length > 0 ? '正常' : '无数据' }}
                </div>
              </div>
              <div class="card-chart">
                <canvas ref="piChartRef" class="chart-canvas"></canvas>
              </div>
              <div class="card-footer" :style="{ color: piWarning.color }">
                {{ piData.length > 0 ? (piWarning.message || '灌注指数在正常范围内') : '暂无灌注指数数据' }}
              </div>
            </div>

            <div class="data-card" :class="{ warning: sleepWarning.level >= 2 }">
              <div class="card-header">
                <span class="card-title">睡眠</span>
                <span class="card-unit">小时</span>
                <span v-if="sleepWarning.level > 0" class="warning-dot"
                  :style="{ backgroundColor: sleepWarning.color }"></span>
              </div>
              <div class="card-value">
                <div class="value-display">{{ formatSleepHours(sleepData[sleepData.length - 1]) }}</div>
                <div class="value-status" :style="{ color: sleepWarning.color }">
                  {{ sleepWarning.level > 0 ? '异常' : sleepData.length > 0 ? '正常' : '无数据' }}
                </div>
              </div>
              <div class="card-chart">
                <canvas ref="sleepChartRef" class="chart-canvas"></canvas>
              </div>
              <div class="card-footer" :style="{ color: sleepWarning.color }">
                {{ sleepData.length > 0 ? (sleepWarning.message || '睡眠时长在正常范围内') : '暂无睡眠数据' }}
              </div>
            </div>
          </div>

          <div class="report-section">
            <div class="report-header">
              <div class="report-title">
                <svg viewBox="0 0 24 24" class="section-icon">
                  <path fill="currentColor"
                    d="M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M7,7H17V9H7V7M7,11H17V13H7V11M7,15H13V17H7V15Z" />
                </svg>
                <h3>健康报告管理</h3>
              </div>
              <button class="generate-btn" @click="generateReport" :disabled="isGenerating">
                <svg v-if="isGenerating" class="loading-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                </svg>
                <svg v-else viewBox="0 0 24 24" class="btn-icon">
                  <path fill="currentColor"
                    d="M14,12L10,8V11H2V13H10V16M20,18H4V8H16V10H18V6A2,2 0 0,0 16,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V12H20V18Z" />
                </svg>
                {{ isGenerating ? '生成中...' : '生成健康报告' }}
              </button>
            </div>

            <div v-if="reports.length > 0" class="report-list">
              <div v-for="report in reports" :key="report.id" class="report-item">
                <div class="report-info">
                  <div class="report-id">报告 #{{ report.id }}</div>
                  <div class="report-date">{{ formatDate(report.createTime) }}</div>
                </div>
                <div class="report-actions">
                  <button class="report-btn view" @click="viewReport(report)">查看</button>
                  <button class="report-btn download" @click="downloadReport(report)">下载</button>
                  <button class="report-btn delete" @click="deleteReport(report.id)">删除</button>
                </div>
              </div>
            </div>
            <div v-else class="empty-report">
              <p>暂无健康报告</p>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="showParentModal" class="modal-overlay" @click.self="closeParentModal">
      <div class="modal-content parent-modal">
        <div class="modal-header">
          <h3>{{ isEditingParent ? '编辑监护对象' : '添加监护对象' }}</h3>
          <button class="modal-close" @click="closeParentModal">&times;</button>
        </div>
        <form @submit.prevent="saveParent" class="parent-form">
          <div class="form-group">
            <label>姓名</label>
            <input v-model="parentForm.username" type="text" placeholder="输入姓名" required />
          </div>
          <div class="form-group">
            <label>出生日期</label>
            <input v-model="parentForm.birth_date" type="date" required />
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label>性别</label>
              <select v-model="parentForm.gender" required>
                <option value="M">男</option>
                <option value="F">女</option>
              </select>
            </div>
            <div class="form-group half">
              <label>身高(cm)</label>
              <input v-model.number="parentForm.height" type="number" placeholder="身高" required />
            </div>
            <div class="form-group half">
              <label>体重(kg)</label>
              <input v-model.number="parentForm.weight" type="number" placeholder="体重" required />
            </div>
          </div>
          <div class="form-group">
            <label>电话号码</label>
            <input v-model="parentForm.phone" type="tel" placeholder="输入电话号码" required />
          </div>
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? '提交中...' : (isEditingParent ? '保存修改' : '添加监护对象') }}
          </button>
        </form>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="closeDeleteConfirm">
      <div class="modal-content confirm-modal">
        <div class="modal-header warning">
          <h3>确认删除</h3>
          <button class="modal-close" @click="closeDeleteConfirm">&times;</button>
        </div>
        <div class="confirm-body">
          <p>确定要删除这个监护对象吗？此操作不可撤销。</p>
        </div>
        <div class="confirm-actions">
          <button class="cancel-btn" @click="closeDeleteConfirm">取消</button>
          <button class="delete-btn" @click="executeDeleteParent">确认删除</button>
        </div>
      </div>
    </div>

    <div v-if="showAlertModal" class="modal-overlay" @click.self="closeAlertModal">
      <div class="modal-content alert-modal">
        <div class="modal-header alert">
          <h3>健康异常详情</h3>
          <button class="modal-close" @click="closeAlertModal">&times;</button>
        </div>
        <div class="alert-body">
          <div class="alert-summary">
            <div class="summary-item">
              <span class="summary-label">异常总数</span>
              <span class="summary-value">{{ alertCount }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">严重异常</span>
              <span class="summary-value severe">{{ severeCount }}</span>
            </div>
          </div>
          <div class="alert-list">
            <div v-if="heartWarning.level > 0 && heartData.length > 0" class="alert-item">
              <div class="alert-item-header">
                <span class="alert-item-title">心率异常</span>
                <span class="alert-severity" :style="{ backgroundColor: heartWarning.color }">{{
                  getSeverityText(heartWarning.level) }}</span>
              </div>
              <div class="alert-message">{{ heartWarning.message }}</div>
              <div class="alert-suggestion">{{ heartWarning.suggestion }}</div>
            </div>
            <div v-if="bloodWarning.level > 0 && bloodData.length > 0" class="alert-item">
              <div class="alert-item-header">
                <span class="alert-item-title">血糖异常</span>
                <span class="alert-severity" :style="{ backgroundColor: bloodWarning.color }">{{
                  getSeverityText(bloodWarning.level) }}</span>
              </div>
              <div class="alert-message">{{ bloodWarning.message }}</div>
              <div class="alert-suggestion">{{ bloodWarning.suggestion }}</div>
            </div>
            <div v-if="pressureWarning.level > 0 && pressureData[0]" class="alert-item">
              <div class="alert-item-header">
                <span class="alert-item-title">血压异常</span>
                <span class="alert-severity" :style="{ backgroundColor: pressureWarning.color }">{{
                  getSeverityText(pressureWarning.level) }}</span>
              </div>
              <div class="alert-message">{{ pressureWarning.message }}</div>
              <div class="alert-suggestion">{{ pressureWarning.suggestion }}</div>
            </div>
            <div v-if="oxygenWarning.level > 0 && oxygenData > 0" class="alert-item">
              <div class="alert-item-header">
                <span class="alert-item-title">血氧异常</span>
                <span class="alert-severity" :style="{ backgroundColor: oxygenWarning.color }">{{
                  getSeverityText(oxygenWarning.level) }}</span>
              </div>
              <div class="alert-message">{{ oxygenWarning.message }}</div>
              <div class="alert-suggestion">{{ oxygenWarning.suggestion }}</div>
            </div>
            <div v-if="piWarning.level > 0 && piData.length > 0" class="alert-item">
              <div class="alert-item-header">
                <span class="alert-item-title">灌注指数异常</span>
                <span class="alert-severity" :style="{ backgroundColor: piWarning.color }">{{
                  getSeverityText(piWarning.level) }}</span>
              </div>
              <div class="alert-message">{{ piWarning.message }}</div>
              <div class="alert-suggestion">{{ piWarning.suggestion }}</div>
            </div>
            <div v-if="sleepWarning.level > 0 && sleepData.length > 0" class="alert-item">
              <div class="alert-item-header">
                <span class="alert-item-title">睡眠异常</span>
                <span class="alert-severity" :style="{ backgroundColor: sleepWarning.color }">{{
                  getSeverityText(sleepWarning.level) }}</span>
              </div>
              <div class="alert-message">{{ sleepWarning.message }}</div>
              <div class="alert-suggestion">{{ sleepWarning.suggestion }}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="close-alert-btn" @click="closeAlertModal">关闭</button>
        </div>
      </div>
    </div>

    <div v-if="showReportDetailModal" class="modal-overlay" @click.self="closeReportDetailModal">
      <div class="modal-content report-detail-modal">
        <div class="modal-header">
          <h3>健康报告详情</h3>
          <button class="modal-close" @click="closeReportDetailModal">&times;</button>
        </div>
        <div class="report-detail-body">
          <div class="report-meta">
            <div class="meta-item">
              <span class="meta-label">报告ID:</span>
              <span class="meta-value">{{ currentReport?.id }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">生成时间:</span>
              <span class="meta-value">{{ formatDetailedDate(currentReport?.createTime) }}</span>
            </div>
          </div>
          <div class="report-content-wrapper">
            <div class="content-header">
              <span>报告内容</span>
              <div class="content-actions">
                <button class="action-btn" @click="copyReportContent">{{ copyButtonText }}</button>
                <button class="action-btn" @click="toggleReportFormat">{{ showFormattedReport ? '源码' : '格式' }}</button>
              </div>
            </div>
            <pre v-if="!showFormattedReport" class="report-content raw">{{ currentReport?.report }}</pre>
            <div v-else class="report-content formatted" v-html="formattedReportContent"></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="download-btn" @click="downloadCurrentReport">下载报告</button>
          <button class="close-btn" @click="closeReportDetailModal">关闭</button>
        </div>
      </div>
    </div>

    <div v-if="showProgressModal" class="modal-overlay">
      <div class="modal-content progress-modal">
        <div class="progress-header">
          <h3>正在生成健康报告</h3>
          <span class="progress-percent">{{ progressPercent }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-text">{{ progressText }}</div>
      </div>
    </div>

    <div v-if="showMessageModal" class="modal-overlay" @click.self="closeMessageModal">
      <div class="modal-content message-modal" :class="messageType">
        <div class="modal-header" :class="messageType">
          <h3>{{ messageType === 'success' ? '操作成功' : '操作失败' }}</h3>
          <button class="modal-close" @click="closeMessageModal">&times;</button>
        </div>
        <div class="message-body">
          <p>{{ messageText }}</p>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="closeMessageModal">确定</button>
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

const showUserMenu = ref(false)
const showNotification = ref(false)
const userRef = ref(null)
const notificationRef = ref(null)

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

const heartWarning = ref({ level: 0, message: '', suggestion: '', color: '#52c41a' })
const bloodWarning = ref({ level: 0, message: '', suggestion: '', color: '#52c41a' })
const pressureWarning = ref({ level: 0, message: '', suggestion: '', color: '#52c41a' })
const oxygenWarning = ref({ level: 0, message: '', suggestion: '', color: '#52c41a' })
const piWarning = ref({ level: 0, message: '', suggestion: '', color: '#52c41a' })
const sleepWarning = ref({ level: 0, message: '', suggestion: '', color: '#52c41a' })

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
const isGenerating = ref(false)
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

function getStatusClass(lastActive) {
  if (!lastActive) return 'offline'
  const now = new Date().getTime()
  const diff = now - lastActive
  const hours = diff / (1000 * 60 * 60)
  if (hours < 1) return 'online'
  if (hours < 24) return 'recently'
  return 'offline'
}

function selectParent(index) {
  selectedParentIndex.value = index
  childUserStore.selectParent(index)
  if (parents.value[index]) {
    fetchData()
    startRealTimeSubscriptions()
  }
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
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffMinutes < 1) return '刚刚'
    if (diffMinutes < 60) return `${diffMinutes}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
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
    heartWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' }
    return
  }
  const latest = heartData.value[heartData.value.length - 1]
  heartWarning.value = HeartRateRules.analyzeSingleHeartRate(latest)
}

function analyzeBloodSugar() {
  if (bloodData.value.length === 0) {
    bloodWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' }
    return
  }
  const latest = bloodData.value[bloodData.value.length - 1]
  bloodWarning.value = BloodSugarRules.analyzeSinglePoint(latest)
}

function analyzeBloodPressure() {
  if (pressureData.value.length < 2) {
    pressureWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' }
    return
  }
  pressureWarning.value = BloodPressureRules.analyzeSinglePoint(pressureData.value[0], pressureData.value[1])
}

function analyzeOxygen() {
  if (!oxygenData.value || oxygenData.value <= 0) {
    oxygenWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' }
    return
  }
  oxygenWarning.value = BloodOxygenRules.analyzeSinglePoint(oxygenData.value * 100)
}

function analyzePi() {
  if (piData.value.length === 0) {
    piWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' }
    return
  }
  const latest = piData.value[piData.value.length - 1]
  piWarning.value = PerfusionIndexRules.analyzeSinglePoint(latest)
}

function analyzeSleep() {
  if (sleepData.value.length === 0) {
    sleepWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' }
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
  heartWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' }
  bloodWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' }
  pressureWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' }
  oxygenWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' }
  piWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' }
  sleepWarning.value = { level: 0, message: '', suggestion: '', color: '#52c41a' }
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
      drawChart(heartChartRef.value, heartData.value, '#52c41a')
    }
  })
  subscribeBloodData(selectedParentId.value, (data) => {
    if (Array.isArray(data) && data.length > 0) {
      const processed = data.slice(0, 7).reverse().map(item => Number(item.bloodData))
      bloodData.value = processed
      analyzeBloodSugar()
      drawChart(bloodChartRef.value, bloodData.value, '#1890ff')
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
      drawChart(piChartRef.value, piData.value, '#722ed1')
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
      drawChart(sleepChartRef.value, sleepData.value, '#fa8c16')
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
  const padding = 10
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
  gradient.addColorStop(0, color + '40')
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
  data.forEach((val, i) => {
    const x = padding + i * stepX
    const y = padding + chartH - ((val - min) / range) * chartH
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  })
}

function drawAllCharts() {
  drawChart(heartChartRef.value, heartData.value, '#52c41a')
  drawChart(bloodChartRef.value, bloodData.value, '#1890ff')
  drawChart(piChartRef.value, piData.value, '#722ed1')
  drawChart(sleepChartRef.value, sleepData.value, '#fa8c16')
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
      progressText.value = `正在生成报告内容... (${accumulatedReport.length}字)`
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
:root {
  --primary-green: #4CAF50;
  --primary-green-light: #81C784;
  --primary-green-dark: #388E3C;
  --bg-gradient-start: #E8F5E9;
  --bg-gradient-end: #C8E6C9;
  --card-bg: rgba(255, 255, 255, 0.95);
  --card-shadow: 0 4px 20px rgba(76, 175, 80, 0.15);
  --text-primary: #2E7D32;
  --text-secondary: #558B2F;
  --text-dark: #1B5E20;
  --border-color: rgba(76, 175, 80, 0.2);
  --success-color: #4CAF50;
  --warning-color: #FF9800;
  --danger-color: #F44336;
}

.child-home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.breadcrumb-item {
  color: var(--text-secondary);
}

.breadcrumb-item.active {
  color: var(--text-primary);
  font-weight: 600;
}

.breadcrumb-separator {
  color: #A5D6A7;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-wrapper,
.user-wrapper {
  position: relative;
}

.notification-btn,
.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.notification-btn:hover,
.user-btn:hover {
  background: rgba(76, 175, 80, 0.1);
}

.icon {
  width: 20px;
  height: 20px;
  color: var(--text-primary);
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: var(--danger-color);
  border-radius: 50%;
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

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary-green-light), var(--primary-green));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar .icon {
  width: 18px;
  height: 18px;
  color: white;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-dark);
}

.arrow-icon {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
  transition: transform 0.3s ease;
}

.notification-dropdown,
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  overflow: hidden;
  z-index: 1000;
  animation: dropdownIn 0.2s ease;
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: 12px 16px;
  font-weight: 600;
  color: var(--text-dark);
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--bg-gradient-start), white);
}

.dropdown-content {
  padding: 8px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-item:hover {
  background: rgba(76, 175, 80, 0.1);
}

.notification-item.warning {
  color: var(--danger-color);
}

.notification-icon {
  width: 20px;
  height: 20px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(76, 175, 80, 0.1);
}

.dropdown-icon {
  width: 18px;
  height: 18px;
  color: var(--text-primary);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 4px 0;
}

.dropdown-item.logout {
  color: var(--danger-color);
}

.dropdown-item.logout .dropdown-icon {
  color: var(--danger-color);
}

.main-content {
  display: flex;
  padding: 20px;
  gap: 20px;
  min-height: calc(100vh - 70px);
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
  color: white;
}

.sidebar-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.add-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.add-btn .icon {
  width: 18px;
  height: 18px;
  color: white;
}

.parent-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.parent-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 8px;
  border: 2px solid transparent;
}

.parent-card:hover {
  background: rgba(76, 175, 80, 0.05);
  border-color: var(--primary-green-light);
}

.parent-card.active {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.1));
  border-color: var(--primary-green);
}

.card-avatar {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.avatar-icon {
  width: 44px;
  height: 44px;
  color: var(--primary-green);
}

.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-dot.online {
  background: var(--success-color);
}

.status-dot.recently {
  background: var(--warning-color);
}

.status-dot.offline {
  background: #BDBDBD;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-detail {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.card-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.parent-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.action-btn.edit {
  color: var(--primary-green);
}

.action-btn.edit:hover {
  background: rgba(76, 175, 80, 0.1);
}

.action-btn.delete {
  color: var(--danger-color);
}

.action-btn.delete:hover {
  background: rgba(244, 67, 54, 0.1);
}

.empty-parent {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--primary-green-light);
  margin-bottom: 12px;
}

.add-first-btn {
  margin-top: 16px;
  padding: 10px 20px;
  border: none;
  background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.add-first-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

.content-area {
  flex: 1;
  min-width: 0;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: var(--card-shadow);
}

.no-selection-icon {
  width: 64px;
  height: 64px;
  color: var(--primary-green-light);
  margin-bottom: 16px;
}

.no-selection h3 {
  margin: 0 0 8px;
  color: var(--text-dark);
}

.no-selection p {
  margin: 0;
  color: var(--text-secondary);
}

.alert-banner {
  margin-bottom: 16px;
}

.alert-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.alert-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.alert-icon {
  width: 20px;
  height: 20px;
  animation: pulse 2s infinite;
}

.alert-count {
  background: white;
  color: #FF6B6B;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.data-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.data-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(76, 175, 80, 0.2);
  border-color: var(--primary-green-light);
}

.data-card.warning {
  border-color: var(--danger-color);
  animation: warningPulse 2s infinite;
}

@keyframes warningPulse {

  0%,
  100% {
    box-shadow: 0 4px 20px rgba(244, 67, 54, 0.1);
  }

  50% {
    box-shadow: 0 4px 30px rgba(244, 67, 54, 0.3);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}

.card-unit {
  font-size: 11px;
  color: var(--text-secondary);
  background: rgba(76, 175, 80, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.warning-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: auto;
  animation: pulse 1.5s infinite;
}

.card-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.value-display {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-dark);
}

.value-status {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
}

.card-chart {
  height: 80px;
  margin-bottom: 12px;
  background: rgba(76, 175, 80, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

.card-footer {
  font-size: 12px;
  color: var(--success-color);
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}

.bp-values {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 12px;
  padding: 16px 0;
}

.bp-item {
  text-align: center;
}

.bp-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.bp-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-dark);
}

.bp-value.warning {
  color: var(--danger-color);
  animation: pulse 1s infinite;
}

.bp-range {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.bp-separator {
  font-size: 24px;
  color: var(--text-secondary);
}

.oxygen-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.oxygen-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-dark);
}

.oxygen-value .unit {
  font-size: 16px;
  color: var(--text-secondary);
}

.oxygen-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: conic-gradient(var(--color, var(--primary-green)) calc(var(--progress) * 1%), #E8F5E9 0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.oxygen-circle::before {
  content: '';
  position: absolute;
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 50%;
}

.oxygen-inner {
  position: relative;
  z-index: 1;
  text-align: center;
}

.oxygen-percent {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
}

.oxygen-unit {
  font-size: 10px;
  color: var(--text-secondary);
}

.report-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--card-shadow);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.report-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  width: 24px;
  height: 24px;
  color: var(--primary-green);
}

.report-title h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-dark);
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon,
.loading-icon {
  width: 16px;
  height: 16px;
}

.loading-icon {
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

.report-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.report-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(76, 175, 80, 0.05);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.report-item:hover {
  background: rgba(76, 175, 80, 0.1);
}

.report-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.report-id {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}

.report-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.report-actions {
  display: flex;
  gap: 8px;
}

.report-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.report-btn.view {
  background: rgba(76, 175, 80, 0.1);
  color: var(--primary-green);
}

.report-btn.download {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.report-btn.delete {
  background: rgba(244, 67, 54, 0.1);
  color: var(--danger-color);
}

.report-btn:hover {
  transform: translateY(-1px);
}

.empty-report {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.parent-modal {
  width: 420px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
  color: white;
}

.modal-header.warning {
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
}

.modal-header.alert {
  background: linear-gradient(135deg, #FF9800, #F57C00);
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.parent-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-dark);
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-group.half {
  flex: 1;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-modal {
  width: 360px;
}

.confirm-body {
  padding: 24px 20px;
  text-align: center;
}

.confirm-body p {
  margin: 0;
  color: var(--text-dark);
}

.confirm-actions {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color);
}

.cancel-btn,
.delete-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f5f5f5;
  color: var(--text-dark);
}

.delete-btn {
  background: var(--danger-color);
  color: white;
}

.delete-btn:hover {
  background: #D32F2F;
}

.alert-modal {
  width: 560px;
}

.alert-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.alert-summary {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.summary-item {
  flex: 1;
  padding: 16px;
  background: rgba(76, 175, 80, 0.05);
  border-radius: 10px;
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-dark);
}

.summary-value.severe {
  color: var(--danger-color);
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  padding: 16px;
  background: rgba(255, 107, 107, 0.05);
  border-radius: 10px;
  border-left: 4px solid var(--danger-color);
}

.alert-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.alert-item-title {
  font-weight: 600;
  color: var(--text-dark);
}

.alert-severity {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.alert-message {
  font-size: 14px;
  color: var(--danger-color);
  margin-bottom: 8px;
}

.alert-suggestion {
  font-size: 13px;
  color: var(--text-secondary);
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.close-alert-btn,
.close-btn,
.download-btn,
.confirm-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.close-alert-btn {
  background: var(--primary-green);
  color: white;
}

.close-btn {
  background: #f5f5f5;
  color: var(--text-dark);
}

.download-btn {
  background: linear-gradient(135deg, #4CAF50, #388E3C);
  color: white;
}

.confirm-btn {
  background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
  color: white;
}

.report-detail-modal {
  width: 640px;
}

.report-detail-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.report-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 16px;
  background: rgba(76, 175, 80, 0.05);
  border-radius: 10px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.meta-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}

.report-content-wrapper {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(76, 175, 80, 0.05);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dark);
}

.content-actions {
  display: flex;
  gap: 8px;
}

.content-actions .action-btn {
  padding: 6px 12px;
  border: none;
  background: rgba(76, 175, 80, 0.1);
  color: var(--primary-green);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.content-actions .action-btn:hover {
  background: rgba(76, 175, 80, 0.2);
}

.report-content {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.report-content.raw {
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
  background: #fafafa;
}

.report-content.formatted {
  font-size: 14px;
  line-height: 1.6;
}

.report-content.formatted h1 {
  font-size: 18px;
  margin: 16px 0 8px;
  color: var(--text-dark);
}

.report-content.formatted h2 {
  font-size: 16px;
  margin: 14px 0 6px;
  color: var(--text-dark);
}

.report-content.formatted h3 {
  font-size: 14px;
  margin: 12px 0 4px;
  color: var(--text-dark);
}

.report-content.formatted strong {
  color: var(--text-dark);
}

.progress-modal {
  width: 400px;
  padding: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-dark);
}

.progress-percent {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-green);
}

.progress-bar {
  height: 8px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-green), var(--primary-green-dark));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
}

.message-modal {
  width: 360px;
}

.message-modal .modal-header {
  background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
}

.message-modal .modal-header.error {
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
}

.message-body {
  padding: 24px;
  text-align: center;
}

.message-body p {
  margin: 0;
  font-size: 14px;
  color: var(--text-dark);
}

@media (max-width: 1200px) {
  .data-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    max-height: 300px;
  }

  .data-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    padding: 12px 16px;
  }

  .user-name {
    display: none;
  }
}
</style>
