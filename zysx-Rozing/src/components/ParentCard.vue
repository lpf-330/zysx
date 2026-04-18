<template>
  <div class="parent-selector-container">
    <!-- 标题区域 -->
    <div class="selector-header">
      <h2 class="section-title">监护对象</h2>
      <button class="add-btn" @click="openModal">
        <svg class="btn-icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
        </svg>
      </button>
    </div>
    
    <!-- 父母卡片列表 -->
    <div class="parent-list">
      <div 
        v-for="(parent, index) in parents" 
        :key="parent.id || index" 
        class="parent-card"
        :class="{ 'active': selectedParentIndex === index }"
        @click="selectParent(index)"
      >
        <div class="card-avatar">
          <img :src="defaultAvatar" alt="头像" class="avatar-img">
          <div class="status-indicator" :class="getStatusClass(parent.lastActive)"></div>
        </div>
        <div class="card-content">
          <div class="card-header">
            <h3 class="parent-name">{{ parent.username }}</h3>
            <div class="parent-age">{{ calculateAge(parent.birthDate) }}岁</div>
          </div>
          <div class="card-details">
            <div class="detail-row">
              <svg class="detail-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
              <span class="detail-text">{{ parent.gender === 'male' ? '男' : '女' }}</span>
            </div>
            <div class="detail-row">
              <svg class="detail-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M3,5A2,2 0 0,0 1,7V19A2,2 0 0,0 3,21H15A2,2 0 0,0 17,19V11H15V19H3V7H11V5H3M7,7H11V9H7V7M13,13V15H19V13H13M13,17V19H19V17H13M13,9V11H19V9H13Z" />
              </svg>
              <span class="detail-text">{{ formatDate(parent.birthDate) }}</span>
            </div>
            <div class="detail-row">
              <svg class="detail-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M13.5,4A1.5,1.5 0 0,0 12,5.5A1.5,1.5 0 0,0 13.5,7A1.5,1.5 0 0,0 15,5.5A1.5,1.5 0 0,0 13.5,4M13.67,8.54C10.94,9.2 9,11.83 9,15V16H18V15C18,11.83 16.06,9.2 13.33,8.54C13.1,8.48 12.9,8.44 12.67,8.46C12.5,8.47 12.33,8.5 12,8.5C11.67,8.5 11.5,8.47 11.33,8.46C11.1,8.44 10.9,8.48 10.67,8.54C7.94,9.2 6,11.83 6,15V16H3V17C3,18.11 3.9,19 5,19H19C20.11,19 21,18.11 21,17V16H18V15C18,11.83 16.06,9.2 13.33,8.54C13.56,8.48 13.76,8.46 13.67,8.54Z" />
              </svg>
              <span class="detail-text">{{ parent.height }}cm / {{ parent.weight }}kg</span>
            </div>
          </div>
        </div>
        <!-- 卡片操作按钮 -->
        <div class="card-actions">
          <button class="edit-btn" @click.stop="openModal(index)">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25M18.18,8.63L20.71,6.1L19,4.39L16.47,6.92L18.18,8.63M14.06,6.18L17.81,9.93L19.5,8.25L15.75,4.5L14.06,6.18Z" />
            </svg>
          </button>
          <button class="delete-btn" @click.stop="confirmDelete(index)">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M19,4H15.5L14.5,3H10.5L9.5,4H6V6H19M7,18A2,2 0 0,0 9,20H15A2,2 0 0,0 17,18V8H7V18M9,10V18H15V10H9Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 操作确认模态框 -->
    <Transition name="modal">
      <div v-if="showConfirmModal" class="modal-overlay" @click.self="closeConfirmModal">
        <div class="confirm-modal">
          <div class="modal-header">
            <h3>确认操作</h3>
            <button class="close-modal-btn" @click="closeConfirmModal">×</button>
          </div>
          <div class="modal-content">
            <p>确定要删除这个监护对象吗？此操作不可撤销。</p>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" @click="closeConfirmModal">取消</button>
            <button class="confirm-delete-btn" @click="deleteParent">确认删除</button>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- 添加/编辑父母模态框 -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="add-modal">
          <div class="modal-header">
            <h3>{{ isEditing ? '编辑监护对象' : '添加监护对象' }}</h3>
            <button class="close-modal-btn" @click="closeModal">×</button>
          </div>
          <div class="modal-content">
            <form @submit.prevent="saveParent" class="add-form">
              <div class="form-group">
                <label>姓名</label>
                <input v-model="currentParent.username" type="text" placeholder="输入姓名" required>
              </div>
              <div class="form-group">
                <label>出生日期</label>
                <input v-model="currentParent.birth_date" type="date" required>
              </div>
              <div class="form-row">
                <div class="form-group half-width">
                  <label>性别</label>
                  <select v-model="currentParent.gender" required>
                    <option value="M">男</option>
                    <option value="F">女</option>
                  </select>
                </div>
                <div class="form-group half-width">
                  <label>身高(cm)</label>
                  <input v-model.number="currentParent.height" type="number" placeholder="身高" required>
                </div>
                <div class="form-group half-width">
                  <label>体重(kg)</label>
                  <input v-model.number="currentParent.weight" type="number" placeholder="体重" required>
                </div>
              </div>
              <div class="form-group">
                <label>电话号码</label>
                <input v-model="currentParent.phone" type="tel" placeholder="输入电话号码" required>
              </div>
              <button type="submit" class="submit-btn" :disabled="isSubmitting">{{ isSubmitting ? '提交中...' : (isEditing ? '保存修改' : '添加监护对象') }}</button>
            </form>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 成功/错误提示模态框 -->
    <Transition name="modal">
      <div v-if="showMessageModal" class="modal-overlay" @click.self="closeMessageModal">
        <div class="message-modal">
          <div class="message-header" :class="messageModalType">
            <h3>{{ messageModalType === 'success' ? '成功' : '错误' }}</h3>
            <button class="close-modal-btn" @click="closeMessageModal">×</button>
          </div>
          <div class="modal-content">
            <p>{{ messageModalText }}</p>
          </div>
          <div class="modal-footer">
            <button class="confirm-btn" @click="closeMessageModal">确定</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import useChildUserStore from '../stores/childUser'; // 引入store
