<template>
<div class="health-report-manager-wrapper">
  <div class="ambient-aurora"></div>
  <div class="ambient-orb orb-1"></div>
  <div class="ambient-orb orb-2"></div>

  <div class="health-report-manager">
    <div class="header-section">
      <div class="title-container">
        <div class="icon-halo">
          <div class="halo-ring"></div>
          <svg class="title-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M7,7H17V9H7V7M7,11H17V13H7V11M7,15H13V17H7V15Z" />
          </svg>
        </div>
        <h3 class="section-title">健康报告</h3>
      </div>

      <button
        class="generate-btn"
        @click="generateReport"
        :disabled="isGenerating || !selectedParentId"
        :class="{ 'is-generating': isGenerating }"
      >
        <span class="btn-glow-wrap">
          <span class="btn-glow-trace"></span>
        </span>
        <span class="btn-content">
          <svg v-if="isGenerating" class="loading-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
          </svg>
          <svg v-else class="generate-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M14,12L10,8V11H2V13H10V16M20,18H4V8H16V10H18V6A2,2 0 0,0 16,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V12H20V18Z" />
          </svg>
          {{ isGenerating ? '生成中...' : '生成健康报告' }}
        </span>
      </button>
    </div>

    <!-- 没有选择监护人时的状态 -->
    <div v-if="!selectedParentId" class="report-list-section">
      <div class="section-header">
        <h4 class="list-title">
          <svg class="list-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3,13H15V11H3M3,6H21V8H3M3,18H21V20H3M19,13.67L20.5,15.17L17,18.67L13.5,15.17L15,13.67L17,15.67L19,13.67Z" />
          </svg>
          历史报告 <span class="badge-count">--</span>
        </h4>
      </div>
      <div class="report-list-container glass-panel">
        <div class="empty-report-list" :style="listDynamicStyle">
          <div class="empty-state glass-panel hologram-effect">
            <div class="empty-icon floating-icon-wrapper">
              <div class="ripple-ring"></div>
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
              </svg>
            </div>
            <h4>请先选择一位监护人</h4>
            <p>查看和生成健康报告</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="reports.length > 0" class="report-list-section">
      <div class="section-header">
        <h4 class="list-title">
          <svg class="list-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3,13H15V11H3M3,6H21V8H3M3,18H21V20H3M19,13.67L20.5,15.17L17,18.67L13.5,15.17L15,13.67L17,15.67L19,13.67Z" />
          </svg>
          历史报告 <span class="badge-count">{{ reports.length }}</span>
        </h4>
        <button class="refresh-btn" @click="fetchReports" :disabled="isLoading">
          <svg class="refresh-icon" :class="{'spinning': isLoading}" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
          </svg>
          刷新
        </button>
      </div>
      <div class="report-list-container glass-panel">
        <div class="report-list" :style="listDynamicStyle">
          <div
            v-for="(report, index) in reports"
            :key="report.id"
            class="report-item"
            :class="{ 'new': isNewReport(report.id) }"
            @mouseenter="hoveredReport = index"
            @mouseleave="hoveredReport = -1"
          >
            <div class="item-border-trace"></div>
            <div class="item-inner-bg"></div>

            <div class="report-main-content">
              <div class="report-left">
                <div class="report-header">
                  <div class="report-icon-wrapper">
                    <div class="icon-pulse"></div>
                    <svg class="report-icon" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,11L14,13L12,15L10,13L12,11Z" />
                    </svg>
                  </div>
                  <div class="report-info">
                    <div class="report-title">
                      <span class="report-id">报告 #{{ report.id }}</span>
                      <span class="report-status" :class="getReportStatusClass(report)">
                        <span class="status-dot"></span>
                        {{ getReportStatusText(report) }}
                      </span>
                    </div>
                    <div class="report-meta">
                      <span class="report-date">
                        <svg class="meta-icon" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                        </svg>
                        {{ formatDate(report.createTime) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="report-right">
                <div class="report-actions" :class="{ 'visible': hoveredReport === index }">
                  <button class="action-btn view-btn" style="transform: scale(0.8);" @click.stop="viewReport(report)">
                    <svg class="action-icon" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                    </svg>
                    <span>查看</span>
                  </button>
                  <button class="action-btn download-btn" style="transform: scale(0.8);" @click.stop="downloadReport(report)">
                    <svg class="action-icon" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                    </svg>
                    <span>下载</span>
                  </button>
                  <button class="action-btn delete-btn" style="transform: scale(0.8);" @click.stop="deleteReport(report.id)" :disabled="isDeleting">
                    <svg v-if="isDeleting" class="action-icon loading" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                    </svg>
                    <svg v-else class="action-icon" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                    <span>删除</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="selectedParentId && reports.length === 0 && !isLoading" class="empty-list-section">
      <div class="section-header">
        <h4 class="list-title">
          <svg class="list-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3,13H15V11H3M3,6H21V8H3M3,18H21V20H3M19,13.67L20.5,15.17L17,18.67L13.5,15.17L15,13.67L17,15.67L19,13.67Z" />
          </svg>
          历史报告 <span class="badge-count">0</span>
        </h4>
        <button class="refresh-btn" @click="fetchReports" :disabled="isLoading">
          <svg class="refresh-icon" :class="{'spinning': isLoading}" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
          </svg>
          刷新
        </button>
      </div>
      <div class="report-list-container glass-panel">
        <div class="empty-report-list" :style="listDynamicStyle">
          <div class="empty-state glass-panel hologram-effect">
            <div class="empty-icon floating-icon-wrapper">
              <div class="ripple-ring"></div>
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,5V19H5V5H19M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.89 20.1,3 19,3M17,12H12V17H10V12H7V10H10V5H12V10H17V12Z" />
              </svg>
            </div>
            <h4>暂无健康报告</h4>
            <p>点击上方按钮生成第一份健康报告</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state glass-panel hologram-effect">
      <div class="cyber-spinner">
        <div class="spinner-ring outer"></div>
        <div class="spinner-ring inner"></div>
        <div class="spinner-core"></div>
        <div class="scan-line"></div>
      </div>
      <p class="pulse-text">加载中...</p>
    </div>

    <Transition name="modal-bounce">
      <div v-if="showMessageModal" class="modal-overlay" @click.self="closeMessageModal">
        <div class="message-modal glass-modal" :class="messageModalType">
          <div class="modal-glow-border"></div>
          <div class="message-header">
            <svg class="message-icon" viewBox="0 0 24 24">
              <path v-if="messageModalType === 'success'" fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
              <path v-else fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
            </svg>
            <h3>{{ messageModalType === 'success' ? '操作成功' : '操作失败' }}</h3>
            <button class="close-modal-btn" @click="closeMessageModal">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>
            </button>
          </div>
          <div class="modal-content">
            <p class="message-text">{{ messageModalText }}</p>
          </div>
          <div class="modal-footer">
            <button class="footer-btn confirm-btn" @click="closeMessageModal">
              <span class="btn-content">{{ messageModalType === 'success' ? '确认同步' : '重启节点' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade-blur">
      <div v-if="showProgress && isGenerating" class="progress-overlay">
        <div class="progress-container glass-modal core-hologram">
          <div class="progress-header">
            <h5 class="cyber-title">生成中</h5>
            <div class="progress-right">
                <div class="radar-ping"></div>
                <span class="progress-percentage">{{ progressPercentage }}<small>%</small></span>
            </div>
          </div>
          <div class="progress-bar-wrapper">
            <div class="progress-bar-bg"></div>
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }">
              <div class="progress-glow"></div>
              <div class="progress-particles"></div>
            </div>
          </div>
          <div class="progress-text">
            {{ progressText }}
            <div class="progress-stats">
              <span class="stat-item cyber-tag">已处理: <strong>{{ receivedChars }}</strong>字符</span>
              <span class="stat-item cyber-tag highlight">状态: <strong>{{ progressStatus }}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import {
  getHealthReportList,
  generateHealthReport,
  saveHealthReport,
  getHealthReport,
  deleteHealthReport
} from '../api/healthReport';

const props = defineProps({
  selectedParentId: {
    type: [Number, String],
    required: true,
  },
  isMatrixExpanded: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['view-report']);

const reports = ref([]);
const isGenerating = ref(false);
const isLoading = ref(false);
const isDeleting = ref(false);
const hoveredReport = ref(-1);
const newlyGeneratedReports = ref(new Set());
const showMessageModal = ref(false);
const showProgress = ref(false);

const messageModalText = ref('');
const messageModalType = ref('');

const progressPercentage = ref(0);
const progressText = ref('（已修改）')
const progressStatus = ref('（已修改）');
const receivedChars = ref(0);

const selectedParentId = computed(() => props.selectedParentId);

const listDynamicStyle = computed(() => {
  const targetHeight = props.isMatrixExpanded ? '720px' : '250px';
  return {
    maxHeight: targetHeight,
    transition: 'max-height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
  };
});

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;

    if (date.getFullYear() === now.getFullYear()) {
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (e) {
    return dateString || '--';
  }
};

const isNewReport = (reportId) => {
  return newlyGeneratedReports.value.has(reportId);
};

const getReportStatusClass = (report) => {
  try {
    const createTime = new Date(report.createTime);
    const now = new Date();
    const diffDays = Math.floor((now - createTime) / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return 'status-new';
    if (diffDays < 7) return 'status-recent';
    return 'status-old';
  } catch (e) {
    return 'status-old';
  }
};

const getReportStatusText = (report) => {
  try {
    const createTime = new Date(report.createTime);
    const now = new Date();
    const diffMs = now - createTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return '刚生成';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    return `${diffDays}天前`;
  } catch (e) {
    return '--';
  }
};

const showMessage = (text, type = 'error') => {
  messageModalText.value = text;
  messageModalType.value = type;
  showMessageModal.value = true;
};

const fetchReports = async () => {
  if (!selectedParentId.value) return;
  isLoading.value = true;
  try {
    const response = await getHealthReportList(selectedParentId.value);
    if (response.code === 200) {
      const oldCount = reports.value.length;
      reports.value = response.data || [];
      reports.value.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
      const newCount = reports.value.length;
      if (newCount > oldCount) {
        showMessage(`刷新成功，新增 ${newCount - oldCount} 份报告`, 'success');
      } else if (newCount === oldCount && oldCount > 0) {
        showMessage('报告已是最新', 'success');
      }
    } else {
      throw new Error(response.message || '获取报告列表失败');
    }
  } catch (error) {
    showMessage(`获取报告列表失败: ${error.message || '网络错误'}`, 'error');
  } finally {
    isLoading.value = false;
  }
};

const generateReport = async () => {
  if (!selectedParentId.value || isGenerating.value) return;
  isGenerating.value = true;
  showProgress.value = true;
  progressPercentage.value = 0;
  progressText.value = '正在连接服务器...';
  progressStatus.value = '连接中...';
  receivedChars.value = 0;

  try {
    const { reader } = await generateHealthReport(selectedParentId.value);
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulatedReport = '';
    let streamClosed = false;

    progressPercentage.value = 10;
    progressText.value = '正在分析数据...';
    progressStatus.value = '分析中';

    const readStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            streamClosed = true;
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          receivedChars.value = accumulatedReport.length + buffer.length;

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            if (trimmedLine.startsWith('data:')) {
              const dataContent = trimmedLine.substring(5).trim();
              if (dataContent === '[DONE]') {
                progressPercentage.value = 95;
                progressText.value = '正在生成报告...';
                progressStatus.value = '生成中';
                continue;
              }
              if (dataContent) {
                try {
                  const parsedData = JSON.parse(dataContent);
                  if (parsedData.answer) accumulatedReport += parsedData.answer;
                  if (parsedData.done === true || parsedData.done === "true") {
                    progressPercentage.value = 95;
                    progressText.value = '正在保存到数据库...';
                    progressStatus.value = '写入中';
                  }
                  if (parsedData.error) throw new Error(parsedData.error);
                } catch (e) {
                  accumulatedReport += dataContent;
                }
              }
            } else {
              accumulatedReport += trimmedLine + '\n';
            }
          }
          const progress = Math.min(90, 10 + (accumulatedReport.length / 5000) * 80);
          progressPercentage.value = Math.floor(progress);
          progressText.value = `正在处理... (${accumulatedReport.length} 字符)`;
        }

        if (buffer.trim()) {
          accumulatedReport += buffer;
          buffer = '';
        }

        if (!accumulatedReport.trim()) throw new Error('生成内容为空');

        progressText.value = '正在保存...';
        progressStatus.value = '保存中';
        const saveResponse = await saveHealthReport(selectedParentId.value, accumulatedReport.trim());
        if (saveResponse.code === 1 || saveResponse.code === 200) {
          progressPercentage.value = 100;
          progressText.value = '报告生成完成！';
          progressStatus.value = '100%';

          if (saveResponse.data && saveResponse.data.id) {
            newlyGeneratedReports.value.add(saveResponse.data.id);
          }

          setTimeout(() => {
            showProgress.value = false;
            isGenerating.value = false;
            showMessage('生命体征特征图谱构建与校验成功！', 'success');
            fetchReports();
          }, 1200);
        } else {
          throw new Error(saveResponse.msg || saveResponse.message || '保存报告失败');
        }
      } catch (error) {
        throw error;
      }
    };

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        if (!streamClosed) reject(new Error('数据链路超时破裂（120秒保护）'));
      }, 120000);
    });

    await Promise.race([readStream(), timeoutPromise]);
  } catch (error) {
    let errorMessage = error.message || '生成失败';
    showProgress.value = false;
    isGenerating.value = false;
    showMessage(`生成失败: ${errorMessage}`, 'error');
  }
};

