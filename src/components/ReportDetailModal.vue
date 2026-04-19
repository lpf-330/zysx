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
          <button class="close-modal-btn" @click="closeModal" title="关闭">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <div class="report-header-info">
            <div class="info-item">
              <span class="info-label">报告ID</span>
              <span class="info-value">{{ report?.id || '---' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">生成时间</span>
              <span class="info-value">{{ formattedDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">字数统计</span>
              <span class="info-value">{{ reportContentLength }} <small>字</small></span>
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
                  <svg class="format-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M14,17H7V15H14M21,17H17V15H21M21,13H7V11H21M21,9H7V7H21M3,5H21V3H3A2,2 0 0,0 1,5V19A2,2 0 0,0 3,21H3V19H3V5Z" />
                  </svg>
                  {{ showFormatted ? '查看源码' : '格式化展示' }}
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
          <button class="footer-btn close-btn" @click="closeModal">
            关闭窗口
          </button>
          <button class="footer-btn download-modal-btn" @click="downloadReport">
            <svg class="footer-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
            </svg>
            下载报告
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

const copyButtonText = computed(() => isCopying.value ? '已复制！' : '复制内容');
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
    if (isNaN(date.getTime())) return dateString || '未知时间';
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
  if (!content) return '<div class="empty-state">暂无报告内容...</div>';

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

  let formatted = escapeHtml(content);

  formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  formatted = formatted.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  formatted = formatted.replace(/^\s*[-*•]\s+(.+)$/gm, '<li>$1</li>');
  if (formatted.includes('<li>')) {
    formatted = '<ul>' + formatted.replace(/<\/li>\n*<li>/g, '</li><li>') + '</ul>';
    formatted = formatted.replace(/<li>/g, '<li>').replace(/<\/li>/g, '</li>');
  }

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
    showMessage('报告内容已成功复制', 'success');
  } catch (err) {
    console.error('复制失败:', err);
    showMessage('复制失败，请手动选择复制', 'error');
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
    a.download = `健康报告_${props.report?.id || 'unknown'}_${reportDate}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage('正在下载报告...', 'success');
    emit('download');
  } catch (error) {
    console.error('下载报告错误:', error);
    showMessage('下载失败，请重试', 'error');
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
/* 遮罩层：带点墨绿的深色，更自然 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(36, 48, 40, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(6px);
}

/* 弹窗主体：浅草绿底色，温馨柔和 */
.report-modal {
  background: linear-gradient(135deg, #F8FAF8 0%, #EAF0EB 100%);
  border-radius: 28px;
  width: 90%;
  max-width: 630px;
  max-height: 94.5vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 30px 80px rgba(44, 62, 50, 0.2),
    0 10px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  overflow: hidden;
  animation: modal-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modal-pop {
  0% { transform: scale(0.95) translateY(20px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

/* 头部：经典的亚绿/莫兰迪绿色 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #7C9885 0%, #6B8E76 100%);
  color: #FFFFFF;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  width: 26px;
  height: 26px;
  color: #F9EBC8; /* 图标带点温馨的淡黄 */
}

.modal-header h4 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.close-modal-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-modal-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg) scale(1.05);
}

.close-modal-btn svg {
  width: 22px;
  height: 22px;
}

/* 内容区 */
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  max-height: calc(94.5vh - 160px);
}

/* 顶部信息卡片：奶黄色调，温馨治愈 */
.report-header-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
  padding: 24px;
  background: #FCFBF5; /* 极浅的暖黄 */
  border-radius: 20px;
  border: 1px solid #EDE9D0;
  box-shadow: 0 4px 16px rgba(124, 152, 133, 0.05);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 13px;
  color: #8C988F;
  font-weight: 500;
}

.info-value {
  font-size: 17px;
  font-weight: 600;
  color: #3E4C41;
}

.info-value small {
  font-size: 13px;
  font-weight: normal;
  color: #8C988F;
}

/* 报告内容外部容器 */
.report-content-container {
  background: #FFFFFF;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #DCE6DF;
  box-shadow: 0 8px 24px rgba(124, 152, 133, 0.06);
}

/* 报告内容标题栏 */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: #F4F7F5;
  border-bottom: 1px solid #DCE6DF;
}

.content-header h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #3E4C41;
}

.content-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 小操作按钮：柔和的暖黄与浅绿 */
.copy-btn, .format-btn {
  border: none;
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.copy-btn {
  background: #FEF7E6; /* 淡奶黄色 */
  color: #B58A30; /* 深咖黄 */
  border: 1px solid #F6E9C6;
}

.format-btn {
  background: #E8F0EB; /* 淡草绿色 */
  color: #5A7C64; /* 深亚绿 */
  border: 1px solid #D2DFD6;
}

.copy-btn:hover:not(:disabled),
.format-btn:hover {
  transform: translateY(-2px);
  filter: brightness(0.96);
}

.copy-btn:disabled {
  opacity: 0.7;
  cursor: default;
}

.copy-icon, .format-icon {
  width: 16px;
  height: 16px;
}

/* 报告正文区域 */
.report-content-wrapper {
  padding: 24px;
  min-height: 200px;
  background: #FFFFFF;
}

/* 滚动条美化 */
.report-content-wrapper::-webkit-scrollbar,
.modal-content::-webkit-scrollbar {
  width: 8px;
}
.report-content-wrapper::-webkit-scrollbar-track,
.modal-content::-webkit-scrollbar-track {
  background: #F4F7F5;
  border-radius: 4px;
}
.report-content-wrapper::-webkit-scrollbar-thumb,
.modal-content::-webkit-scrollbar-thumb {
  background: #C4D4C9;
  border-radius: 4px;
}

/* 源码与富文本样式 */
.raw-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.7;
  color: #556658;
  margin: 0;
}

.formatted-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 15px;
  line-height: 1.8;
  color: #3E4C41;
  white-space: normal;
  word-wrap: break-word;
}

.formatted-content h1,
.formatted-content h2,
.formatted-content h3 {
  margin: 24px 0 12px 0;
  color: #2D3A30;
  font-weight: 600;
}

.formatted-content h1 { font-size: 20px; border-bottom: 2px solid #EAF0EB; padding-bottom: 6px; }
.formatted-content h2 { font-size: 18px; }
.formatted-content h3 { font-size: 16px; }

.formatted-content ul,
.formatted-content ol {
  margin: 12px 0;
  padding-left: 24px;
}

.formatted-content li {
  margin: 6px 0;
  color: #4A5A4E;
}

.formatted-content strong {
  font-weight: 600;
  color: #2D3A30;
  background: rgba(230, 200, 135, 0.2); /* 强调文字带一点点浅黄底色 */
  padding: 0 4px;
  border-radius: 4px;
}

/* 底部操作区 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 24px 32px;
  border-top: 1px solid #DCE6DF;
  background: #F8FAF8;
}

.footer-btn {
  padding: 12px 28px;
  border: none;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-icon {
  width: 18px;
  height: 18px;
}

/* 下载按钮：主操作，亚绿色 */
.download-modal-btn {
  background: linear-gradient(135deg, #84A58D 0%, #6B8E76 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(107, 142, 118, 0.25);
}

.download-modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(107, 142, 118, 0.4);
  background: linear-gradient(135deg, #7C9B84 0%, #5F8069 100%);
}

/* 关闭按钮：次操作，亚黄色 */
.close-btn {
  background: #FCF5E3;
  color: #9A7B3E;
  border: 1px solid #EEDBAB;
}

.close-btn:hover {
  background: #FDF0D1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 168, 83, 0.15);
}

/* 动画过渡 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>