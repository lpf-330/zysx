<template>
  <Transition name="modal">
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="report-modal">
        <div class="modal-header">
          <div class="modal-title">
            <svg class="modal-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M15.5,12C18,12 20,14 20,16.5C20,17.38 19.75,18.21 19.31,18.9L22.39,22L21,23.39L17.88,20.32C17.19,20.75 16.37,21 15.5,21C13,21 11,19 11,16.5C11,14 13,12 15.5,12M15.5,14A2.5,2.5 0 0,0 13,16.5A2.5,2.5 0 0,0 15.5,19A2.5,2.5 0 0,0 18,16.5A2.5,2.5 0 0,0 15.5,14M7,15V17H9C9.14,18.55 9.8,19.94 10.81,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19A2,2 0 0,1 21,5V13.03C19.85,11.21 17.82,10 15.5,10C14.23,10 13.04,10.37 12,11V5H5V19H10.5C10.35,18.36 10.18,17.7 10.06,17H7Z" />
            </svg>
            <h4>健康报告详情</h4>
          </div>
          <button class="close-modal-btn" @click="closeModal">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <div class="report-header-info">
            <div class="info-item">
              <span class="info-label">报告ID:</span>
              <span class="info-value">{{ report?.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">生成时间:</span>
              <span class="info-value">{{ formattedDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">字数统计:</span>
              <span class="info-value">{{ reportContentLength }}字</span>
            </div>
          </div>
          <div class="report-content-container">
            <div class="content-header">
              <h5>报告内容</h5>
              <div class="content-actions">
                <button class="copy-btn" @click="copyReportContent" :disabled="isCopying">
                  <svg v-if="isCopying" class="copy-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                  </svg>
                  <svg v-else class="copy-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                  </svg>
                  {{ copyButtonText }}
                </button>
                <button class="format-btn" @click="toggleFormat">
                  <svg v-if="showFormatted" class="format-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M14,17H7V15H14M21,17H17V15H21M21,13H7V11H21M21,9H7V7H21M3,5H21V3H3A2,2 0 0,0 1,5V19A2,2 0 0,0 3,21H3V19H3V5Z" />
                  </svg>
                  <svg v-else class="format-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M14,17H7V15H14M21,17H17V15H21M21,13H7V11H21M21,9H7V7H21M3,5H21V3H3A2,2 0 0,0 1,5V19A2,2 0 0,0 3,21H3V19H3V5Z" />
                  </svg>
                  {{ showFormatted ? '源码' : '格式' }}
                </button>
              </div>
            </div>
            <div class="report-content-wrapper">
              <pre v-if="!showFormatted" class="report-content raw-content">{{ reportContent }}</pre>
              <div v-else class="report-content formatted-content" v-html="formattedContent"></div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="footer-btn download-modal-btn" @click="downloadReport">
            <svg class="footer-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
            </svg>
            下载报告
          </button>
          <button class="footer-btn close-btn" @click="closeModal">
            <svg class="footer-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
            关闭
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  showModal: Boolean,
  report: Object
});

const emit = defineEmits(['close', 'download', 'message']);

const showFormatted = ref(true);
const isCopying = ref(false);
const reportContent = ref('');

const copyButtonText = computed(() => isCopying.value ? '已复制' : '复制内容');
const reportContentLength = computed(() => reportContent.value?.length || 0);
const formattedDate = computed(() => formatDetailedDate(props.report?.createTime));
const formattedContent = computed(() => formatReportContent(reportContent.value));

watch(() => props.report, (newReport) => {
  if (newReport) {
    reportContent.value = newReport.report || '';
  }
}, { immediate: true });

function formatDetailedDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    return dateString || '未知时间';
  }
}

