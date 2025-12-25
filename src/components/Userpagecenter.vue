<template>
  <el-button type="primary" class="Edit" @click="openDrawer" :icon="Edit" title="编辑"></el-button>
  <el-drawer v-model="drawer" title="I am the title" :with-header="false" size="4.5rem">
    <div class="personal-info-container">
      <div class="info-card-header">
        <div class="header">
          <h2>基本信息</h2>
        </div>
        <div class="content">
          <div class="info-item">
            <label>姓名:</label>
            <input v-model="tempUserData.Username" type="text" id="input1" />
          </div>
          <div class="info-item">
            <label>性别:</label>
            <select v-model="tempUserData.gender" id="select1" class="gender">
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <div class="info-item">
            <label>年龄:</label>
            <input v-model.number="tempCalculatedAge" id="input2" />
          </div>
          <div class="info-item">
            <label>手机号:</label>
            <input v-model="tempUserData.phone_number" type="tel" id="input3" />
          </div>
          <div class="info-item">
            <label>身高:</label>
            <input v-model="tempUserData.Height" placeholder="cm" id="input4" />
          </div>
          <div class="info-item">
            <label>体重:</label>
            <input v-model="tempUserData.Weight" placeholder="kg" id="input5" />
          </div>
        </div>
      </div>
      <div class="decoration"></div>
      <div class="info-card-header">
        <div class="header">
          <h2>医疗信息</h2>
        </div>
        <div class="medical-content">
          <!-- 家族遗传病史 - 增强自动补全 -->
          <div class="info-item">
            <label>家族遗传病史:</label>
            <textarea 
              ref="family_history_ref"
              v-model="tempMedicalData.family_history" 
              placeholder="请输入家族遗传病史"
              @input="handleInput('family_history', $event)"
              @keydown.tab="handleTab('family_history', $event)"
              @keydown.esc="hideSuggestions('family_history')"
              class="medical-textarea"
            ></textarea>
            <div class="suggestions-container family_history" v-if="showSuggestions.family_history">
              <div 
                v-for="(suggestion, index) in filteredSuggestions.family_history" 
                :key="index"
                :class="['suggestion-item', { active: activeIndex.family_history === index }]"
                @click="selectSuggestion('family_history', suggestion)"
              >
                {{ suggestion }}
              </div>
            </div>
          </div>
          
          <!-- 过敏史 - 增强自动补全 -->
          <div class="info-item">
            <label>过敏史:</label>
            <textarea 
              ref="allergy_history_ref"
              v-model="tempMedicalData.allergy_history" 
              placeholder="请输入过敏史"
              @input="handleInput('allergy_history', $event)"
              @keydown.tab="handleTab('allergy_history', $event)"
              @keydown.esc="hideSuggestions('allergy_history')"
              class="medical-textarea"
            ></textarea>
            <div class="suggestions-container allergy_history" v-if="showSuggestions.allergy_history">
              <div 
                v-for="(suggestion, index) in filteredSuggestions.allergy_history" 
                :key="index"
                :class="['suggestion-item', { active: activeIndex.allergy_history === index }]"
                @click="selectSuggestion('allergy_history', suggestion)"
              >
                {{ suggestion }}
              </div>
            </div>
          </div>
          
          <!-- 既往病史 - 增强自动补全 -->
          <div class="info-item">
            <label>既往病史:</label>
            <textarea 
              ref="past_medical_history_ref"
              v-model="tempMedicalData.past_medical_history" 
              placeholder="请输入既往病史"
              @input="handleInput('past_medical_history', $event)"
              @keydown.tab="handleTab('past_medical_history', $event)"
              @keydown.esc="hideSuggestions('past_medical_history')"
              class="medical-textarea"
            ></textarea>
            <div class="suggestions-container past_medical_history" v-if="showSuggestions.past_medical_history">
              <div 
                v-for="(suggestion, index) in filteredSuggestions.past_medical_history" 
                :key="index"
                :class="['suggestion-item', { active: activeIndex.past_medical_history === index }]"
                @click="selectSuggestion('past_medical_history', suggestion)"
              >
                {{ suggestion }}
              </div>
            </div>
          </div>
          
          <!-- 手术史 - 增强自动补全 -->
          <div class="info-item">
            <label>手术史:</label>
            <textarea 
              ref="surgical_history_ref"
              v-model="tempMedicalData.surgical_history" 
              placeholder="请输入手术史"
              @input="handleInput('surgical_history', $event)"
              @keydown.tab="handleTab('surgical_history', $event)"
              @keydown.esc="hideSuggestions('surgical_history')"
              class="medical-textarea"
            ></textarea>
            <div class="suggestions-container surgical_history" v-if="showSuggestions.surgical_history">
              <div 
                v-for="(suggestion, index) in filteredSuggestions.surgical_history" 
                :key="index"
                :class="['suggestion-item', { active: activeIndex.surgical_history === index }]"
                @click="selectSuggestion('surgical_history', suggestion)"
              >
                {{ suggestion }}
              </div>
            </div>
          </div>
          
          <!-- 用药依从性记录 - 增强自动补全 -->
          <div class="info-item">
            <label>用药依从性记录:</label>
            <textarea 
              ref="medication_compliance_ref"
              v-model="tempMedicalData.medication_compliance" 
              placeholder="请输入用药依从性记录"
              @input="handleInput('medication_compliance', $event)"
              @keydown.tab="handleTab('medication_compliance', $event)"
              @keydown.esc="hideSuggestions('medication_compliance')"
              class="medical-textarea"
            ></textarea>
            <div class="suggestions-container medication_compliance" v-if="showSuggestions.medication_compliance">
              <div 
                v-for="(suggestion, index) in filteredSuggestions.medication_compliance" 
                :key="index"
                :class="['suggestion-item', { active: activeIndex.medication_compliance === index }]"
                @click="selectSuggestion('medication_compliance', suggestion)"
              >
                {{ suggestion }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="operation">
      <el-button class="cancel" @click="cancelClick">取消</el-button>
      <el-button class="confirm" type="primary" @click="confirmClick">保存</el-button>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { Edit } from '@element-plus/icons-vue';
import axios from 'axios';
import useUserInfoStore from '../stores/user';
import useMedicalHistoryStore from '../stores/medicalHistory';
import { storeToRefs } from 'pinia';
import medicalTerms from '@/utils/medicalTerms'; // 导入医学术语库
import { saveUserHealthProfile } from '@/api/user';
import { ElMessage } from 'element-plus';

// 导入 getCurrentInstance
import { getCurrentInstance } from 'vue';

// 保留原有所有逻辑
const drawer = ref(false);

// 临时数据存储 - 修复编辑实时更新问题
const tempUserData = ref({
  Username: '',
  gender: '', // 直接存储 'male'/'female'
  Age: '',
  phone_number: '',
  Height: '',
  Weight: ''
});

const tempMedicalData = ref({
  family_history: '',
  allergy_history: '',
  past_medical_history: '',
  surgical_history: '',
  medication_compliance: ''
});

// 临时计算年龄
const tempCalculatedAge = computed({
  get() {
    if (!tempUserData.value.Age) return '';
    const birthDate = new Date(tempUserData.value.Age);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
  },
  set(value) {
    // 从年龄反推出生日期
    if (!value || isNaN(value)) return;
    const today = new Date();
    const birthYear = today.getFullYear() - value;
    // 设置为当年1月1日
    tempUserData.value.Age = new Date(birthYear, 0, 1).toISOString().split('T')[0];
  }
});

// 为每个 textarea 创建 refs
const family_history_ref = ref(null);
const allergy_history_ref = ref(null);
const past_medical_history_ref = ref(null);
const surgical_history_ref = ref(null);
const medication_compliance_ref = ref(null);

// 用于通过字段名获取对应的 ref
const getTextAreaRef = (field) => {
  switch(field) {
    case 'family_history': return family_history_ref;
    case 'allergy_history': return allergy_history_ref;
    case 'past_medical_history': return past_medical_history_ref;
    case 'surgical_history': return surgical_history_ref;
    case 'medication_compliance': return medication_compliance_ref;
    default: return null;
  }
};

// 获取 stores
const userInfoStore = useUserInfoStore();
const medicalHistoryStore = useMedicalHistoryStore();
const { user_id } = storeToRefs(userInfoStore);

// 打开抽屉时加载当前数据到临时变量
const openDrawer = () => {
  // 重置临时数据
  tempUserData.value = {
    Username: userInfoStore.Username,
    gender: userInfoStore.gender,
    Age: userInfoStore.Age,
    phone_number: userInfoStore.phone_number,
    Height: userInfoStore.Height,
    Weight: userInfoStore.Weight
  };
  
  tempMedicalData.value = {
    family_history: medicalHistoryStore.family_history,
    allergy_history: medicalHistoryStore.allergy_history,
    past_medical_history: medicalHistoryStore.past_medical_history,
    surgical_history: medicalHistoryStore.surgical_history,
    medication_compliance: medicalHistoryStore.medication_compliance
  };
  
  // 重置建议面板
  Object.keys(showSuggestions).forEach(field => {
    hideSuggestions(field);
  });
  
  drawer.value = true;
};

function cancelClick() {
  // 隐藏所有建议面板
  Object.keys(showSuggestions).forEach(field => {
    hideSuggestions(field);
  });
  drawer.value = false;
}

//保存用户的健康档案
const fetchUserpagecenterdata = async () => {
try {
    const userData = {
      id: user_id.value,
      username: tempUserData.value.Username,
      gender: tempUserData.value.gender,
      phone: tempUserData.value.phone_number,
      height: tempUserData.value.Height,
      weight: tempUserData.value.Weight,
      family_history: tempMedicalData.value.family_history,
      allergy_history: tempMedicalData.value.allergy_history,
      past_medical_history: tempMedicalData.value.past_medical_history,
      surgical_history: tempMedicalData.value.surgical_history,
      medical_compliance: tempMedicalData.value.medication_compliance
    };
    
    const result = await saveUserHealthProfile(userData);
    console.log('保存成功', result);
  } catch (error) {
    console.error("保存出错", error);
  }
};

// =============== 修正：医学术语自动补全功能 ===============
// 自动补全状态
const showSuggestions = reactive({
  family_history: false,
  allergy_history: false,
  past_medical_history: false,
  surgical_history: false,
  medication_compliance: false
});

const filteredSuggestions = reactive({
  family_history: [],
  allergy_history: [],
  past_medical_history: [],
  surgical_history: [],
  medication_compliance: [],
});

const activeIndex = reactive({
  family_history: 0,
  allergy_history: 0,
  past_medical_history: 0,
  surgical_history: 0,
  medication_compliance: 0
});

const lastCursorPos = reactive({
  family_history: 0,
  allergy_history: 0,
  past_medical_history: 0,
  surgical_history: 0,
  medication_compliance: 0
});

// 修复：使用临时医疗数据
const getMedicalField = (field) => {
  return tempMedicalData.value[field];
};

const setMedicalField = (field, value) => {
  tempMedicalData.value[field] = value;
};

// 处理输入事件
const handleInput = (field, event) => {
  const textareaRef = getTextAreaRef(field);
  if (!textareaRef || !textareaRef.value) return;
  
  const textarea = textareaRef.value;
  lastCursorPos[field] = textarea.selectionStart;
  
  // 获取光标前的文本
  const textBeforeCursor = textarea.value.substring(0, lastCursorPos[field]);
  
  // 提取光标前最后一个中文词（2-8个字符）
  const lastWordMatch = textBeforeCursor.match(/[\u4e00-\u9fa5]{2,8}$/);
  
  if (lastWordMatch && lastWordMatch[0].length >= 2) {
    const searchTerm = lastWordMatch[0];
    filterSuggestions(field, searchTerm);
  } else {
    hideSuggestions(field);
  }
};

// 过滤建议
const filterSuggestions = (field, searchTerm) => {
  const terms = medicalTerms[field] || [];
  filteredSuggestions[field] = terms.filter(term => 
    term.includes(searchTerm) && term !== searchTerm
  ).slice(0, 5);
  
  showSuggestions[field] = filteredSuggestions[field].length > 0;
  activeIndex[field] = 0;
};

// 隐藏建议
const hideSuggestions = (field) => {
  showSuggestions[field] = false;
  filteredSuggestions[field] = [];
};

// 选择建议
const selectSuggestion = async (field, suggestion) => {
  const textareaRef = getTextAreaRef(field);
  if (!textareaRef || !textareaRef.value) return;
  
  const textarea = textareaRef.value;
  const cursorPos = lastCursorPos[field];
  const textBefore = textarea.value.substring(0, cursorPos);
  const textAfter = textarea.value.substring(cursorPos);
  
  // 替换最后一个中文词
  const newTextBefore = textBefore.replace(/[\u4e00-\u9fa5]{2,8}$/, '');
  const newValue = newTextBefore + suggestion + textAfter;
  
  // 更新临时数据（不直接影响store）
  setMedicalField(field, newValue);
  
  // 等待 DOM 更新
  await nextTick();
  
  // 设置新光标位置
  const newCursorPos = newTextBefore.length + suggestion.length;
  setTimeout(() => {
    if (textarea) {
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }
    hideSuggestions(field);
  }, 0);
};

// 处理Tab键
const handleTab = (field, event) => {
  if (showSuggestions[field] && filteredSuggestions[field].length > 0) {
    event.preventDefault();
    selectSuggestion(field, filteredSuggestions[field][activeIndex[field]]);
  }
};

// 定义全局事件处理函数
function handleDocumentClick(e) {
  const instance = getCurrentInstance();
  if (!instance || !instance.proxy || !instance.proxy.drawer?.value) return;
  
  // 检查是否点击了建议项
  if (e.target.closest('.suggestion-item')) {
    return;
  }
  
  const fields = ['family_history', 'allergy_history', 'past_medical_history', 'surgical_history', 'medication_compliance'];
  
  fields.forEach(field => {
    const textareaRef = instance.proxy[`${field}_ref`];
    const textarea = textareaRef?.value;
    
    if (!textarea) return;
    
    // 检查是否点击了 textarea 或其建议面板
    const suggestionsContainer = document.querySelector(`.suggestions-container.${field}`);
    const clickedOnTextarea = textarea.contains(e.target);
    const clickedOnSuggestions = suggestionsContainer && suggestionsContainer.contains(e.target);
    
    if (!clickedOnTextarea && !clickedOnSuggestions) {
      instance.proxy.hideSuggestions(field);
    }
  });
}

function handleKeydown(e) {
  const instance = getCurrentInstance();
  if (!instance || !instance.proxy || !instance.proxy.drawer?.value) return;
  
  // 找出当前有建议的字段
  const activeField = Object.keys(instance.proxy.showSuggestions).find(field => 
    instance.proxy.showSuggestions[field]
  );
  
  if (!activeField || !instance.proxy.filteredSuggestions[activeField].length) return;
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    instance.proxy.activeIndex[activeField] = 
      (instance.proxy.activeIndex[activeField] + 1) % instance.proxy.filteredSuggestions[activeField].length;
  } 
  else if (e.key === 'ArrowUp') {
    e.preventDefault();
    instance.proxy.activeIndex[activeField] = 
      (instance.proxy.activeIndex[activeField] - 1 + instance.proxy.filteredSuggestions[activeField].length) % 
      instance.proxy.filteredSuggestions[activeField].length;
  }
  else if (e.key === 'Enter' && instance.proxy.showSuggestions[activeField]) {
    e.preventDefault();
    instance.proxy.selectSuggestion(activeField, instance.proxy.filteredSuggestions[activeField][instance.proxy.activeIndex[activeField]]);
  }
};

