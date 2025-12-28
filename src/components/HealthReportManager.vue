<template>
<div class="health-report-manager">
  <!-- 顶部标题和生成按钮 -->
  <div class="header-section">
    <div class="title-container">
      <svg class="title-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M7,7H17V9H7V7M7,11H17V13H7V11M7,15H13V17H7V15Z" />
      </svg>
      <h3 class="section-title">健康报告管理</h3>
    </div>
    <button
      class="generate-btn"
      @click="generateReport"
      :disabled="isGenerating || !selectedParentId"
    >
      <svg v-if="isGenerating" class="loading-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
      </svg>
      <svg v-else class="generate-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M14,12L10,8V11H2V13H10V16M20,18H4V8H16V10H18V6A2,2 0 0,0 16,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V12H20V18Z" />
      </svg>
      {{ isGenerating ? '生成中...' : '生成健康报告' }}
    </button>
  </div>
  
  <!-- 状态提示 -->
  <div v-if="!selectedParentId" class="no-selection-prompt">
    <svg class="prompt-icon" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
    </svg>
    <p>请先选择一位父母以查看和生成健康报告</p>
  </div>

  <!-- 报告列表区域 -->
  <div v-else-if="reports.length > 0" class="report-list-section">
    <div class="section-header">
      <h4 class="list-title">
        <svg class="list-icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M3,13H15V11H3M3,6H21V8H3M3,18H21V20H3M19,13.67L20.5,15.17L17,18.67L13.5,15.17L15,13.67L17,15.67L19,13.67Z" />
        </svg>
        历史报告 ({{ reports.length }})
      </h4>
      <button class="refresh-btn" @click="fetchReports" :disabled="isLoading">
        <svg class="refresh-icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
        </svg>
        刷新
      </button>
    </div>
    <div class="report-list-container">
      <div class="report-list">
        <div
          v-for="(report, index) in reports"
          :key="report.id"
          class="report-item"
          :class="{ 'new': isNewReport(report.id) }"
          @mouseenter="hoveredReport = index"
          @mouseleave="hoveredReport = -1"
        >
          <div class="report-main-content">
            <div class="report-header">
              <div class="report-icon-wrapper">
                <svg class="report-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,11L14,13L12,15L10,13L12,11Z" />
                </svg>
              </div>
              <div class="report-info">
                <div class="report-title">
                  <span class="report-id">报告 #{{ report.id }}</span>
                  <span class="report-status" :class="getReportStatusClass(report)">
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
            <div class="report-actions" :class="{ 'visible': hoveredReport === index }">
              <button class="action-btn view-btn" @click.stop="viewReport(report)">
                <svg class="action-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                </svg>
                <span class="action-text">查看</span>
              </button>
              <button class="action-btn download-btn" @click.stop="downloadReport(report)">
                <svg class="action-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                </svg>
                <span class="action-text">下载</span>
              </button>
              <button class="action-btn delete-btn" @click.stop="deleteReport(report.id)" :disabled="isDeleting">
                <svg v-if="isDeleting" class="action-icon loading" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                </svg>
                <svg v-else class="action-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                </svg>
                <span class="action-text">删除</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 空状态 -->
  <div v-else-if="selectedParentId && reports.length === 0 && !isLoading" class="empty-state">
    <div class="empty-icon">
      <svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M19,5V19H5V5H19M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.89 20.1,3 19,3M17,12H12V17H10V12H7V10H10V5H12V10H17V12Z" />
      </svg>
    </div>
    <h4>暂无健康报告</h4>
    <p>点击上方按钮生成第一份健康报告</p>
  </div>

  <!-- 加载状态 -->
  <div v-if="isLoading" class="loading-state">
    <div class="loading-spinner">
      <div class="spinner-circle"></div>
    </div>
    <p>加载报告中...</p>
  </div>

  <!-- 消息提示模态框 -->
  <Transition name="modal">
    <div v-if="showMessageModal" class="modal-overlay" @click.self="closeMessageModal">
      <div class="message-modal" :class="messageModalType">
        <div class="message-header">
          <svg class="message-icon" viewBox="0 0 24 24">
            <path v-if="messageModalType === 'success'" fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
            <path v-else fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
          </svg>
          <h3>{{ messageModalType === 'success' ? '操作成功' : '操作失败' }}</h3>
          <button class="close-modal-btn" @click="closeMessageModal">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <p class="message-text">{{ messageModalText }}</p>
        </div>
        <div class="modal-footer">
          <button class="footer-btn confirm-btn" @click="closeMessageModal">
            {{ messageModalType === 'success' ? '好的' : '重试' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 生成报告进度条 -->
  <Transition name="slide">
    <div v-if="showProgress && isGenerating" class="progress-overlay">
      <div class="progress-container">
        <div class="progress-header">
          <h5>正在生成健康报告</h5>
          <span class="progress-percentage">{{ progressPercentage }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="progress-text">
          {{ progressText }}
          <div class="progress-stats">
            <span class="stat-item">已接收: {{ receivedChars }}字</span>
            <span class="stat-item">状态: {{ progressStatus }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
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

// 定义 props
const props = defineProps({
  selectedParentId: {
    type: [Number, String],
    required: true,
  }
});

// 定义 emit
const emit = defineEmits(['view-report']);

// 响应式数据
const reports = ref([]);
const isGenerating = ref(false);
const isLoading = ref(false);
const isDeleting = ref(false);
const hoveredReport = ref(-1);
const newlyGeneratedReports = ref(new Set());
const showMessageModal = ref(false);
const showProgress = ref(false);

// 消息模态框相关
const messageModalText = ref('');
const messageModalType = ref('');

// 进度相关
const progressPercentage = ref(0);
const progressText = ref('正在初始化...');
const progressStatus = ref('等待中');
const receivedChars = ref(0);

// 计算属性
const selectedParentId = computed(() => props.selectedParentId);

// 方法
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // 1分钟内显示"刚刚"
    if (diffMinutes < 1) {
      return '刚刚';
    }
    // 1小时内显示分钟
    if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`;
    }
    // 24小时内显示小时
    if (diffHours < 24) {
      return `${diffHours}小时前`;
    }
    // 超过24小时显示具体日期和时间
    const options = {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    // 如果是今年，不显示年份
    if (date.getFullYear() === now.getFullYear()) {
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    // 不同年份显示完整日期
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (e) {
    console.error('日期格式化错误:', e);
    return dateString || '未知时间';
  }
};

const isNewReport = (reportId) => {
  return newlyGeneratedReports.value.has(reportId);
};

const getReportStatusClass = (report) => {
  try {
    const createTime = new Date(report.createTime);
    const now = new Date();
    const diffMs = now - createTime;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
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
    
    if (diffMinutes < 1) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    return `${diffDays}天前`;
  } catch (e) {
    return '未知时间';
  }
};

// 显示消息
const showMessage = (text, type = 'error') => {
  messageModalText.value = text;
  messageModalType.value = type;
  showMessageModal.value = true;
};

// 获取报告列表
const fetchReports = async () => {
  if (!selectedParentId.value) return;
  isLoading.value = true;
  try {
    const response = await getHealthReportList(selectedParentId.value);
    if (response.code === 200) {
      reports.value = response.data || [];
      reports.value.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
      console.log(`获取到 ${reports.value.length} 个报告`);
    } else {
      throw new Error(response.message || '获取报告列表失败');
    }
  } catch (error) {
    console.error('获取报告列表错误:', error);
    showMessage(`获取报告列表失败: ${error.message || '未知错误'}`, 'error');
  } finally {
    isLoading.value = false;
  }
};

// 生成报告
const generateReport = async () => {
  if (!selectedParentId.value || isGenerating.value) return;
  isGenerating.value = true;
  showProgress.value = true;
  progressPercentage.value = 0;
  progressText.value = '正在连接服务器...';
  progressStatus.value = '连接中';
  receivedChars.value = 0;
  
  try {
    console.log('开始生成报告，用户ID:', selectedParentId.value);
    // 步骤1: 生成报告流
    const { reader } = await generateHealthReport(selectedParentId.value);
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulatedReport = '';
    let streamClosed = false;
    
    // 更新进度
    progressPercentage.value = 10;
    progressText.value = '正在生成报告内容...';
    progressStatus.value = '生成中';
    
    // 改进的流读取逻辑
    const readStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('流读取完成，总共接收字符数:', accumulatedReport.length);
            streamClosed = true;
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          receivedChars.value = accumulatedReport.length + buffer.length;
          
          // 尝试多种方式解析数据
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            // 处理 SSE 格式数据
            if (trimmedLine.startsWith('data:')) {
              const dataContent = trimmedLine.substring(5).trim();
              if (dataContent === '[DONE]') {
                console.log('收到完成信号 [DONE]');
                progressPercentage.value = 95;
                progressText.value = '正在保存报告...';
                progressStatus.value = '完成中';
                continue;
              }
              if (dataContent) {
                try {
                  // 尝试解析为 JSON
                  const parsedData = JSON.parse(dataContent);
                  if (parsedData.answer) {
                    accumulatedReport += parsedData.answer;
                  }
                  if (parsedData.done === true || parsedData.done === "true") {
                    console.log('JSON完成信号');
                    progressPercentage.value = 95;
                    progressText.value = '正在保存报告...';
                    progressStatus.value = '完成中';
                  }
                  if (parsedData.error) {
                    throw new Error(parsedData.error);
                  }
                } catch (e) {
                  // 如果不是JSON，可能是直接的文本内容
                  accumulatedReport += dataContent;
                }
              }
            } else {
              // 如果不是 SSE 格式，直接作为内容处理
              accumulatedReport += trimmedLine + '\n';
            }
          }
          
          // 更新进度（基于已接收内容）
          const progress = Math.min(90, 10 + (accumulatedReport.length / 5000) * 80);
          progressPercentage.value = Math.floor(progress);
          progressText.value = `正在生成报告内容... (${accumulatedReport.length}字)`;
        }
        
        // 处理剩余的 buffer
        if (buffer.trim()) {
          accumulatedReport += buffer;
          buffer = '';
        }
        
        console.log('最终生成内容长度:', accumulatedReport.length);
        
        // 检查内容是否有效
        if (!accumulatedReport.trim()) {
          throw new Error('生成的报告内容为空');
        }
        
        // 步骤2: 保存报告
        progressText.value = '正在保存报告到数据库...';
        progressStatus.value = '保存中';
        const saveResponse = await saveHealthReport(selectedParentId.value, accumulatedReport.trim());
        if (saveResponse.code === 200) {
          progressPercentage.value = 100;
          progressText.value = '报告生成完成！';
          progressStatus.value = '完成';
          
          // 标记为新报告
          if (saveResponse.data && saveResponse.data.id) {
            newlyGeneratedReports.value.add(saveResponse.data.id);
          }
          
          // 延迟显示成功消息
          setTimeout(() => {
            showProgress.value = false;
            isGenerating.value = false;
            showMessage('健康报告生成并保存成功！', 'success');
            fetchReports(); // 刷新列表
          }, 1000);
        } else {
          throw new Error(saveResponse.message || '保存报告失败');
        }
      } catch (error) {
        console.error('流读取错误:', error);
        throw error;
      }
    };
    
    // 设置超时保护
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        if (!streamClosed) {
          reject(new Error('报告生成超时（120秒）'));
        }
      }, 120000); // 120秒超时
    });
    
    await Promise.race([readStream(), timeoutPromise]);
  } catch (error) {
    console.error('生成报告错误详情:', error);
    let errorMessage = error.message || '未知错误';
    showProgress.value = false;
    isGenerating.value = false;
    showMessage(`生成报告失败: ${errorMessage}`, 'error');
  }
};

// 查看报告 - 修改为触发事件
const viewReport = async (report) => {
  try {
    const response = await getHealthReport(report.id);
    if (response.code === 200) {
      // 触发事件，传递完整的报告数据
      emit('view-report', {
        id: report.id,
        report: response.data.report || '',
        createTime: response.data.createTime
      });
    } else {
      throw new Error(response.message || '获取报告失败');
    }
  } catch (error) {
    console.error('查看报告错误:', error);
    showMessage(`获取报告失败: ${error.message || '未知错误'}`, 'error');
  }
};

// 下载报告
const downloadReport = (report) => {
  try {
    const reportContent = report.report || '';
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date(report.createTime).toISOString().split('T')[0];
    a.download = `健康报告_${report.id}_${date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage('报告下载开始', 'success');
  } catch (error) {
    console.error('下载报告错误:', error);
    showMessage('下载报告失败', 'error');
  }
};

// 删除报告
const deleteReport = async (reportId) => {
  if (isDeleting.value) return;
  if (!confirm(`确定要删除报告 #${reportId} 吗？此操作不可撤销。`)) return;
  isDeleting.value = true;
  try {
    const response = await deleteHealthReport(reportId);
    if (response.code === 200) {
      // 从本地列表中移除
      reports.value = reports.value.filter(r => r.id !== reportId);
      newlyGeneratedReports.value.delete(reportId);
      showMessage('报告删除成功', 'success');
    } else {
      throw new Error(response.message || '删除报告失败');
    }
  } catch (error) {
    console.error('删除报告错误:', error);
    showMessage(`删除报告失败: ${error.message || '未知错误'}`, 'error');
  } finally {
    isDeleting.value = false;
  }
};

// 关闭消息提示模态框
const closeMessageModal = () => {
  showMessageModal.value = false;
  setTimeout(() => {
    messageModalText.value = '';
    messageModalType.value = '';
  }, 300);
};

// 监听 selectedParentId 变化
watch(selectedParentId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    newlyGeneratedReports.value.clear();
    fetchReports();
  } else if (!newId) {
    reports.value = [];
  }
}, { immediate: true });

// 组件挂载时获取报告列表
onMounted(() => {
  if (selectedParentId.value) {
    fetchReports();
  }
});
</script>

<style scoped>
.health-report-manager {
  background: linear-gradient(135deg, #f8fafc 0%, #e6f2ff 100%);
  border-radius: 24px;
  padding: 24px;
  box-shadow:
    0 4px 20px rgba(0, 82, 204, 0.1),
    0 8px 40px rgba(0, 82, 204, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  border: 1px solid rgba(0, 122, 255, 0.1);
  backdrop-filter: blur(10px);
  height: 3.665rem;
}

/* 头部区域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(0, 122, 255, 0.1);
}

.title-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 28px;
  height: 28px;
  color: #007AFF;
  filter: drop-shadow(0 2px 4px rgba(0, 122, 255, 0.3));
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #007AFF 0%, #0056cc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.generate-btn {
  background: rgb(49, 139, 255);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 28px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow:
    0 4px 15px rgba(0, 122, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.generate-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow:
    0 8px 25px rgba(0, 122, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.generate-btn:hover::before {
  left: 100%;
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.generate-icon, .loading-icon {
  width: 18px;
  height: 18px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 未选择提示 */
.no-selection-prompt {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 247, 255, 0.9));
  border-radius: 16px;
  border: 2px dashed rgba(0, 122, 255, 0.2);
}

.prompt-icon {
  width: 60px;
  height: 60px;
  color: rgba(0, 122, 255, 0.4);
  margin: 0 auto 16px;
}

.no-selection-prompt p {
  color: #7f8c8d;
  font-size: 15px;
  margin: 0;
}

/* 报告列表区域 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-title {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.list-icon {
  width: 20px;
  height: 20px;
  color: #007AFF;
}

.refresh-btn {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.15);
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  width: 14px;
  height: 14px;
}

/* 报告列表容器 */
.report-list-container {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 122, 255, 0.08);
}