const viewReport = async (report) => {
  try {
    const response = await getHealthReport(report.id);
    if (response.code === 200) {
      emit('view-report', {
        id: report.id,
        report: response.data.report || '',
        createTime: response.data.createTime
      });
    } else {
      throw new Error(response.message || '获取报告失败');
    }
  } catch (error) {
    showMessage(`加载失败: ${error.message || '加载失败'}`, 'error');
  }
};

const downloadReport = async (report) => {
  try {
    let reportContent = report.report || '';
    // 如果本地没有内容，则从服务器获取完整报告
    if (!reportContent) {
      const response = await getHealthReport(report.id);
      if (response.code === 200) {
        reportContent = response.data.report || '';
      }
    }
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date(report.createTime).toISOString().split('T')[0];
    a.download = `Vital_Signs_Matrix_${report.id}_${date}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // 提取成功后不显示额外提示
  } catch (error) {
    showMessage('下载失败', 'error');
  }
};

const deleteReport = async (reportId) => {
  if (isDeleting.value) return;
  if (!confirm(`确定要删除报告 #${reportId} 吗？`)) return;
  isDeleting.value = true;
  try {
    const response = await deleteHealthReport(reportId);
    if (response.code === 200) {
      reports.value = reports.value.filter(r => r.id !== reportId);
      newlyGeneratedReports.value.delete(reportId);
      showMessage('删除成功', 'success');
    } else {
      throw new Error(response.message || '删除失败');
    }
  } catch (error) {
    showMessage(`删除失败: ${error.message || '删除失败'}`, 'error');
  } finally {
    isDeleting.value = false;
  }
};

const closeMessageModal = () => {
  showMessageModal.value = false;
  setTimeout(() => {
    messageModalText.value = '';
    messageModalType.value = '';
  }, 300);
};

watch(selectedParentId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    newlyGeneratedReports.value.clear();
    fetchReports();
  } else if (!newId) {
    reports.value = [];
  }
}, { immediate: true });