import { storeToRefs } from 'pinia';
import { addChildParent, updateChildParent, deleteChildParent } from '../api/parentManagement'; // 导入API函数

const defaultAvatar = ref('https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=200&h=200');

// 使用store
const childUserStore = useChildUserStore();
const { parents, selectedParentIndex } = storeToRefs(childUserStore); // 使用 storeToRefs 获取响应式引用

// 模态框状态
const showModal = ref(false);
const showConfirmModal = ref(false);
const isEditing = ref(false);
const currentParentIndex = ref(-1);
const isSubmitting = ref(false); // 添加提交状态

// 消息提示模态框状态
const showMessageModal = ref(false);
const messageModalText = ref('');
const messageModalType = ref(''); // 'success' 或 'error'

// 当前编辑的监护对象
const currentParent = ref({
  username: '',
  birth_date: '',
  gender: 'M',
  height: null,
  weight: null,
  phone: '',
});

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
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
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
  // 通知父组件，传递选中的父母对象
  const selectedParentData = parents.value[index];
  if (selectedParentData) {
    emit('parent-selected', selectedParentData, index);
  }
};

// 暴露给父组件的方法
defineExpose({
  selectFirstParent: () => {
    if (parents.value && parents.value.length > 0) {
      selectParent(0); // 选中第一个父母
      return true;
    }
    return false;
  },
  hasParents: computed(() => parents.value && parents.value.length > 0)
});

const openModal = (index = null) => {
  if (typeof index === 'number' && index >= 0) {
    // 编辑模式
    isEditing.value = true;
    currentParentIndex.value = index;
    const parentData = parents.value[index];
    currentParent.value = {
      ...parentData,
      birth_date: parentData.birthDate || '', 
      gender: parentData.gender === 'male' ? 'M' : (parentData.gender === 'female' ? 'F' : 'M') 
    };
  } else {
    // 添加模式
    isEditing.value = false;
    currentParentIndex.value = -1;
    currentParent.value = {
      username: '',
      birth_date: '', 
      gender: 'M',  
      height: null,
      weight: null,
      phone: '',
    };
  }
  showModal.value = true;
};

// 关闭模态框
const closeModal = () => {
  showModal.value = false;
  isSubmitting.value = false; // 关闭时重置提交状态
};

// 关闭确认模态框
const closeConfirmModal = () => {
  showConfirmModal.value = false;
};

// 关闭消息提示模态框
const closeMessageModal = () => {
  showMessageModal.value = false;
  messageModalText.value = '';
  messageModalType.value = '';
};

// 确认删除
const confirmDelete = (index) => {
  currentParentIndex.value = index;
  showConfirmModal.value = true;
};