.report-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.report-list::-webkit-scrollbar {
  width: 6px;
}

.report-list::-webkit-scrollbar-track {
  background: rgba(0, 122, 255, 0.05);
  border-radius: 10px;
}

.report-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #007AFF, #0056cc);
  border-radius: 10px;
}

/* 报告项 - 修复堆叠问题 */
.report-item {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(0, 122, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.report-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #007AFF, #0056cc);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.report-item:hover {
  transform: translateX(4px);
  box-shadow:
    0 4px 20px rgba(0, 122, 255, 0.15),
    0 8px 30px rgba(0, 122, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.3);
}

.report-item:hover::before {
  opacity: 1;
}

.report-item.new {
  border-color: rgba(76, 217, 100, 0.3);
  background: linear-gradient(135deg, #ffffff 0%, #f0fff4 100%);
}

.report-item.new::before {
  background: linear-gradient(180deg, #4cd964, #2ecc71);
}

.report-main-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 16px;
}

.report-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
}

.report-icon-wrapper {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #e6f2ff 0%, #d1e7ff 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 122, 255, 0.1);
  flex-shrink: 0;
}

.report-icon {
  width: 20px;
  height: 20px;
  color: #007AFF;
}

.report-info {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
  overflow: hidden;
}

.report-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  flex-wrap: wrap;
  gap: 8px;
}

