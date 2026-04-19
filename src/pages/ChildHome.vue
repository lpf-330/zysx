<template>
<el-scrollbar class="custom-scrollbar">
<div class="child-home">
  <div class="bg-hologram-grid"></div>

  <div class="header-glass-wrapper">
    <Header></Header>
  </div>

  <div class="command-center-layout">
    <aside class="sidebar-panel">
      <div class="glass-panel hud-frame">
        <div class="hud-corner top-left"></div>
        <div class="hud-corner bottom-right"></div>
        <div class="panel-label">家长列表</div>

        <ParentCard ref="parentCardRef" @parent-selected="onParentSelected" @open-form="handleOpenParentForm"></ParentCard>
      </div>

      <div class="glass-panel hud-frame report-wrapper">
        <div class="hud-corner top-left"></div>
        <div class="hud-corner bottom-right"></div>
        <div class="panel-label">健康报告</div>

        <HealthReportManager
          :selected-parent-id="selectedParentId"
          :is-matrix-expanded="isMatrixExpanded"
          @view-report="handleViewReport"
        />
      </div>
    </aside>

    <main class="main-dashboard-area">
      <div class="glass-panel hud-frame dashboard-wrapper">
        <div class="hud-corner top-right"></div>
        <div class="hud-corner bottom-left"></div>
        <div class="panel-label">健康数据</div>

        <DataDashboard :selected-parent-id="selectedParentId" @card-toggled="handleMatrixToggled"></DataDashboard>
      </div>
    </main>
  </div>

  <ReportDetailModal
    :show-modal="showReportModal"
    :report="currentReport"
    @close="closeReportModal"
    @download="handleDownloadReport"
    @message="({ text, type }) => showMessage(text, type)"
  />

  <ParentFormModal
    :show-modal="showParentFormModal"
    :edit-id="editParentId"
    @close="handleParentFormClose"
    @success="handleParentFormSuccess"
  />

  <Transition name="titanium-modal">
    <div v-if="showMessageModal" class="modal-overlay" @click.self="closeMessageModal">
      <div class="titanium-message-modal" :class="messageModalType">
        <div class="modal-corner top-left"></div>
        <div class="modal-corner bottom-right"></div>

        <div class="message-header">
          <div class="header-title-group">
            <div class="icon-pulse-wrapper">
              <svg class="message-icon" viewBox="0 0 24 24">
                <path v-if="messageModalType === 'success'" fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
                <path v-else fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
              </svg>
            </div>
            <h3>{{ messageModalType === 'success' ? 'SYSTEM.SUCCESS' : 'SYSTEM.ERROR' }}</h3>
          </div>
          <button class="close-modal-btn" @click="closeMessageModal">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <div class="scanline-bg"></div>
          <p class="message-text">{{ messageModalText }}</p>
        </div>

        <div class="modal-footer">
          <button class="titanium-btn confirm-btn" @click="closeMessageModal">
            <span class="btn-text">{{ messageModalType === 'success' ? 'ACKNOWLEDGE' : 'RETRY' }}</span>
            <div class="btn-glare"></div>
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
import ParentFormModal from '../components/ParentFormModal.vue';
import Header from '../components/layout/Header.vue';

const parentCardRef = ref(null);
const selectedParentId = ref(null);
const isMatrixExpanded = ref(false);

const handleMatrixToggled = (expanded) => {
  isMatrixExpanded.value = expanded;
};

const showReportModal = ref(false);
const currentReport = ref(null);
const showParentFormModal = ref(false);
const editParentId = ref(null);
const showMessageModal = ref(false);
const messageModalText = ref('');
const messageModalType = ref('success');

const onParentSelected = (parentData, index) => {
  console.log('ChildHome.vue 收到选中的父母:', parentData);
  if (parentData && parentData.id) {
    selectedParentId.value = parentData.id;
    // 保存到 localStorage
    localStorage.setItem('selectedParentId', parentData.id);
  } else {
    selectedParentId.value = null;
    localStorage.removeItem('selectedParentId');
  }
};

const handleViewReport = (report) => {
  currentReport.value = report;
  showReportModal.value = true;
};

const closeReportModal = () => {
  showReportModal.value = false;
  currentReport.value = null;
};

const handleDownloadReport = () => {
  console.log('报告已下载');
};

const showMessage = (text, type = 'error') => {
  messageModalText.value = text;
  messageModalType.value = type;
  showMessageModal.value = true;
};

const closeMessageModal = () => {
  showMessageModal.value = false;
  setTimeout(() => {
    messageModalText.value = '';
    messageModalType.value = 'success';
  }, 300);
};

