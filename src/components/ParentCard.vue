<template>
  <div class="parent-selector-container warm-glass-panel">
    <div class="panel-soft-bg"></div>

    <div class="selector-header warm-header">
      <div class="header-title-group">
        <svg class="header-icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M16 17V19H2V17S2 13 9 13 16 17 16 17M12.5 7.5A3.5 3.5 0 1 0 9 11A3.5 3.5 0 0 0 12.5 7.5M23.44 11.45L18.15 16.74L15.32 13.91L16.74 12.5L18.15 13.91L22.03 10.04L23.44 11.45Z" />
        </svg>
        <h2 class="section-title">监护对象</h2>
      </div>
      <button class="warm-add-btn" @click="openModal">
        <svg class="btn-icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
        </svg>
        <span>新增档案</span>
      </button>
    </div>

    <div class="pagination-arrows" v-if="totalPages > 1">
      <button class="arrow-btn" :disabled="currentPage === 1" @click="goPrevPage">
        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" /></svg>
      </button>
    </div>

    <div class="parent-list">
      <div
        v-for="(parent, index) in paginatedParents"
        :key="parent.id || index"
        class="parent-card warm-card"
        :class="{ 'active': selectedParentIndex === (currentPage - 1) * pageSize + index }"
        @click="selectParent((currentPage - 1) * pageSize + index)"
      >
        <div class="card-avatar">
          <div class="avatar-ring" :class="{ 'active-ring': selectedParentIndex === (currentPage - 1) * pageSize + index }"></div>
          <img :src="defaultAvatar" alt="头像" class="avatar-img">
          <div class="status-indicator" :class="getStatusClass(parent.lastActive)"></div>
        </div>

        <div class="card-content">
          <div class="card-header-info">
            <h3 class="parent-name">{{ parent.username }}</h3>
            <div class="warm-badge">{{ calculateAge(parent.birthDate) }} 岁</div>
          </div>

          <div class="card-details">
            <div class="detail-row">
              <svg class="detail-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" /></svg>
              <span class="detail-text">{{ parent.gender === 'male' ? '男' : '女' }}</span>
            </div>
            <div class="detail-row">
              <svg class="detail-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M3,5A2,2 0 0,0 1,7V19A2,2 0 0,0 3,21H15A2,2 0 0,0 17,19V11H15V19H3V7H11V5H3M7,7H11V9H7V7M13,13V15H19V13H13M13,17V19H19V17H13M13,9V11H19V9H13Z" /></svg>
              <span class="detail-text">{{ formatDate(parent.birthDate) }}</span>
            </div>
            <div class="detail-row">
              <svg class="detail-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M13.5,4A1.5,1.5 0 0,0 12,5.5A1.5,1.5 0 0,0 13.5,7A1.5,1.5 0 0,0 15,5.5A1.5,1.5 0 0,0 13.5,4M13.67,8.54C10.94,9.2 9,11.83 9,15V16H18V15C18,11.83 16.06,9.2 13.33,8.54C13.1,8.48 12.9,8.44 12.67,8.46C12.5,8.47 12.33,8.5 12,8.5C11.67,8.5 11.5,8.47 11.33,8.46C11.1,8.44 10.9,8.48 10.67,8.54C7.94,9.2 6,11.83 6,15V16H3V17C3,18.11 3.9,19 5,19H19C20.11,19 21,18.11 21,17V16H18V15C18,11.83 16.06,9.2 13.33,8.54C13.56,8.48 13.76,8.46 13.67,8.54Z" /></svg>
              <span class="detail-text">{{ parent.height }}cm / {{ parent.weight }}kg</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button class="action-btn edit-btn" @click.stop="openModal((currentPage - 1) * pageSize + index)">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25M18.18,8.63L20.71,6.1L19,4.39L16.47,6.92L18.18,8.63M14.06,6.18L17.81,9.93L19.5,8.25L15.75,4.5L14.06,6.18Z" /></svg>
          </button>
          <button class="action-btn delete-btn" @click.stop="confirmDelete((currentPage - 1) * pageSize + index)">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19,4H15.5L14.5,3H10.5L9.5,4H6V6H19M7,18A2,2 0 0,0 9,20H15A2,2 0 0,0 17,18V8H7V18M9,10V18H15V10H9Z" /></svg>
          </button>
        </div>
      </div>

      <div class="pagination-arrows-right" v-if="totalPages > 1">
        <button class="arrow-btn" :disabled="currentPage === totalPages" @click="goNextPage">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" /></svg>
        </button>
      </div>
    </div>

    <Transition name="warm-modal">
      <div v-if="showConfirmModal" class="warm-modal-overlay" @click.self="closeConfirmModal">
        <div class="warm-modal-panel small-panel">
          <div class="warm-modal-header warn-header">
            <div class="header-title-group">
              <svg class="warm-icon warn-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" /></svg>
              <h3 class="warm-modal-title">删除确认</h3>
            </div>
            <button class="warm-close-btn" @click="closeConfirmModal">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>
            </button>
          </div>

          <div class="warm-modal-content confirm-content">
            <p class="sys-msg warn-text">您确定要删除这个监护对象吗？</p>
            <p class="sub-text">此操作不可逆转，相关档案数据将被永久清除。</p>
          </div>

          <div class="warm-modal-footer">
            <button class="warm-cancel-btn" @click="closeConfirmModal">取消</button>
            <button class="warm-danger-btn" @click="deleteParent">确认删除</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="warm-modal">
      <div v-if="showMessageModal" class="warm-modal-overlay" @click.self="closeMessageModal">
        <div class="warm-modal-panel small-panel message-panel">
          <div class="warm-modal-content confirm-content center-content">
             <svg v-if="messageModalType === 'success'" class="message-icon success-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" /></svg>
             <svg v-else class="message-icon error-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" /></svg>

            <p class="sys-msg" :class="messageModalType">
              {{ messageModalText }}
            </p>
          </div>
          <div class="warm-modal-footer center-footer">
            <button class="warm-submit-btn" :class="messageModalType" @click="closeMessageModal">我知道了</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import useChildUserStore from '../stores/childUser';