.report-id {
  font-weight: 700;
  color: #2c3e50;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.report-status {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.status-new {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2ecc71;
}

.status-recent {
  background: linear-gradient(135deg, #fff3e0 0%, #ffecb3 100%);
  color: #f39c12;
}

.status-old {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  color: #95a5a6;
}

.report-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #7f8c8d;
  flex-wrap: wrap;
}

.report-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.meta-icon {
  width: 12px;
  height: 12px;
  opacity: 0.7;
  flex-shrink: 0;
}

/* 报告操作按钮 - 修复堆叠问题 */
.report-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.report-actions.visible {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 70px;
  justify-content: center;
  height: 36px;
}

.view-btn {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
}

.view-btn:hover {
  background: linear-gradient(135deg, #bbdefb 0%, #90caf9 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.download-btn {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #388e3c;
}

.download-btn:hover {
  background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(56, 142, 60, 0.2);
}

.delete-btn {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #f44336;
}

.delete-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.2);
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.action-icon.loading {
  animation: spin 1s linear infinite;
}

.action-text {
  white-space: nowrap;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 247, 255, 0.9));
  border-radius: 16px;
  border: 2px dashed rgba(0, 122, 255, 0.2);
  height: 2.7rem;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  color: rgba(0, 122, 255, 0.3);
}