const handleParentFormSuccess = () => {
  console.log('ParentForm success triggered');
  showParentFormModal.value = false;
  editParentId.value = null;
};

const handleParentFormClose = () => {
  console.log('ParentForm close triggered');
  showParentFormModal.value = false;
  editParentId.value = null;
};

// 单独处理 open-form 事件
const handleOpenParentForm = (editId) => {
  console.log('open-form received:', editId);
  if (editParentId && showParentFormModal) {
    editParentId.value = editId;
    showParentFormModal.value = true;
    console.log('showParentFormModal set to true');
  }
};

onMounted(async () => {
  console.log('子女端页面加载完成');
  await nextTick();

  // 从 localStorage 读取上次选择的监护对象
  const savedParentId = localStorage.getItem('selectedParentId');
  if (savedParentId) {
    selectedParentId.value = savedParentId;
  }

  const unwatch = watch(() => parentCardRef.value?.hasParents, (hasParents) => {
    if (hasParents) {
      console.log('Parents data loaded, selecting parent');
      // 如果有保存的选择，尝试选中对应的家长
      if (savedParentId && parentCardRef.value) {
        parentCardRef.value.selectParentById(savedParentId);
      } else {
        // 否则选择第一个
        parentCardRef.value.selectFirstParent();
      }
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
@import url('https://gs.jurieo.com/gemini/fonts-googleapis/css2?family=Share+Tech+Mono&display=swap');

/* =========================================
   1. 全局底座：银灰钛金属空间 (Titanium Space)
   ========================================= */
.child-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%);
  color: #1e293b;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* 独立抽出的动态网格与光晕层，防止层级冲突 */
.bg-hologram-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.15) 1px, transparent 1px);
  background-size: 40px 40px;
  background-attachment: fixed;
  z-index: 0;
  pointer-events: none;
}
.bg-hologram-grid::before {
  content: '';
  position: absolute;
  top: -20%; left: -10%;
  width: 50%; height: 50%;
  background: radial-gradient(circle, rgba(0, 198, 255, 0.05) 0%, transparent 60%);
}
.bg-hologram-grid::after {
  content: '';
  position: absolute;
  bottom: -20%; right: -10%;
  width: 60%; height: 60%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.04) 0%, transparent 60%);
}

/* =========================================
   2. 头部组件悬浮包装 (Floating Header)
   ========================================= */
.header-glass-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(248, 250, 252, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

/* =========================================
   3. 核心布局 (Command Center Layout)
   ========================================= */
.command-center-layout {
  display: flex;
  gap: 11.2px;
  padding: 32px;
  max-width: 1920px;
  margin: 0 auto;
  align-items: flex-start;
  position: relative;
  z-index: 10;
}

/* 左侧边栏 (Sidebar) */
.sidebar-panel {
  flex: 0 0 526px;
  width: 526px;
  min-width: 526px;
  max-width: 526px;
  box-sizing: border-box;
  position: sticky;
  top: 100px;
  display: flex;
  flex-direction: column;
  gap: 20.2px;
}

/* 右侧主控区 (Main Area) */
.main-dashboard-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 11.2px;
}

/* =========================================
   4. 统一装甲玻璃面板 (Glass Tactical Panels)
   ========================================= */
.glass-panel {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04), inset 0 2px 10px rgba(255, 255, 255, 0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
.glass-panel:hover {
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.06), inset 0 2px 15px rgba(255, 255, 255, 0.8);
}

/* 面板内部组件间距调整 */
.sidebar-panel .glass-panel { padding: 12px; }
.dashboard-wrapper { padding: 24px 16px; }
.report-wrapper { padding: 24px; }

/* 战术边角修饰 (HUD Corners) */
.hud-frame {
  position: relative;
  overflow: visible;
}
.hud-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid #94a3b8;
  opacity: 0.6;
  pointer-events: none;
  transition: all 0.3s ease;
}
.glass-panel:hover .hud-corner {
  border-color: #56F088;
  opacity: 1;
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.2);
}
.hud-corner.top-left { top: -2px; left: -2px; border-right: none; border-bottom: none; border-top-left-radius: 16px; }
.hud-corner.top-right { top: -2px; right: -2px; border-left: none; border-bottom: none; border-top-right-radius: 16px; }
.hud-corner.bottom-left { bottom: -2px; left: -2px; border-right: none; border-top: none; border-bottom-left-radius: 16px; }
.hud-corner.bottom-right { bottom: -2px; right: -2px; border-left: none; border-top: none; border-bottom-right-radius: 16px; }