// 保存监护对象 (添加或编辑)
const saveParent = async () => {
  if (isSubmitting.value) return; // 防止重复提交
  isSubmitting.value = true;

  try {
    const payload = {
      ...currentParent.value,
    };

    let response;
    if (isEditing.value) {
      // 更新现有监护对象
      response = await updateChildParent(childUserStore.child_id, parents.value[currentParentIndex.value].id, payload);
      if (response.code === 1) {
        // 成功后更新 store
        childUserStore.updateParent(currentParentIndex.value, response.data);
        console.log('监护对象更新成功');
        showMessage('监护对象更新成功', 'success');
        closeModal();
      } else {
        throw new Error(response.msg || '更新失败');
      }
    } else {
      // 添加新监护对象
      response = await addChildParent(childUserStore.child_id, payload);
      if (response.code === 1) {
        // 成功后更新 store
        childUserStore.addParent(response.data);
        console.log('监护对象添加成功');
        showMessage('监护对象添加成功', 'success');
        closeModal();
      } else {
        throw new Error(response.msg || '添加失败');
      }
    }
  } catch (error) {
    console.error('保存监护对象时出错:', error);
    showMessage(`操作失败: ${error.message || '未知错误'}`, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// 删除监护对象
const deleteParent = async () => {
  if (currentParentIndex.value < 0) return;
  const parentIdToDelete = parents.value[currentParentIndex.value].id;

  try {
    const response = await deleteChildParent(childUserStore.child_id, parentIdToDelete);
    if (response.code === 1) {
      // 成功后更新 store
      childUserStore.deleteParent(currentParentIndex.value);
      console.log('监护对象删除成功');
      showMessage('监护对象删除成功', 'success');
      closeConfirmModal();
    } else {
      throw new Error(response.msg || '删除失败');
    }
  } catch (error) {
    console.error('删除监护对象时出错:', error);
    showMessage(`删除失败: ${error.message || '未知错误'}`, 'error');
  }
};

// 显示消息提示
const showMessage = (text, type) => {
  messageModalText.value = text;
  messageModalType.value = type;
  showMessageModal.value = true;
};

// 发出事件
const emit = defineEmits(['parent-selected']);

// 组件挂载时从store加载数据
onMounted(() => {
  childUserStore.loadFromStorage();
});
</script>

<style scoped>
.parent-selector-container {
  width: 100%;
  border-radius: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e6f2ff 100%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 标题区域 */
.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(49, 139, 255);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.4);
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.6);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

/* 父母卡片列表 */
.parent-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 8px;
}

.parent-list::-webkit-scrollbar {
  width: 6px;
}

.parent-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.parent-list::-webkit-scrollbar-thumb {
  background: #007AFF;
  border-radius: 10px;
}

/* 父母卡片 */
.parent-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  min-height: 120px;
}

.parent-card:hover {
  transform: translateX(4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  border-color: #007AFF;
}

.parent-card.active {
  border-color: #007AFF;
  background: linear-gradient(145deg, #e6f7ff, #ccf0ff);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.2);
}

.parent-card.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #007AFF, transparent);
}

/* 卡片操作按钮 */
.card-actions {
  position: absolute;
  bottom: 10px;
  right: 16px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.parent-card:hover .card-actions {
  opacity: 1;
}

.edit-btn, .delete-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.edit-btn:hover {
  background: rgba(0, 122, 255, 0.2);
  transform: scale(1.1);
}

.delete-btn {
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
}

.delete-btn:hover {
  background: rgba(255, 68, 68, 0.2);
  transform: scale(1.1);
}

/* 头像区域 */
.card-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e0e0e0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.status-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.online {
  background-color: #52c41a;
  box-shadow: 0 0 6px #52c41a;
}

.status-indicator.recently {
  background-color: #faad14;
  box-shadow: 0 0 6px #faad14;
}

.status-indicator.offline {
  background-color: #bfbfbf;
}

/* 卡片内容 */
.card-content {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.parent-name {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.parent-age {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 13px;
  color: #7f8c8d;
  font-weight: 600;
}

/* 卡片详情 */
.card-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
}

.detail-icon {
  width: 16px;
  height: 16px;
  color: #007AFF;
  flex-shrink: 0;
}

.detail-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

/* 模态框样式 */
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
  backdrop-filter: blur(5px);
}

.add-modal {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
}

.confirm-modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  animation: modal-pop 0.3s ease-out;
}

@keyframes modal-pop {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgb(49, 139, 255);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.modal-header.error {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
}

.modal-header.success {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.close-modal-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-modal-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.3);
}

.modal-content {
  padding: 24px;
  max-height: calc(85vh - 120px);
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
}

.cancel-btn {
  background: #f0f0f0;
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.confirm-delete-btn {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.confirm-delete-btn:hover {
  background: #e53935;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.4);
}

/* 消息提示模态框 */
.message-modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  animation: modal-pop 0.3s ease-out;
}

.message-modal .modal-header {
  /* 会根据 messageModalType 动态应用 success 或 error 类 */
}

.message-header {
  height: 0.1rem;
  margin-left: 0.15rem;
}

.message-modal .modal-footer {
  display: flex;
  justify-content: center;
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
}

.confirm-btn {
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 10px 30px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.confirm-btn:hover {
  background: #0056cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
}

/* 表单样式 */
.add-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #d9d9d9;
  background: white;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.half-width {
  flex: 1 0 calc(50% - 5px);
  min-width: 140px;
}

.submit-btn {
  background: rgb(49, 139, 255);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.4);
  transition: all 0.3s ease;
  align-self: center;
  width: 100%;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.6);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.2);
}

/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.4s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .parent-selector-container {
    height: auto;
    margin-bottom: 20px;
  }
  
  .parent-list {
    max-height: 300px;
  }
  
  .card-actions {
    position: relative;
    right: auto;
    top: auto;
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    opacity: 1;
  }
}
</style>