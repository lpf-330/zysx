<template>
  <Transition name="modal">
    <div v-if="showModal" class="modal-overlay" @click.self="handleClose">

      <div class="ambient-light light-green"></div>
      <div class="ambient-light light-green2"></div>

      <div class="full-modal">
        <svg class="leaf-decor top-right floating-slow" viewBox="0 0 24 24">
          <path fill="#81C784" d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
        </svg>
        <svg class="leaf-decor bottom-left floating-fast" viewBox="0 0 24 24">
          <path fill="#A5D6A7" d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
        </svg>

        <span class="star-decor s1">✨</span>
        <span class="star-decor s2">🌿</span>
        <span class="star-decor s3">✨</span>
        <span class="star-decor s4">🌿</span>
        <span class="star-decor s5">✨</span>

        <div class="modal-header">
          <div class="modal-title">
            <div class="icon-wrapper">
              <svg class="modal-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M16 17V19H2V17S2 13 9 13 16 17 16 17M12.5 7.5A3.5 3.5 0 1 0 9 11A3.5 3.5 0 0 0 12.5 7.5M23.44 11.45L18.15 16.74L15.32 13.91L16.74 12.5L18.15 13.91L22.03 10.04L23.44 11.45Z" />
              </svg>
            </div>
            <h4>{{ isEditing ? '编辑档案' : '新增档案' }}</h4>
          </div>
          <button class="close-modal-btn" @click="handleClose" title="关闭">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <el-form :model="formData" label-width="80px" class="profile-form">
            <el-form-item label="姓名">
              <el-input v-model="formData.username" placeholder="请输入姓名" />
            </el-form-item>

            <el-form-item label="性别">
              <el-radio-group v-model="formData.gender">
                <el-radio label="M">男</el-radio>
                <el-radio label="F">女</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="出生日期">
              <el-date-picker
                v-model="birthDateForDisplay"
                type="date"
                placeholder="选择出生日期"
                value-format="YYYY年MM月DD日"
                format="YYYY年MM月DD日"
                :max="today"
                :clearable="false"
                :editable="false"
                class="date-picker-cn"
              />
            </el-form-item>

            <el-form-item label="身高">
              <el-input-number
                v-model="formData.height"
                :min="0"
                :max="250"
                :step="1"
                controls-position="right"
              />
              <span class="unit">cm</span>
            </el-form-item>

            <el-form-item label="体重">
              <el-input-number
                v-model="formData.weight"
                :min="0"
                :max="200"
                :step="0.1"
                controls-position="right"
              />
              <span class="unit">kg</span>
            </el-form-item>

            <el-form-item label="联系电话">
              <el-input v-model="formData.phone" placeholder="请输入电话号码" />
            </el-form-item>
          </el-form>
        </div>

        <div class="modal-footer">
          <button class="footer-btn cancel-btn" @click="handleClose">取消</button>
          <button class="footer-btn submit-btn" @click="handleSubmit" :disabled="isSubmitting">
            <span class="btn-glow"></span>
            <span v-if="isSubmitting" class="loading-spinner"></span>
            <span>{{ isSubmitting ? '提交中...' : (isEditing ? '保存' : '确认新建') }}</span>
          </button>
        </div>

        <!-- 成功动画 -->
        <Transition name="fade">
          <div v-if="showSuccess" class="success-overlay">
            <div class="success-animation">
              <div class="success-ripple"></div>
              <svg class="checkmark" viewBox="0 0 52 52">
                <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
              <p class="success-text">{{ isEditing ? '档案更新成功' : '新建档案成功' }}</p>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import useChildUserStore from '../stores/childUser';
import { addChildParent, updateChildParent } from '../api/parentManagement';

const props = defineProps({
  showModal: Boolean,
  editId: Number
});

const emit = defineEmits(['close', 'success']);

const childUserStore = useChildUserStore();

const isEditing = ref(false);
const isSubmitting = ref(false);
const showSuccess = ref(false);
const birthDateForDisplay = ref('');

const today = computed(() => {
  const now = new Date();
  return now.toISOString().split('T')[0];
});

const formData = ref({
  username: '',
  birth_date: '',
  gender: 'M',
  height: null,
  weight: null,
  phone: '',
});

// 监听弹窗显示状态
watch(() => props.showModal, (newVal) => {
  if (newVal) {
    childUserStore.loadFromStorage();

    if (props.editId) {
      isEditing.value = true;
      const parent = childUserStore.parents.find(p => p.id === props.editId);
      if (parent) {
        formData.value = {
          username: parent.username || '',
          birth_date: parent.birthDate || '',
          gender: parent.gender === 'male' ? 'M' : (parent.gender === 'female' ? 'F' : 'M'),
          height: parent.height || null,
          weight: parent.weight || null,
          phone: parent.phone || '',
        };
        // 转换日期格式用于显示
        if (parent.birthDate) {
          const match = parent.birthDate.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
          if (match) {
            birthDateForDisplay.value = `${match[1]}年${parseInt(match[2])}月${parseInt(match[3])}日`;
          }
        }
      }
    } else {
      isEditing.value = false;
      formData.value = {
        username: '',
        birth_date: '',
        gender: 'M',
        height: null,
        weight: null,
        phone: '',
      };
      birthDateForDisplay.value = '';
    }
  }
});