async function confirmClick() {
  // 隐藏所有建议面板
  Object.keys(showSuggestions).forEach(field => {
    hideSuggestions(field);
  });
  
  try {
    // 调用保存API
    await fetchUserpagecenterdata();
    
    // 保存成功后更新store
    userInfoStore.Username = tempUserData.value.Username;
    userInfoStore.gender = tempUserData.value.gender;
    userInfoStore.Age = tempUserData.value.Age;
    userInfoStore.phone_number = tempUserData.value.phone_number;
    userInfoStore.Height = tempUserData.value.Height;
    userInfoStore.Weight = tempUserData.value.Weight;
    
    medicalHistoryStore.family_history = tempMedicalData.value.family_history;
    medicalHistoryStore.allergy_history = tempMedicalData.value.allergy_history;
    medicalHistoryStore.past_medical_history = tempMedicalData.value.past_medical_history;
    medicalHistoryStore.surgical_history = tempMedicalData.value.surgical_history;
    medicalHistoryStore.medication_compliance = tempMedicalData.value.medication_compliance;
    
    // 显示成功消息提示
    ElMessage({
      message: '健康档案保存成功！',
      type: 'success',
      customClass: 'custom-message',
      duration: 3000,
      showClose: true,
      offset: 80 // 距离顶部的偏移量
    });
    
    drawer.value = false;
  } catch (error) {
    console.error("保存失败", error);
    
    // 显示错误消息提示
    ElMessage({
      message: '保存失败，请稍后再试。',
      type: 'error',
      customClass: 'custom-message',
      duration: 4000,
      showClose: true,
      offset: 80
    });
  }
}

