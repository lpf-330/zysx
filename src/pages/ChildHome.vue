<template>
<el-scrollbar max-height="5rem">
<div class="child-home">
  <div>
    <Header></Header>
  </div>
  <div class="box">
    <div class="parentcard">
      <ParentCard ref="parentCardRef" @parent-selected="onParentSelected"></ParentCard>
    </div>
    <div class="datadashboard">
      <DataDashboard :selected-parent-id="selectedParentId"></DataDashboard>
      <div class="health-report-section">
        <HealthReportManager 
          :selected-parent-id="selectedParentId"
          @view-report="handleViewReport"
        />
      </div>
    </div>
  </div>
  
  <!-- 新增报告详情模态框 -->
  <ReportDetailModal 
    :show-modal="showReportModal"
    :report="currentReport"
    @close="closeReportModal"
    @download="handleDownloadReport"
    @message="showMessage"
  />
  
  <!-- 保留原有的消息提示模态框 -->
  <Transition name="modal">
    <div v-if="showMessageModal" class="modal-overlay" @click.self="closeMessageModal">
      <div class="message-modal" :class="messageModalType">
        <div class="message-header">
          <svg class="message-icon" viewBox="0 0 24 24">
            <path v-if="messageModalType === 'success'" fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
            <path v-else fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
          </svg>
          <h3>{{ messageModalType === 'success' ? '操作失败' : '操作成功' }}</h3>
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
            {{ messageModalType === 'success' ? '重试' : '好的' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</div>
</el-scrollbar>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import router from '../router';
import DataDashboard from '../components/DataDashboard.vue';
import ParentCard from '../components/ParentCard.vue';
import HealthReportManager from '../components/HealthReportManager.vue';
import ReportDetailModal from '../components/ReportDetailModal.vue';
import Header from '../components/layout/Header.vue';

const parentCardRef = ref(null);
const selectedParentId = ref(null);

// 新增模态框相关状态
const showReportModal = ref(false);
const currentReport = ref(null);
const showMessageModal = ref(false);
const messageModalText = ref('');
const messageModalType = ref('success');

const onParentSelected = (parentData, index) => {
  console.log('ChildHome.vue 收到选中的父母:', parentData);
  if (parentData && parentData.id) {
    selectedParentId.value = parentData.id;
  } else {
    selectedParentId.value = null;
  }
};

// 处理查看报告
const handleViewReport = (report) => {
  currentReport.value = report;
  showReportModal.value = true;
};

// 关闭报告模态框
const closeReportModal = () => {
  showReportModal.value = false;
  currentReport.value = null;
};

// 处理下载报告
const handleDownloadReport = () => {
  console.log('报告已下载');
};

// 显示消息
const showMessage = (text, type = 'error') => {
  messageModalText.value = text;
  messageModalType.value = type;
  showMessageModal.value = true;
};

// 关闭消息模态框
const closeMessageModal = () => {
  showMessageModal.value = false;
  setTimeout(() => {
    messageModalText.value = '';
    messageModalType.value = 'success';
  }, 300);
};

// 当页面加载完成后，尝试选择第一个父母
onMounted(async () => {
  console.log('子女端页面加载完成');
  await nextTick();
  
  const unwatch = watch(() => parentCardRef.value?.hasParents, (hasParents) => {
    if (hasParents) {
      console.log('Parents data loaded, selecting first parent');
      parentCardRef.value.selectFirstParent();
      unwatch();
    }
  });
  
  setTimeout(() => {
    if (parentCardRef.value && parentCardRef.value.hasParents && !selectedParentId.value) {
      parentCardRef.value.selectFirstParent();
    }
  }, 1000);
});
</script>

<style scoped>
/* 保留原有样式 */
.box{
  width: 100%;
  display: flex;
  height: 8rem;
}
.parentcard {
  width: 20%;
  height: 11.05rem;
}
.datadashboard {
  position: relative;
  margin-left: 0.3rem;
  width: 74%;
  height: 7rem;
}
.health-report-section {
  position: relative;
  top: 0.07rem;
  left: 0;
  width: 103.5%;
  height: 100%;
}

/* 消息提示模态框样式 - 从 HealthReportManager.vue 复制 */
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