import { storeToRefs } from 'pinia';
import { deleteChildParent } from '../api/parentManagement';
import ParentFormModal from './ParentFormModal.vue';

// 弹窗状态
const showModal = ref(false);
const editId = ref(null);

// 打开弹窗 - 触发事件给父组件
const openModal = (index = null) => {
  if (typeof index === 'number' && index >= 0) {
    editId.value = parents.value[index].id;
  } else {
    editId.value = null;
  }
  emit('open-form', editId.value);
};

// 关闭弹窗
const closeModal = () => {
  showModal.value = false;
  editId.value = null;
};

// 提交成功回调
const handleSuccess = () => {
  closeModal();
};

// 获取今天的日期（用于限制出生日期不能选今天之后）
const today = computed(() => {
  const now = new Date();
  return now.toISOString().split('T')[0];
});

const defaultAvatar = ref('https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=200&h=200');

// 使用store
const childUserStore = useChildUserStore();
const { parents, selectedParentIndex } = storeToRefs(childUserStore);

// 分页
const currentPage = ref(1);
const pageSize = 1;
const paginatedParents = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return parents.value.slice(start, end);
});
const totalPages = computed(() => Math.ceil(parents.value.length / pageSize));

// 删除确认弹窗
const showConfirmModal = ref(false);
const currentParentIndex = ref(-1);

// 消息提示模态框状态
const showMessageModal = ref(false);
const messageModalText = ref('');
const messageModalType = ref('');