// 使用安全的方式来管理事件监听
onMounted(() => {
  // 确保安全地添加事件监听
  try {
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeydown);
  } catch (error) {
    console.error('添加事件监听失败', error);
  }
});

onUnmounted(() => {
  // 安全地移除事件监听
  try {
    document.removeEventListener('click', handleDocumentClick);
    document.removeEventListener('keydown', handleKeydown);
  } catch (error) {
    console.error('移除事件监听失败', error);
  }
});
</script>

<style scoped>
/* 保留所有原有样式不变 */
.Edit {
  position: absolute;
  width: 0.35rem;
  height: 0.25rem;
  top: 1.2rem;
  left: 8.4rem;
}

.Edit :deep(.el-icon) {
  font-size: 0.13rem;
}

.personal-info-container {
  background-color: #f8fbfe;
  border-radius: 0.15rem;
  box-shadow: 0 4px 20px rgba(23, 113, 187, 0.08);
  max-width: 100%;
  margin: auto;
  font-family: 'FanYuanTi';
}

.decoration {
  margin: auto;
  width: 98%;
  height: 0.04rem;
  border-radius: 0.1rem;
  background-color: #64abf2;
  margin-bottom: 0.1rem;
  box-shadow: 0 4px 20px rgba(23, 113, 187, 0.08);
}