function formatReportContent(content) {
  if (!content) return '';
  
  // 1. 安全地转义 HTML
  const escapeHtml = (text) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  };
  
  // 2. 处理内容
  let formatted = escapeHtml(content);
  
  // 3. 处理标题
  formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  formatted = formatted.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  
  // 4. 处理加粗
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // 5. 处理无序列表
  formatted = formatted.replace(/^\s*[-*•]\s+(.+)$/gm, '<li>$1</li>');
  if (formatted.includes('<li>')) {
    formatted = '<ul>' + formatted.replace(/<\/li><li>/g, '</li><li>') + '</ul>';
    formatted = formatted.replace(/<li>/g, '<li>').replace(/<\/li>/g, '</li>');
  }
  
  // 6. 处理换行
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
}

function toggleFormat() {
  showFormatted.value = !showFormatted.value;
}

async function copyReportContent() {
  if (!reportContent.value) return;
  try {
    await navigator.clipboard.writeText(reportContent.value);
    isCopying.value = true;
    setTimeout(() => {
      isCopying.value = false;
    }, 2000);
    showMessage('报告内容已复制到剪贴板', 'success');
  } catch (err) {
    console.error('复制失败:', err);
    showMessage('复制失败，请手动复制', 'error');
  }
}

function downloadReport() {
  if (!reportContent.value) return;
  try {
    const blob = new Blob([reportContent.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const reportDate = props.report?.createTime ? new Date(props.report.createTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    a.download = `健康报告_${props.report?.id || 'unknown'}_${reportDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage('报告下载开始', 'success');
    emit('download');
  } catch (error) {
    console.error('下载报告错误:', error);
    showMessage('下载报告失败', 'error');
  }
}

function closeModal() {
  emit('close');
}

function showMessage(text, type = 'error') {
  emit('message', { text, type });
}
</script>

<style scoped>
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
.report-modal {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 30px 100px rgba(0, 0, 0, 0.3),
    0 8px 32px rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  overflow: hidden;
  animation: modal-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes modal-pop {
  0% { transform: scale(0.9) translateY(20px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  background: rgb(49, 139, 255);
  color: white;
}
.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.modal-icon {
  width: 24px;
  height: 24px;
}
.modal-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
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
  transform: rotate(90deg);
}
.close-modal-btn svg {
  width: 20px;
  height: 20px;
}
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  max-height: calc(90vh - 160px);
}
.report-header-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e6f2ff 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 122, 255, 0.1);
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-label {
  font-size: 12px;
  color: #7f8c8d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.info-value {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
}
.report-content-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 122, 255, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e6f2ff 100%);
  border-bottom: 1px solid rgba(0, 122, 255, 0.1);
}
.content-header h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
}
.content-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.copy-btn, .format-btn {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}
.format-btn {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #388e3c;
}
.copy-btn:hover:not(:disabled),
.format-btn:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}
.copy-btn:disabled {
  opacity: 0.8;
  cursor: default;
}
.copy-icon, .format-icon {
  width: 14px;
  height: 14px;
}
.report-content-wrapper {
  max-height: 500px;
  overflow-y: auto;
  padding: 20px;
  min-height: 200px;
}
.raw-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #2c3e50;
  margin: 0;
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.formatted-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.formatted-content h1,
.formatted-content h2,
.formatted-content h3 {
  margin: 16px 0 8px 0;
  color: #2c3e50;
  font-weight: 600;
}
.formatted-content h1 { font-size: 18px; }
.formatted-content h2 { font-size: 16px; }
.formatted-content h3 { font-size: 15px; }
.formatted-content ul,
.formatted-content ol {
  margin: 8px 0;
  padding-left: 24px;
}
.formatted-content li {
  margin: 4px 0;
}
.formatted-content strong {
  font-weight: 600;
  color: #2c3e50;
}
.formatted-content br {
  margin-bottom: 4px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid rgba(0, 122, 255, 0.1);
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
  display: flex;
  align-items: center;
  gap: 8px;
}
.footer-icon {
  width: 16px;
  height: 16px;
}
.download-modal-btn {
  background: linear-gradient(135deg, #4cd964 0%, #2ecc71 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.3);
}
.download-modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
}
.close-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
}
.close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
}
.modal-enter-active,
.modal-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>