// 计算年龄
const calculateAge = (birthDateString) => {
  if (!birthDateString) return 0;
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`;
};

// 获取状态类
const getStatusClass = (lastActive) => {
  if (!lastActive) return 'offline';
  const now = new Date().getTime();
  const diff = now - lastActive;
  const hours = diff / (1000 * 60 * 60);

  if (hours < 1) return 'online';
  if (hours < 24) return 'recently';
  return 'offline';
};

// 选择父母
const selectParent = (index) => {
  childUserStore.selectParent(index);
  const selectedParentData = parents.value[index];
  if (selectedParentData) {
    emit('parent-selected', selectedParentData, index);
  }
};

// 上一页并选中第一个
const goPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    const firstIndex = (currentPage.value - 1) * pageSize;
    selectParent(firstIndex);
  }
};

// 下一页并选中第一个
const goNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    const firstIndex = (currentPage.value - 1) * pageSize;
    selectParent(firstIndex);
  }
};

defineExpose({
  selectFirstParent: () => {
    if (parents.value && parents.value.length > 0) {
      selectParent(0);
      return true;
    }
    return false;
  },
  selectParentById: (id) => {
    const index = parents.value.findIndex(p => p.id == id);
    if (index >= 0) {
      selectParent(index);
      return true;
    }
    return false;
  },
  openModal: (index = null) => {
    if (typeof index === 'number' && index >= 0) {
      editId.value = parents.value[index].id;
    } else {
      editId.value = null;
    }
    emit('open-form', editId.value);
  },
  closeModal: () => {
    showModal.value = false;
    editId.value = null;
  }
});

const closeConfirmModal = () => {
  showConfirmModal.value = false;
};

const closeMessageModal = () => {
  showMessageModal.value = false;
  messageModalText.value = '';
  messageModalType.value = '';
};

const confirmDelete = (index) => {
  currentParentIndex.value = index;
  showConfirmModal.value = true;
};

const deleteParent = async () => {
  if (currentParentIndex.value < 0) return;
  const parentIdToDelete = parents.value[currentParentIndex.value].id;

  try {
    const response = await deleteChildParent(childUserStore.child_id, parentIdToDelete);
    if (response.code === 1) {
      childUserStore.deleteParent(currentParentIndex.value);
      showMessage('档案已删除', 'success');
      closeConfirmModal();
    } else {
      throw new Error(response.msg || '删除失败');
    }
  } catch (error) {
    showMessage(`错误: ${error.message || '未知错误'}`, 'error');
  }
};

const showMessage = (text, type) => {
  messageModalText.value = text;
  messageModalType.value = type;
  showMessageModal.value = true;
};

const emit = defineEmits(['parent-selected', 'open-form']);

onMounted(() => {
  childUserStore.loadFromStorage();
});
</script>

<style scoped>
/* ================== 全局基础配色与玻璃面板 ================== */
.warm-glass-panel {
  width: %;
  height: 100%;
  border-radius: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(240, 255, 244, 0.9) 0%, rgba(232, 250, 240, 0.85) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    inset 0 0 30px rgba(86, 240, 136, 0.15),
    0 15px 35px rgba(45, 74, 62, 0.12);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: visible;
  font-family: 'Inter', "SF Pro Display", -apple-system, sans-serif;
  border: 1px solid rgba(86, 240, 136, 0.3);
}

.panel-soft-bg {
  position: absolute;
  top: -30%; left: -30%;
  width: 160%; height: 160%;
  background: radial-gradient(circle, rgba(86, 240, 136, 0.15) 0%, transparent 50%);
  z-index: 0;
  pointer-events: none;
}

/* ================== 温暖头部 ================== */
.selector-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  z-index: 2;
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 28px;
  height: 28px;
  color: #56F088;
  filter: drop-shadow(0 0 8px rgba(86, 240, 136, 0.4));
}

.section-title {
  font-size: 20px;
  font-weight: 900;
  color: #2D4A3E;
  letter-spacing: 1px;
  margin: 0;
}

.warm-add-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(86, 240, 136, 0.2) 0%, rgba(180, 240, 166, 0.1) 100%);
  border: 1px solid rgba(86, 240, 136, 0.4);
  border-radius: 20px;
  padding: 10px 20px;
  color: #56F088;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: visible;
}

.warm-add-btn:hover {
  background: linear-gradient(135deg, rgba(86, 240, 136, 0.35) 0%, rgba(180, 240, 166, 0.2) 100%);
  border-color: #56F088;
  box-shadow: 0 4px 15px rgba(86, 240, 136, 0.25);
  transform: translateY(-2px);
}

.warm-add-btn .btn-icon { width: 18px; height: 18px; }

/* ================== 卡片列表 ================== */
.parent-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 8px;
  z-index: 2;
  min-width: 0;
}

.warm-card {
  position: relative;
  background: #ffffff;
  border: 1px solid rgba(86, 240, 136, 0.3);
  border-radius: 20px;
  padding: 12px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5), 0 4px 15px rgba(86, 240, 136, 0.08);
  overflow: visible;
  min-width: 0;
}

.warm-card:hover {
  transform: translateY(-4px);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 255, 245, 0.85) 100%);
  box-shadow: 0 8px 25px rgba(86, 240, 136, 0.15);
  border-color: rgba(86, 240, 136, 0.5);
}

/* --- 激活状态 --- */
.warm-card.active {
  background: linear-gradient(145deg, rgb(210, 244, 255) 0%, rgba(180, 240, 166, 0.08) 100%);
  border-color: rgb(255, 255, 255);
  box-shadow:
    inset 0 0 20px rgba(86, 240, 136, 0.1),
    0 10px 30px rgba(86, 240, 136, 0.2);
}

/* --- 头像区域 --- */
.card-avatar {
  position: relative;
  width: 45px; height: 45px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}

.avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px dashed rgba(86, 240, 136, 0.3);
  transition: all 0.3s;
}
.avatar-ring.active-ring {
  border-color: #56F088;
  border-style: solid;
  animation: gentle-pulse 2s ease-in-out infinite;
  box-shadow: 0 0 12px rgba(86, 240, 136, 0.4);
}
@keyframes gentle-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

.avatar-img {
  width: 100%; height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  position: relative; z-index: 2;
}

.status-indicator {
  position: absolute;
  bottom: 0; right: 0;
  width: 14px; height: 14px;
  border-radius: 50%;
  border: 2px solid white;
  z-index: 3;
}
.status-indicator.online { background-color: #8BE9A3; box-shadow: 0 0 8px #8BE9A3; }
.status-indicator.recently { background-color: #F4C98B; box-shadow: 0 0 8px #F4C98B; }
.status-indicator.offline { background-color: #B8BCC0; }

/* --- 卡片内容区 --- */
.card-content { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;}

.card-header-info {
  display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
}

.parent-name {
  font-size: 17px; font-weight: 900; margin: 0;
  white-space: nowrap; overflow: visible; text-overflow: ellipsis;
  color: #2D4A3E;
}
.warm-card.active .parent-name {
  color: #000000;
}

.warm-badge {
  background: linear-gradient(135deg, rgba(86, 240, 136, 0.15) 0%, rgba(180, 240, 166, 0.1) 100%);
  color: #000000;
  border: 1px solid rgba(86, 240, 136, 0.3);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  font-family: "SF Pro Text", sans-serif;
}

.card-details { display: flex; flex-direction: row; gap: 16px; flex-wrap: wrap; }

.detail-row { display: flex; align-items: center; gap: 4px; }
.detail-icon { width: 14px; height: 14px; color: #7F9A8C; }
.warm-card.active .detail-icon { color: #56F088; }

.detail-text { font-size: 12px; color: #5A6B5E; font-weight: 600; }

/* --- 操作按钮 --- */
.card-actions {
  display: flex; flex-direction: column; gap: 8px;
  opacity: 0; transform: translateX(10px);
  transition: all 0.3s ease;
  justify-content: center;
}
.warm-card:hover .card-actions { opacity: 1; transform: translateX(0); }

.action-btn {
  width: 32px; height: 32px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid transparent; cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.8);
}
.edit-btn { color: #56F088; border-color: rgba(86, 240, 136, 0.2); }
.edit-btn:hover { background: #56F088; color: white; box-shadow: 0 4px 10px rgba(86, 240, 136, 0.3); }
.delete-btn { color: #F87171; border-color: rgba(248, 113, 113, 0.2); }
.delete-btn:hover { background: #F87171; color: white; box-shadow: 0 4px 10px rgba(248, 113, 113, 0.3); }


/* ================== 温暖模态框系统 ================== */
.warm-modal-overlay {
  position: fixed; inset: 0;
  background: linear-gradient(135deg, rgba(30, 60, 45, 0.85) 0%, rgba(20, 45, 35, 0.95) 100%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0;
  z-index: 9999; backdrop-filter: blur(8px);
}

.warm-modal-panel {
  position: relative;
  width: 90%; max-width: 680px; max-height: 85vh;
  margin-top: 0;
  background: linear-gradient(180deg, #F0FFF4 0%, #E8FAED 100%);
  border: 1px solid rgba(86, 240, 136, 0.4);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(30, 60, 45, 0.3), inset 0 0 30px rgba(240, 255, 245, 0.5);
  display: flex; flex-direction: column; overflow: visible;
}

.warm-modal-panel.small-panel { max-width: 420px; }

/* 模态框头部 */
.warm-modal-header {
  position: relative; display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; z-index: 5;
  background: linear-gradient(90deg, rgba(86, 240, 136, 0.1) 0%, transparent 100%);
  border-bottom: 1px solid rgba(86, 240, 136, 0.2);
}
.warn-header { background: linear-gradient(90deg, rgba(248, 113, 113, 0.1) 0%, transparent 100%); border-color: rgba(248, 113, 113, 0.2); }

.header-title-group { display: flex; align-items: center; gap: 12px; }

.warm-icon { width: 22px; height: 22px; color: #56F088; }
.warn-icon { color: #F87171; }

.warm-modal-title { margin: 0; font-size: 18px; font-weight: 900; color: #2D4A3E; letter-spacing: 1px; font-family: "SF Pro Display", sans-serif;}

.warm-close-btn {
  background: transparent; border: 1px solid rgba(86, 240, 136, 0.2); color: #7F9A8C;
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  border-radius: 50%; cursor: pointer; transition: all 0.2s;
}
.warm-close-btn:hover { background: rgba(86, 240, 136, 0.1); color: #56F088; transform: rotate(90deg);}

.modal-handle-btn {
  position: absolute;
  right: -16px;
  top: 20px;
  z-index: 10;
  width: 28px; height: 28px;
}

/* 内容区 */
.warm-modal-content {
  flex: 1; padding: 16px; overflow-y: auto; z-index: 5;
}

/* --- 温暖表单 --- */
.warm-form { display: flex; flex-direction: column; gap: 18px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group-with-close { display: flex; flex-direction: column; gap: 8px; position: relative; }
.form-row { display: flex; gap: 20px; flex-wrap: wrap; }
.half-width { flex: 0.5; min-width: 80px; }

.inline-close-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #7F9A8C;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.inline-close-btn:hover { color: #F87171; }

.form-group label {
  font-size: 12px; font-weight: 700; color: #5A6B5E; letter-spacing: 0.5px;
}

.input-wrapper { position: relative; }
.input-wrapper input, .input-wrapper select {
  width: 100%; padding: 12px 36px 12px 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(86, 240, 136, 0.3);
  color: #2D4A3E; font-size: 14px; font-family: sans-serif;
  outline: none; transition: all 0.3s;
  border-radius: 12px;
}
.input-wrapper input:focus, .input-wrapper select:focus {
  background: #fff;
  border-color: rgba(86, 240, 136, 0.6);
  box-shadow: 0 0 15px rgba(86, 240, 136, 0.15);
}
/* 日期输入框样式 */
.input-wrapper input[type="date"] {
  color-scheme: light;
}
.warm-select option { background: #F0FFF4; color: #2D4A3E; }

/* 提示信息文本 */
.confirm-content { padding-top: 30px; padding-bottom: 30px; text-align: center; }
.sys-msg { font-size: 16px; font-weight: bold; color: #2D4A3E; margin-bottom: 15px; }
.sys-msg.error { color: #F87171; }
.sys-msg.success { color: #56F088; }
.warn-text { color: #56F088; }
.sub-text { color: #7F9A8C; font-size: 13px; line-height: 1.6; margin: 0;}
.center-content { display: flex; flex-direction: column; align-items: center; gap: 15px; }

/* --- 模态框底部操作 --- */
.warm-modal-footer {
  padding: 20px 24px; border-top: 1px solid rgba(86, 240, 136, 0.15);
  background: rgba(240, 255, 244, 0.5); z-index: 5;
  display: flex; justify-content: flex-end; gap: 12px;
}
.center-footer { justify-content: center; }

.warm-cancel-btn {
  background: transparent; border: 1px solid rgba(86, 240, 136, 0.3); color: #7F9A8C;
  padding: 10px 24px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;
  border-radius: 20px; cursor: pointer; transition: all 0.2s;
}
.warm-cancel-btn:hover { background: rgba(86, 240, 136, 0.1); color: #2D4A3E; border-color: rgba(86, 240, 136, 0.5);}

.warm-submit-btn {
  background: linear-gradient(135deg, #56F088 0%, #4ADE80 100%); border: none; color: white;
  padding: 10px 28px; font-size: 13px; font-weight: 800; letter-spacing: 0.5px;
  border-radius: 20px; cursor: pointer; transition: all 0.3s;
}
.warm-submit-btn:hover:not(:disabled) { background: linear-gradient(135deg, #4ADE80 0%, #3BCE73 100%); box-shadow: 0 4px 15px rgba(86, 240, 136, 0.4); }
.warm-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.warm-danger-btn {
  background: linear-gradient(135deg, #F87171 0%, #EF4444 100%); border: none; color: white;
  padding: 10px 28px; font-size: 13px; font-weight: 800; letter-spacing: 0.5px;
  border-radius: 20px; cursor: pointer; transition: all 0.3s;
}
.warm-danger-btn:hover { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); box-shadow: 0 4px 15px rgba(248, 113, 113, 0.4); }

.warm-submit-btn.success { background: linear-gradient(135deg, #56F088 0%, #4ADE80 100%); }
.warm-submit-btn.error { background: linear-gradient(135deg, #F87171 0%, #EF4444 100%); }

.message-icon { width: 48px; height: 48px; margin-bottom: 10px; }
.success-icon { color: #66BB6A; }
.error-icon { color: #EF5350; }

/* 动画 */
.warm-modal-enter-active, .warm-modal-leave-active { transition: opacity 0.3s ease; }
.warm-modal-enter-active .warm-modal-panel { animation: warm-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
.warm-modal-leave-active .warm-modal-panel { transform: scale(0.95); transition: transform 0.3s ease; }
.warm-modal-enter-from, .warm-modal-leave-to { opacity: 0; }

@keyframes warm-in {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@media (max-width: 1024px) {
  .parent-selector-container { height: auto; margin-bottom: 10px; position: relative; }
  .parent-list { max-height: 300px; }
  .card-actions { opacity: 1; transform: none; flex-direction: row;}
}

.pagination-arrows, .pagination-arrows-right {
  position: absolute;
  top: 68%;
  transform: translateY(-50%);
  z-index: 100;
}

.pagination-arrows { left: -1px; }
.pagination-arrows-right { right: 7px; }

.arrow-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 40px;
  background: rgba(86, 240, 136, 0.1);
  border: 1px solid rgba(86, 240, 136, 0.3);
  border-radius: 12px;
  color: #56F088;
  cursor: pointer;
  transition: all 0.3s ease;
}

.arrow-btn:hover:not(:disabled) {
  background: rgba(86, 240, 136, 0.2);
  box-shadow: 0 0 15px rgba(86, 240, 136, 0.3);
}

.arrow-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.arrow-btn svg {
  width: 18px;
  height: 18px;
}
</style>