// 监听日期选择器变化
watch(birthDateForDisplay, (newVal) => {
  if (newVal) {
    // 转换为后端格式
    formData.value.birth_date = newVal
      .replace(/年/g, '-')
      .replace(/月/g, '-')
      .replace(/日/g, '');
  } else {
    formData.value.birth_date = '';
  }
});

// 按ESC关闭
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.showModal) {
    handleClose();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

const handleClose = () => {
  emit('close');
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  if (!formData.value.username || !formData.value.birth_date || !formData.value.phone) {
    alert('请填写所有必填字段');
    return;
  }

  // 验证日期格式
  if (!formData.value.birth_date || formData.value.birth_date.length < 8) {
    alert('请填写完整的出生日期');
    return;
  }

  // 验证手机号
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(formData.value.phone)) {
    alert('请填写正确的手机号码');
    return;
  }

  isSubmitting.value = true;
  try {
    console.log('Submitting - isEditing:', isEditing.value, 'payload:', formData.value);
    console.log('child_id:', childUserStore.child_id);
    // 后端可能需要的字段格式
    const payload = {
      name: formData.value.username,
      phone: formData.value.phone,
      birthDate: formData.value.birth_date,
      gender: formData.value.gender,  // 发送 "M" 或 "F" 字符串
      height: formData.value.height || 0,
      weight: formData.value.weight || 0
    };
    console.log('API payload:', JSON.stringify(payload));
    console.log('API payload:', payload);
    let response;
    if (isEditing.value && props.editId) {
      response = await updateChildParent(childUserStore.child_id, props.editId, payload);
      if (response.code === 1) {
        console.log('API response:', response.data);
        // 如果后端没有返回更新后的数据，使用本地数据
        const updatedData = response.data && response.data.name
          ? {
              ...response.data,
              username: response.data.name || response.data.username
            }
          : {
              // 使用表单数据
              name: formData.value.username,
              birthDate: formData.value.birth_date,
              birth_date: formData.value.birth_date,
              gender: formData.value.gender === 'M' ? 'male' : 'female',
              genderValue: formData.value.gender,
              height: formData.value.height || 0,
              weight: formData.value.weight || 0,
              phone: formData.value.phone,
              username: formData.value.username
            };
        console.log('Updating parent with data:', updatedData);
        const updateIndex = childUserStore.parents.findIndex(p => p.id === props.editId);
        console.log('Index:', updateIndex);
        if (updateIndex >= 0) {
          childUserStore.updateParent(updateIndex, updatedData);
          console.log('Update successful');
        } else {
          console.error('Parent not found in store, trying to update directly');
          childUserStore.parents = childUserStore.parents.map(p =>
            p.id === props.editId ? { ...p, ...updatedData } : p
          );
          childUserStore.saveToStorage();
        }
        showSuccessAnimation();
      } else {
        throw new Error(response.msg || '更新失败');
      }
    } else {
      response = await addChildParent(childUserStore.child_id, payload);
      if (response.code === 1) {
        childUserStore.addParent(response.data);
        showSuccessAnimation();
      } else {
        throw new Error(response.msg || '创建失败');
      }
    }
  } catch (error) {
    alert(`错误: ${error.message || '未知错误'}`);
    isSubmitting.value = false;
  }
};

const showSuccessAnimation = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
    isSubmitting.value = false;
    emit('success');
  }, 1800);
};
</script>

<style scoped>
/* ==================== 遮罩层与氛围光 ==================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 30, 20, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

/* 动态弥散光 */
.ambient-light {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: floatAmbient 10s ease-in-out infinite alternate;
  pointer-events: none;
}

.light-green {
  width: 50vw; height: 50vw;
  background: #A5D6A7;
  top: -10%; left: -10%;
}

.light-green2 {
  width: 40vw; height: 40vw;
  background: #81C784;
  bottom: -10%; right: -10%;
  animation-delay: -3s;
}

@keyframes floatAmbient {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(50px, 30px) scale(1.2); }
}