.info-card-header {
  margin-bottom: 0.1rem;
  background: white;
  border-radius: 0.1rem;
  padding: 0.15rem;
  border: 0.01rem solid #64abf2;
  box-shadow: 0 0.025rem 0.1rem rgba(23, 113, 187, 0.06);
}

.header {
  color: #3d97e1;
  padding-bottom: 0.08rem;
  margin-bottom: 0.1rem;
  border-bottom: 0.025rem solid #e3e4e4;
}

.header h2 {
  font-size: 0.13rem;
  font-weight: 650;
  margin: 0;
}

.content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.05rem 0.15rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.08rem;
  position: relative; /* 为建议面板定位 */
}

.info-item label {
  color: #4a6c8d;
  font-size: 0.1rem;
  margin-bottom: 0.05rem;
  font-weight: 530;
}

input,
select {
  width: 1.5rem;
  height: 0.05rem;
  padding: 0.1rem 0.1rem;
  border: 1px solid #d3e3f4;
  border-radius: 0.06rem;
  font-family: 'FanYuanTi';
  font-size: 0.1rem;
  transition: all 0.3s ease;
  background-color: #f8fbfe;
}

input:focus,
select:focus {
  outline: none;
  border-color: #7ab8ff;
  box-shadow: 0 0 0 3px rgba(122, 184, 255, 0.1);
}