.empty-state h4 {
  font-size: 18px;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 16px;
  position: relative;
}

.spinner-circle {
  width: 100%;
  height: 100%;
  border: 3px solid rgba(0, 122, 255, 0.1);
  border-top-color: #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-state p {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
}

/* 模态框样式 - 共用部分 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.message-modal {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.25),
    0 8px 32px rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  animation: modal-pop 0.3s ease-out;
}

.message-modal.success {
  border-top: 4px solid #4cd964;
}

.message-modal.error {
  border-top: 4px solid #ff6b6b;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e6f2ff 100%);
}

.message-icon {
  width: 24px;
  height: 24px;
}

.message-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  flex: 1;
  text-align: center;
}

.message-text {
  font-size: 15px;
  color: #2c3e50;
  line-height: 1.5;
  text-align: center;
  padding: 24px;
  margin: 0;
  white-space: pre-line;
}

.modal-footer {
  display: flex;
  justify-content: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e6f2ff 100%);
}

.footer-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-btn {
  background: linear-gradient(135deg, #007AFF 0%, #0056cc 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.4);
}

.close-modal-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-modal-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.close-modal-btn svg {
  width: 20px;
  height: 20px;
}

/* 进度条覆盖层 */
.progress-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(10px);
}

.progress-container {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 32px;
  width: 90%;
  max-width: 500px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 8px 32px rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.progress-header h5 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.progress-percentage {
  font-size: 24px;
  font-weight: 800;
  color: #007AFF;
  background: linear-gradient(135deg, #007AFF 0%, #0056cc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-bar {
  height: 12px;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007AFF, #0056cc, #003d99);
  border-radius: 6px;
  transition: width 0.5s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 2s infinite;
  transform: translateX(-100%);
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

.progress-text {
  text-align: center;
  color: #7f8c8d;
  font-size: 14px;
  font-weight: 500;
}

.progress-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 8px;
  font-size: 12px;
}

.stat-item {
  display: inline-block;
  padding: 4px 8px;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 4px;
  color: #007AFF;
}

/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .health-report-manager {
    padding: 16px;
    border-radius: 20px;
  }
  
  .header-section {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .generate-btn {
    width: 100%;
    justify-content: center;
  }
  
  .report-main-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .report-actions {
    width: 100%;
    justify-content: flex-end;
    opacity: 1;
    transform: none;
  }
  
  .action-btn {
    min-width: 60px;
    padding: 8px 12px;
  }
  
  .action-text {
    display: none;
  }
  
  .action-btn .action-icon {
    margin-right: 0;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .report-header-info {
    grid-template-columns: 1fr;
  }
  
  .content-actions {
    flex-direction: column;
    align-items: flex-end;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .footer-btn {
    width: 100%;
    justify-content: center;
  }
  
  .report-content-wrapper {
    max-height: 400px;
  }
}

/* 小屏幕手机优化 */
@media (max-width: 480px) {
  .report-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .report-status {
    align-self: flex-start;
  }
  
  .report-actions {
    justify-content: space-between;
  }
  
  .action-btn {
    flex: 1;
    min-width: auto;
  }
}
</style>