/* ==================== 弹窗主体 ==================== */
.full-modal {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.95),
    rgba(220, 245, 220, 0.9),
    rgba(230, 250, 230, 0.9),
    rgba(220, 240, 225, 0.95));
  background-size: 300% 300%;
  animation: bgFlow 12s ease infinite;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 30px;
  width: 90%;
  max-width: 520px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset,
    0 20px 40px rgba(129, 199, 132, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

@keyframes bgFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 装饰动画 */
.leaf-decor {
  position: absolute;
  width: 70px;
  opacity: 0.4;
  pointer-events: none;
}
.leaf-decor.top-right { top: -15px; right: -10px; }
.leaf-decor.bottom-left { bottom: 80px; left: -15px; }

.floating-slow { animation: floatItem 6s ease-in-out infinite; }
.floating-fast { animation: floatItem 4s ease-in-out infinite reverse; }

@keyframes floatItem {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
}

.star-decor {
  position: absolute;
  font-size: 14px;
  opacity: 0.6;
  animation: twinkle 3s ease-in-out infinite;
  pointer-events: none;
}
.s1 { top: 10%; left: 5%; animation-delay: 0s; font-size: 18px; }
.s2 { top: 25%; right: 8%; animation-delay: 0.5s; }
.s3 { bottom: 40%; left: 8%; animation-delay: 1s; }
.s4 { bottom: 15%; right: 12%; animation-delay: 1.5s; font-size: 20px; }
.s5 { top: 15%; left: 40%; animation-delay: 2s; }

@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8) rotate(0deg); }
  50% { opacity: 0.8; transform: scale(1.2) rotate(15deg); }
}

/* ==================== 头部区 ==================== */
.modal-header {
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  border-bottom: 1px solid rgba(129, 199, 132, 0.2);
  background: linear-gradient(135deg, #81C784 0%, #66BB6A 30%, #4CAF50 70%, #43A047 100%);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-wrapper {
  width: 44px; height: 44px;
  background: linear-gradient(135deg, #A5D6A7, #81C784);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(129, 199, 132, 0.3);
  transform: rotate(-5deg);
  transition: transform 0.3s;
}
.full-modal:hover .icon-wrapper {
  transform: rotate(0deg) scale(1.05);
}

.modal-icon {
  width: 24px; height: 24px;
  color: white;
}

.modal-header h4 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #2E7D32;
}

.close-modal-btn {
  background: rgba(255,255,255,0.6);
  border: none;
  color: #8E9C8E;
  width: 36px; height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.close-modal-btn:hover {
  background: #FFEBEE;
  color: #E53935;
  transform: rotate(90deg);
}

/* ==================== 内容区与表单 ==================== */
.modal-content {
  padding: 24px 32px;
  flex: 1;
  overflow-y: auto;
}

.profile-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #424242;
}

.profile-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 0 0 1px #C8E6C9 inset;
  transition: all 0.3s ease;
}

.profile-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #81C784 inset;
}

.profile-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(129, 199, 132, 0.3), 0 0 0 1px #81C784 inset;
}

.profile-form :deep(.el-radio__input.is-checked .el-radio__inner) {
  background: #4CAF50;
  border-color: #4CAF50;
}

.profile-form :deep(.el-radio__label) {
  color: #424242;
}

.profile-form :deep(.el-input-number) {
  width: 100%;
}

.profile-form :deep(.el-input-number .el-input__wrapper) {
  border-radius: 12px;
}

.profile-form :deep(.el-date-editor.el-input) {
  width: 100%;
}

.unit {
  margin-left: 12px;
  color: #66BB6A;
  font-weight: 600;
  font-size: 14px;
}

/* ==================== 底部按钮 ==================== */
.modal-footer {
  padding: 20px 32px 32px;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.footer-btn {
  padding: 14px 32px;
  border-radius: 100px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-btn {
  background: transparent;
  border: 1px solid #A5D6A7;
  color: #66BB6A;
}
.cancel-btn:hover {
  background: rgba(165, 214, 167, 0.1);
  color: #4CAF50;
}

/* 高级流光按钮 */
.submit-btn {
  background: linear-gradient(135deg, #66BB6A, #4CAF50);
  border: none;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(76, 175, 80, 0.3);
}

.btn-glow {
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: left 0.6s ease;
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 25px rgba(76, 175, 80, 0.4);
}
.submit-btn:hover .btn-glow {
  left: 100%;
}

/* ==================== 成功动画 ==================== */
.success-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.success-animation {
  text-align: center;
  position: relative;
  margin-top: -0px;
}

.success-ripple {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 80px; height: 80px;
  background: #E8F5E9;
  border-radius: 50%;
  animation: rippleScale 1.5s ease-out infinite;
  z-index: -1;
}

@keyframes rippleScale {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}

.checkmark { width: 80px; height: 80px; }
.checkmark-circle {
  stroke: #4CAF50; stroke-width: 3;
  stroke-dasharray: 166; stroke-dashoffset: 166;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}
.checkmark-check {
  stroke: #4CAF50; stroke-width: 4;
  stroke-dasharray: 48; stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.5s forwards;
}

.success-text {
  margin-top: 20px;
  font-size: 22px;
  font-weight: 700;
  color: #4CAF50;
  animation: slideUp 0.5s ease backwards 0.8s;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes stroke {
  100% { stroke-dashoffset: 0; }
}

/* ==================== 弹窗过渡动画 ==================== */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.4s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .full-modal {
  animation: modalPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.modal-leave-active .full-modal {
  animation: modalPopOut 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes modalPop {
  0% { opacity: 0; transform: scale(0.9) translateY(40px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes modalPopOut {
  0% { opacity: 1; transform: scale(1) translateY(0); }
  100% { opacity: 0; transform: scale(0.95) translateY(20px); }
}

/* 渐隐动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 加载动画 */
.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