.medical-textarea {
  width: 100%;
  height: 0.6rem;
  resize: vertical;
  padding: 0.05rem 0.05rem;
  border: 1px solid #d3e3f4;
  border-radius: 0.06rem;
  font-family: 'FanYuanTi';
  font-size: 0.09rem;
  transition: all 0.3s ease;
  background-color: #f8fbfe;
  box-sizing: border-box;
}

.medical-textarea:focus {
  outline: none;
  border-color: #7ab8ff;
  box-shadow: 0 0 0 3px rgba(122, 184, 255, 0.1);
}

.suggestions-container {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 0.05rem);
  background: white;
  border: 1px solid #d3e3f4;
  border-radius: 0.06rem;
  box-shadow: 0 0.05rem 0.15rem rgba(0, 0, 0, 0.1);
  z-index: 2000 !important; /* 确保在最上层 */
  max-height: 1.2rem;
  overflow-y: auto;
  font-family: 'FanYuanTi';
  font-size: 0.09rem;
}

.suggestion-item {
  padding: 0.08rem 0.1rem; /* 增加点击区域 */
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item.active {
  background-color: #eef5ff;
  color: #3d97e1;
}

/* 滚动条样式 */
.suggestions-container::-webkit-scrollbar {
  width: 0.04rem;
}
.suggestions-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 0.02rem;
}
.suggestions-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 0.02rem;
}
.suggestions-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234a6c8d'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.08rem center;
  background-size: 0.13rem;
}