onMounted(() => {
  if (selectedParentId.value) fetchReports();
});
</script>

<style scoped>
/* =========== 核心环境配置 =========== */
.health-report-manager-wrapper {
  position: relative;
  border-radius: 30px;
  padding: 3px;
  background: transparent;
  overflow: hidden;
  min-height: 460px;
  perspective: 1000px;
  margin-bottom: 5px;
}

/* 终极环境光效 */
.ambient-aurora {
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(129, 199, 132, 0.15), rgba(86, 240, 136, 0.05), transparent 60%);
  animation: aurora-rotate 14s linear infinite;
  z-index: 0;
  pointer-events: none;
}
.ambient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  z-index: 0;
  pointer-events: none;
  animation: float-orb 21.45s ease-in-out infinite alternate;
}
.orb-1 { width: 300px; height: 300px; background: rgba(86, 240, 136, 0.2); top: -50px; left: -50px; }
.orb-2 { width: 400px; height: 400px; background: rgba(129, 199, 132, 0.15); bottom: -100px; right: -50px; animation-delay: -5s; }

.health-report-manager {
  position: relative;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(30px) saturate(150%);
  -webkit-backdrop-filter: blur(30px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 28px;
  padding: 16px;
  box-shadow:
    0 30px 60px rgba(0, 82, 204, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8),
    inset 0 20px 40px rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  gap: 14px;
  z-index: 1;
  height: 100%;
  transition: transform 0.3s ease;
}

.hologram-effect {
  position: relative;
  overflow: hidden;
}
.hologram-effect::before {
  content: '';
  position: absolute;
  top: -100%; left: 0; right: 0; height: 20%;
  background: linear-gradient(to bottom, transparent, rgba(129, 199, 132, 0.15), transparent);
  animation: scan-down 8.4s linear infinite;
  pointer-events: none;
  z-index: 10;
}

.header-section {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 24px; border-bottom: 1px solid rgba(86, 240, 136, 0.15);
  position: relative;
}

.title-container { display: flex; align-items: center; gap: 18px; }

.icon-halo {
  position: relative; width: 48px; height: 48px;
  background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(230,242,255,0.9));
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 20px rgba(86, 240, 136, 0.2), inset 0 2px 4px white;
}
.halo-ring {
  position: absolute; inset: -4px; border-radius: 18px;
  border: 2px solid transparent;
  background: linear-gradient(45deg, #56F088, #B4F0A6) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
  animation: spin 2.8s linear infinite;
  opacity: 0.6;
}
.title-icon { width: 26px; height: 26px; color: #56F088; filter: drop-shadow(0 2px 4px rgba(0,122,255,0.4)); }

.section-title {
  font-size: 24px; font-weight: 800; margin: 0;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  letter-spacing: 1.5px; text-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.generate-btn {
  position: relative; padding: 0; border: none; background: transparent; cursor: pointer;
  border-radius: 50px; outline: none;
  transform: translateZ(0);
}
.btn-glow-wrap {
  position: absolute; inset: -2px; border-radius: 50px;
  background: conic-gradient(from 0deg, transparent 0%, rgba(129, 199, 132, 0.2) 25%, #56F088 50%, rgba(129, 199, 132, 0.2) 75%, transparent 100%);
  animation: spin 4.29s linear infinite;
  z-index: -1; opacity: 0; transition: opacity 0.3s;
}
.generate-btn:hover:not(:disabled) .btn-glow-wrap { opacity: 1; filter: blur(4px); }

.btn-content {
  position: relative; display: flex; align-items: center; gap: 10px;
  background: linear-gradient(135deg, #99F056, #7AD64B);
  color: #1a3d1a; padding: 6px 10px; border-radius: 50px;
  font-size: 11px; font-weight: 700; letter-spacing: 1px;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.4), 0 8px 20px rgba(153, 240, 86, 0.4);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}
.btn-content::after {
  content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transform: skewX(-20deg); animation: button-scan 2.1s infinite 2s;
}

.generate-btn:hover:not(:disabled) .btn-content {
  transform: translateY(-2px); box-shadow: inset 0 2px 4px rgba(255,255,255,0.6), 0 12px 30px rgba(153, 240, 86, 0.6);
}
.generate-btn:active:not(:disabled) .btn-content { transform: translateY(1px) scale(0.98); }

.generate-btn:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(50%); }
.is-generating .btn-content { background: linear-gradient(135deg, #7AD64B, #5FB839); }
.loading-icon { animation: spin 0.7s linear infinite, glow-pulse 1.4s infinite; width: 14px; height: 14px; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.list-title { font-size: 14.4px; font-weight: 800; color: #1a2a3a; margin: 0; display: flex; align-items: center; gap: 10px; }
.list-icon { width: 24px; height: 24px; color: #56F088; filter: drop-shadow(0 2px 6px rgba(0,122,255,0.4)); }
.badge-count { background: #56F088; color: white; font-size: 12px; padding: 2px 8px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,122,255,0.3); }

.refresh-btn {
  background: rgba(255, 255, 255, 0.7); color: #56F088;
  border: 1px solid rgba(86, 240, 136, 0.3); border-radius: 20px;
  padding: 4.8px 14.4px; font-size: 10.08px; font-weight: 700; cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex; align-items: center; gap: 5.76px;
  backdrop-filter: blur(10px); box-shadow: 0 4px 12px rgba(86, 240, 136, 0.05);
}
.refresh-btn:hover:not(:disabled) {
  background: #56F088; color: white; transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(86, 240, 136, 0.3); border-color: #56F088;
}
.refresh-icon.spinning { animation: spin 0.7s cubic-bezier(0.5, 0, 0.5, 1) infinite; }

.report-list-container {
  background: rgba(255, 255, 255, 0.4); border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.6); padding: 30px;
  box-shadow: inset 0 4px 20px rgba(0,0,0,0.02);
  margin-top: -19px;
}
.empty-report-list {
  display: flex; flex-direction: column; gap: 10px; max-height: 225px; overflow-y: auto; padding-right: 12px;
  min-height: 100px;
}
.empty-report-list::-webkit-scrollbar { width: 0; }

.empty-list-section {
  display: flex;
  flex-direction: column;
}

.empty-report-list .empty-state {
  text-align: center; padding: 200px 20px; background: rgba(255, 255, 255, 0.4);
  border-radius: 20px; border: 1px dashed rgba(86, 240, 136, 0.3);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.report-list {
  display: flex; flex-direction: column; gap: 0; max-height: 270px; overflow-y: auto; padding-right: 12px;
}
.report-list::-webkit-scrollbar { width: 0; }

.report-item {
  position: relative; border-radius: 20px; padding: 2px;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer; z-index: 1; transform-style: preserve-3d;
  margin-bottom: 5px;
}
.report-item:last-child {
  margin-bottom: 0;
}

.item-border-trace {
  position: absolute; inset: 0; border-radius: 20px; overflow: hidden; z-index: -2;
  opacity: 0; transition: opacity 0.3s;
}
.item-border-trace::before {
  content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: conic-gradient(transparent, transparent, transparent, #B4F0A6, #56F088, transparent);
  animation: spin 4.29s linear infinite;
}
.report-item:hover .item-border-trace { opacity: 0; }

.item-inner-bg {
  position: absolute; inset: 2px; border-radius: 18px;
  background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); z-index: -1;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02); transition: background 0.3s;
}
.report-item:hover .item-inner-bg { background: rgba(255, 255, 255, 0.95); }
.report-item:hover { transform: translateY(-4px) scale(1.01); box-shadow: 0 20px 40px rgba(86, 240, 136, 0.12); }

.report-item.new .item-inner-bg {
  background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(235, 255, 240, 0.95));
}
.report-item.new .item-border-trace::before { background: conic-gradient(transparent, transparent, transparent, #2ecc71, #27ae60, transparent); }

.report-main-content { display: flex; justify-content: space-between; align-items: flex-end; padding: 12px 5px; width: 100%; min-width: 0; overflow: hidden; }

.report-left { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }

.report-right { display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-start; gap: 8px; flex-shrink: 0; }

.report-header { display: flex; align-items: center; }

.report-icon-wrapper {
  position: relative; width: 52px; height: 52px;
  background: linear-gradient(135deg, #f0f7ff, #e0efff); border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 2px 4px white, 0 8px 16px rgba(0,122,255,0.1);
}
.icon-pulse {
  position: absolute; inset: 0; border-radius: 16px; border: 2px solid #B4F0A6;
  opacity: 0; transform: scale(1); transition: all 0.4s;
}
.report-item:hover .icon-pulse { animation: pulse-out 2.1s infinite; }
.report-icon { width: 26px; height: 26px; color: #56F088; z-index: 2; }

.report-info { margin-left: 16px; min-width: 0; display: flex; flex-direction: column; gap: 4px; width: 100%; }
.report-title { display: flex; align-items: center; gap: 4px; margin-bottom: 0px; flex-wrap: nowrap; white-space: nowrap; flex-shrink: 0; }
.report-id { font-weight: 800; color: #1a2a3a; font-size: 12px; }

.report-status {
  font-size: 9px; font-weight: 800; padding: 4px 5px; border-radius: 12px;
  display: flex; align-items: center; gap: 6px; letter-spacing: 0.5px;
  margin-left: 0px; flex-shrink: 0;
}
.status-dot { width: 6px; height: 6px; border-radius: 50%; }
.status-new { background: #e8f5e9; color: #27ae60; box-shadow: 0 2px 8px rgba(46,204,113,0.2); }
.status-new .status-dot { background: #27ae60; box-shadow: 0 0 8px #27ae60; animation: blink 0.7s infinite; }
.status-recent { background: #fff8e1; color: #f39c12; }
.status-recent .status-dot { background: #f39c12; }
.status-old { background: #f1f3f5; color: #7f8c8d; }
.status-old .status-dot { background: #95a5a6; }

.report-meta { color: #64748b; font-size: 10px; font-weight: 600; display: flex; align-items: center; margin-right: 30px; margin-top: 0px; }
.meta-icon { width: 16px; height: 16px; margin-right: 4px; }

.report-actions {
  display: flex; gap: 6px; opacity: 0; transform: translateX(13px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-top: 0px;
  margin-right: -40px;
}
.report-actions.visible { opacity: 1; transform: translateX(-54px) translateY(-10px); }

.action-btn {
  padding: 8px 13px; border: none; border-radius: 12px; font-size: 11px; font-weight: 800;
  cursor: pointer; display: flex; align-items: center; gap: 8px; position: relative; overflow: hidden;
}
.action-btn::after {
  content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transform: translateX(-100%) skewX(-15deg); transition: transform 0.5s ease;
}
.action-btn:hover::after { transform: translateX(100%) skewX(-15deg); }

.view-btn { background: rgba(86, 240, 136, 0.1); color: #56F088; box-shadow: inset 0 0 0 1px rgba(0,122,255,0.2); }
.view-btn:hover { background: #56F088; color: white; box-shadow: 0 8px 20px rgba(0,122,255,0.3); transform: translateY(-2px); }

.download-btn { background: rgba(46, 204, 113, 0.1); color: #27ae60; box-shadow: inset 0 0 0 1px rgba(46,204,113,0.2); }
.download-btn:hover { background: #27ae60; color: white; box-shadow: 0 8px 20px rgba(46,204,113,0.3); transform: translateY(-2px); }

.delete-btn { background: rgba(231, 76, 60, 0.1); color: #e74c3c; box-shadow: inset 0 0 0 1px rgba(231,76,60,0.2); }
.delete-btn:hover:not(:disabled) { background: #e74c3c; color: white; box-shadow: 0 8px 20px rgba(231,76,60,0.3); transform: translateY(-2px); }

.no-selection-prompt, .empty-state, .loading-state {
  text-align: center; padding: 80px 20px; background: rgba(255, 255, 255, 0.4);
  border-radius: 24px; border: 1px dashed rgba(86, 240, 136, 0.3);
}
.floating-icon-wrapper { position: relative; width: 90px; height: 90px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
.ripple-ring { position: absolute; inset: 0; background: rgba(0,122,255,0.1); border-radius: 50%; animation: ripple 1.4s infinite; }
.prompt-icon, .empty-icon svg { width: 48px; height: 48px; color: #56F088; animation: float 5.6s ease-in-out infinite; z-index: 1; filter: drop-shadow(0 4px 10px rgba(0,122,255,0.3)); }

.glitch-text { font-size: 16px; font-weight: 600; color: #4a5568; letter-spacing: 1px; }

.cyber-spinner { position: relative; width: 80px; height: 80px; margin: 0 auto 30px; }
.spinner-ring { position: absolute; inset: 0; border-radius: 50%; border: 3px solid transparent; }
.spinner-ring.outer { border-top-color: #B4F0A6; border-bottom-color: #56F088; animation: spin 2.1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite; }
.spinner-ring.inner { inset: 10px; border-left-color: #ff00cc; border-right-color: #B4F0A6; animation: spin 0.7s linear infinite reverse; }
.spinner-core { position: absolute; inset: 24px; background: linear-gradient(135deg, #56F088, #B4F0A6); border-radius: 50%; animation: pulse-glow 1.4s alternate infinite; box-shadow: 0 0 20px rgba(129, 199, 132, 0.6); }

.modal-overlay, .progress-overlay {
  position: fixed; inset: 0;
  background: rgba(20, 50, 30, 0.15);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.glass-modal {
  background: rgba(255, 255, 255, 1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(167, 243, 208, 0.5);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(16, 80, 40, 0.15);
}

/* 消息弹窗样式 */
.message-modal {
  width: 90%;
  max-width: 420px;
  padding: 32px;
  position: relative;
  overflow: hidden;
  background: #ffffff;
  border-radius: 20px;
}

.message-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #B4F0A6, #56F088);
}

.message-modal.error::before {
  background: linear-gradient(90deg, #ff0055, #ff4b2b);
}

.modal-glow-border {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(129, 199, 132, 0.2);
  border-radius: 28px;
  pointer-events: none;
}

.message-modal.error .modal-glow-border {
  border-color: rgba(255, 0, 85, 0.2);
}

.message-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.message-icon {
  width: 40px;
  height: 40px;
  padding: 8px;
  background: linear-gradient(135deg, #56F088, #B4F0A6);
  border-radius: 12px;
  color: white;
}

.message-modal.error .message-icon {
  background: linear-gradient(135deg, #ff0055, #ff4b2b);
}

.message-header h3 {
  flex: 1;
  font-size: 20px;
  font-weight: 900;
  color: #1e293b;
  margin: 0;
  letter-spacing: 1px;
}

.close-modal-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-modal-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.close-modal-btn svg {
  width: 18px;
  height: 18px;
  color: #64748b;
}

.modal-content {
  text-align: center;
  margin-bottom: 32px;
}

.message-text {
  font-size: 16px;
  color: #475569;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  justify-content: center;
}

.footer-btn {
  padding: 14px 40px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #56F088, #B4F0A6);
  color: white;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(86, 240, 136, 0.3);
}

.footer-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(86, 240, 136, 0.4);
}

.footer-btn.confirm-btn {
  background: linear-gradient(135deg, #56F088, #B4F0A6);
}

.message-modal.error .footer-btn {
  background: linear-gradient(135deg, #ff0055, #ff4b2b);
  box-shadow: 0 4px 15px rgba(255, 0, 85, 0.3);
}

.message-modal.error .footer-btn:hover {
  box-shadow: 0 6px 20px rgba(255, 0, 85, 0.4);
}

.core-hologram { position: relative; overflow: hidden; width: 90%; max-width: 580px; padding: 48px; }
.core-hologram::before {
  content: ''; position: absolute; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(129, 199, 132, 0.03) 2px, rgba(129, 199, 132, 0.03) 4px);
  pointer-events: none;
}

.progress-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; position: relative; z-index: 1; }
.cyber-title { font-size: 24px; font-weight: 900; margin: 0; background: linear-gradient(135deg, #56F088, #B4F0A6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.progress-right { display: flex; align-items: center; gap: 12px; }
.radar-ping { width: 12px; height: 12px; border-radius: 50%; background: #B4F0A6; box-shadow: 0 0 10px #B4F0A6; animation: blink 0.7s infinite; }
.progress-percentage { font-size: 42px; font-weight: 900; color: #56F088; text-shadow: 0 4px 10px rgba(0,122,255,0.2); line-height: 1; }

.progress-bar-wrapper {
  position: relative; height: 18px; border-radius: 20px; margin: 0 0 24px;
  background: #e2e8f0; box-shadow: inset 0 2px 6px rgba(0,0,0,0.1); overflow: hidden;
}
.progress-fill {
  position: absolute; left: 0; top: 0; height: 100%;
  background: linear-gradient(90deg, #56F088, #B4F0A6, #56F088); background-size: 200% 100%;
  border-radius: 20px; transition: width 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  animation: gradient-shift 2.8s linear infinite;
}
.progress-particles {
  position: absolute; inset: 0; background-image: radial-gradient(circle, white 1px, transparent 1px);
  background-size: 10px 10px; animation: move-bg 1.4s linear infinite; opacity: 0.3;
}

.progress-text { text-align: center; font-size: 16px; font-weight: 700; color: #334155; position: relative; z-index: 1; }
.progress-stats { display: flex; justify-content: center; gap: 20px; margin-top: 20px; }
.cyber-tag { background: rgba(0,122,255,0.1); color: #56F088; padding: 8px 16px; border-radius: 10px; font-size: 14px; box-shadow: inset 0 0 0 1px rgba(0,122,255,0.2); }
.cyber-tag.highlight { background: rgba(129, 199, 132, 0.1); color: #2D572D; border: 1px solid rgba(0,210,255,0.3); }

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
@keyframes float-orb { 0% { transform: translate(0, 0); } 100% { transform: translate(30px, 40px); } }
@keyframes aurora-rotate { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.1); } 100% { transform: rotate(360deg) scale(1); } }
@keyframes scan-down { 0% { top: -20%; } 100% { top: 120%; } }
@keyframes ripple { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
@keyframes pulse-out { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }
@keyframes glow-pulse { 0%, 100% { filter: drop-shadow(0 0 4px #fff); } 50% { filter: drop-shadow(0 0 12px #fff); } }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
@keyframes gradient-shift { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
@keyframes move-bg { 0% { background-position: 0 0; } 100% { background-position: 10px 0; } }
@keyframes button-scan { 0% { left: -100%; } 100% { left: 200%; } }

.modal-bounce-enter-active { animation: bounce-in 0.84s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-bounce-leave-active { animation: bounce-in 0.3s reverse; }
@keyframes bounce-in { 0% { transform: scale(0.8) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
.fade-blur-enter-active, .fade-blur-leave-active { transition: all 0.4s ease; }
.fade-blur-enter-from, .fade-blur-leave-to { opacity: 0; backdrop-filter: blur(0px); }

@media (max-width: 768px) {
  .health-report-manager { padding: 20px; }
  .header-section { flex-direction: column; gap: 20px; align-items: stretch; }
  .generate-btn { width: 100%; justify-content: center; }
  .report-main-content { flex-direction: column; align-items: flex-start; }
  .report-actions { width: 100%; justify-content: flex-end; opacity: 1; transform: none; margin-top: 15px; }
  .action-btn span { display: none; }
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
  padding: 3px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 8px;
  color: #00e5ff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(0, 229, 255, 0.2);
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  color: #00e5ff;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  letter-spacing: 2px;
}
</style>