/* 面板系统编号 (System Labels) */
.panel-label {
  position: absolute;
  top: -12px;
  left: 24px;
  background: #f8fafc;
  padding: 0 8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  color: #64748b;
  letter-spacing: 1.5px;
  border-radius: 4px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  z-index: 5;
}

/* =========================================
   5. 钛银机甲风 模态框 (Titanium Modal)
   ========================================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, rgba(148, 163, 184, 0.4) 0%, rgba(15, 23, 42, 0.7) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.titanium-message-modal {
  background: rgba(248, 250, 252, 0.85);
  width: 90%;
  max-width: 420px;
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
  position: relative;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  animation: modal-enter 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  border: 1px solid rgba(255, 255, 255, 0.9);
  overflow: hidden;
}

/* 动态边框色彩映射 */
.titanium-message-modal.success {
  border-bottom: 4px solid #56F088;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, rgba(224, 242, 254, 0.6) 100%);
}
.titanium-message-modal.error {
  border-bottom: 4px solid #ef4444;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, rgba(254, 226, 226, 0.6) 100%);
}

/* 装饰角标 */
.modal-corner {
  position: absolute; width: 10px; height: 10px;
  border: 2px solid #cbd5e1;
}
.modal-corner.top-left { top: 4px; left: 24px; border-right: none; border-bottom: none; }
.modal-corner.bottom-right { bottom: 24px; right: 4px; border-left: none; border-top: none; }

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-header h3 {
  margin: 0;
  font-family: 'Share Tech Mono', monospace;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #1e293b;
}
.titanium-message-modal.success h3 { color: #56F088; }
.titanium-message-modal.error h3 { color: #b91c1c; }

.icon-pulse-wrapper {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  background: #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.titanium-message-modal.success .icon-pulse-wrapper { border: 1px solid rgba(14, 165, 233, 0.3); }
.titanium-message-modal.error .icon-pulse-wrapper { border: 1px solid rgba(239, 68, 68, 0.3); }

.message-icon { width: 20px; height: 20px; }
.titanium-message-modal.success .message-icon { color: #22F0AB; animation: pulse 2.8s infinite alternate;}
.titanium-message-modal.error .message-icon { color: #ef4444; animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;}

.close-modal-btn {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 6px;
  color: #64748b;
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.close-modal-btn:hover { background: #fff; color: #0f172a; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.close-modal-btn svg { width: 18px; height: 18px; }

.modal-content {
  position: relative;
  padding: 32px 24px;
}
.scanline-bg {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 3px, rgba(0,0,0,0.02) 3px);
  pointer-events: none;
}
.message-text {
  font-size: 15px;
  color: #475569;
  line-height: 1.6;
  text-align: center;
  margin: 0;
  font-weight: 500;
  position: relative;
  z-index: 2;
}

.modal-footer {
  display: flex;
  justify-content: center;
  padding: 20px 24px 24px;
}

.titanium-btn {
  position: relative;
  padding: 10px 40px;
  border: 1px solid;
  background: rgba(255, 255, 255, 0.6);
  font-family: 'Share Tech Mono', monospace;
  font-size: 15px;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  transition: all 0.3s ease;
  overflow: hidden;
}

.titanium-message-modal.success .titanium-btn {
  border-color: #56F088;
  color: #56F088;
}
.titanium-message-modal.error .titanium-btn {
  border-color: #ef4444;
  color: #b91c1c;
}

.titanium-btn:hover {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}
.titanium-message-modal.success .titanium-btn:hover { box-shadow: 0 5px 15px rgba(14, 165, 233, 0.2); }
.titanium-message-modal.error .titanium-btn:hover { box-shadow: 0 5px 15px rgba(239, 68, 68, 0.2); }

.btn-glare {
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  transform: skewX(-20deg);
  transition: left 0.5s ease;
}
.titanium-btn:hover .btn-glare { left: 200%; }

/* =========================================
   动画与响应式
   ========================================= */
@keyframes modal-enter {
  0% { transform: scale(0.95) translateY(20px); opacity: 0; filter: blur(5px); }
  100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
}
@keyframes pulse {
  100% { transform: scale(1.1); filter: drop-shadow(0 0 4px rgba(14, 165, 233, 0.4)); }
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
  40%, 60% { transform: translate3d(3px, 0, 0); }
}

:deep(.custom-scrollbar .el-scrollbar__wrap) {
  overflow-x: hidden;
}

@media (max-width: 1024px) {
  .command-center-layout {
    flex-direction: column;
    padding: 16px;
  }
  .sidebar-panel {
    flex: none;
    width: 100%;
    position: static;
  }
}
</style>