.gender {
  padding: 0.03rem 0.75rem;
  height: 0.26rem;
  width: 1.71rem;
}

.operation {
  display: flex;
  gap: 0.1rem;
  justify-content: center;
  margin-top: 0.15rem;
}

.cancel {
  width: 0.5rem;
  height: 0.3rem;
  font-weight: 600;
  font-size: 0.1rem;
  font-family: 'FanYuanTi';
}

.confirm {
  width: 0.5rem;
  height: 0.3rem;
  font-weight: 600;
  font-size: 0.1rem;
  font-family: 'FanYuanTi';
}

:deep(.custom-message) {
  font-family: 'FanYuanTi', sans-serif;
  border-radius: 12px !important;
  box-shadow: 0 6px 20px rgba(23, 113, 187, 0.15) !important;
  padding: 0.12rem 0.16rem !important;
  font-size: 0.1rem !important;
  font-weight: 530;
}

/* 成功消息样式 */
:deep(.custom-message.el-message--success) {
  background: linear-gradient(135deg, #f0f9ff, #e6f7ff) !important;
  border: 1px solid #7ab8ff !important;
  color: #0f5aa8 !important;
}

:deep(.custom-message.el-message--success .el-message__content) {
  color: #0f5aa8 !important;
}

:deep(.custom-message.el-message--success .el-message__closeBtn) {
  color: #3d97e1 !important;
}

/* 错误消息样式 */
:deep(.custom-message.el-message--error) {
  background: linear-gradient(135deg, #fff0f0, #ffe6e6) !important;
  border: 1px solid #ff7a7a !important;
  color: #a80f0f !important;
}

:deep(.custom-message.el-message--error .el-message__content) {
  color: #a80f0f !important;
}

:deep(.custom-message.el-message--error .el-message__closeBtn) {
  color: #e13d3d !important;
}

/* 图标样式 */
:deep(.custom-message .el-message__icon) {
  font-size: 0.14rem !important;
  margin-right: 0.06rem !important;
}

/* 确保消息提示在最上层 */
:deep(.el-message) {
  z-index: 10000 !important;
}
</style>