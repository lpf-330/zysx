<template>
  <div class="main-content">
    <div class="profile-page">
      <!-- 页面头部 -->
      <div class="page-header">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" /></svg>
          返回
        </button>
        <h1 class="page-title">个人资料</h1>
      </div>

      <!-- 个人信息卡片 -->
      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <el-avatar :size="100" :src="userInfo.Avatar || defaultAvatar" />
            <el-button class="change-avatar-btn" @click="showAvatarDialog = true">
              <el-icon><Camera /></el-icon>
              更换头像
            </el-button>
          </div>
        </div>

        <div class="info-section">
          <el-form :model="userInfo" label-width="100px" class="info-form">
            <el-form-item label="用户名">
              <el-input v-model="userInfo.Username" placeholder="请输入用户名" />
            </el-form-item>

            <el-form-item label="性别">
              <el-radio-group v-model="userInfo.gender">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="出生日期">
              <el-date-picker
                v-model="userInfo.Age"
                type="date"
                placeholder="选择出生日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item label="身高">
              <el-input-number
                v-model="userInfo.Height"
                :min="0"
                :max="250"
                :step="1"
                controls-position="right"
              />
              <span class="unit">cm</span>
            </el-form-item>

            <el-form-item label="体重">
              <el-input-number
                v-model="userInfo.Weight"
                :min="0"
                :max="200"
                :step="0.1"
                controls-position="right"
              />
              <span class="unit">kg</span>
            </el-form-item>

            <el-form-item label="手机号">
              <el-input v-model="userInfo.phone_number" placeholder="请输入手机号" />
            </el-form-item>
          </el-form>

          <div class="action-buttons">
            <el-button type="primary" @click="handleSave" :loading="saving">
              保存修改
            </el-button>
            <el-button @click="handleCancel">取消</el-button>
          </div>
        </div>
      </div>

      <!-- 头像更换对话框 -->
      <el-dialog v-model="showAvatarDialog" title="更换头像" width="400px">
        <div class="avatar-upload">
          <el-avatar :size="120" :src="previewAvatar || userInfo.Avatar || defaultAvatar" />
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :http-request="customUpload"
          >
            <el-button type="primary" size="small" style="margin-top: 16px;">
              选择图片
            </el-button>
          </el-upload>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Camera } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserInfoStore()

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 用户信息
const userInfo = reactive({
  Username: '',
  Avatar: '',
  Age: '',
  Height: null,
  Weight: null,
  gender: '',
  phone_number: ''
})

// 保存原始数据用于取消
const originalInfo = ref({})

// 状态
const saving = ref(false)
const showAvatarDialog = ref(false)
const previewAvatar = ref('')

// 加载用户信息
onMounted(() => {
  Object.assign(userInfo, {
    Username: userStore.Username,
    Avatar: userStore.Avatar,
    Age: userStore.Age,
    Height: userStore.Height,
    Weight: userStore.Weight,
    gender: userStore.gender,
    phone_number: userStore.phone_number
  })
  Object.assign(originalInfo.value, userInfo)
})

// 保存修改
const handleSave = async () => {
  saving.value = true
  try {
    // 更新 store
    userStore.Username = userInfo.Username
    userStore.Avatar = previewAvatar.value || userInfo.Avatar
    userStore.Age = userInfo.Age
    userStore.Height = userInfo.Height
    userStore.Weight = userInfo.Weight
    userStore.gender = userInfo.gender
    userStore.phone_number = userInfo.phone_number

    ElMessage.success('保存成功')
    Object.assign(originalInfo.value, userInfo)
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 取消修改 - 返回上一页
const handleCancel = () => {
  goBack()
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 上传前校验
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

// 自定义上传
const customUpload = (options) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    previewAvatar.value = e.target.result
  }
  reader.readAsDataURL(options.file)
}
</script>

<style scoped>
/* 主容器 */
.main-content {
  padding: 24px;
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%);
  min-height: calc(100vh - 120px);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.main-content::before {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  top: -150px;
  right: -100px;
  animation: floatBg 8s ease-in-out infinite;
}

.main-content::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(129, 199, 132, 0.2) 0%, transparent 70%);
  bottom: -100px;
  left: -50px;
  animation: floatBg 10s ease-in-out infinite reverse;
}

@keyframes floatBg {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, 15px) scale(1.05); }
}

.profile-page {
  max-width: 720px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* 页面头部 */
.page-header {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(129, 199, 132, 0.3);
  border-radius: 20px;
  color: #4CAF50;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #FFFFFF;
  transform: translateX(-4px);
  box-shadow: 0 4px 12px rgba(129, 199, 132, 0.2);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2E7D32;
  margin: 0;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
  letter-spacing: 2px;
}

/* 个人信息卡片 */
.profile-card {
  background: linear-gradient(180deg, #FFFFFF 0%, #F1F8E9 100%);
  border-radius: 24px;
  padding: 40px 36px;
  box-shadow:
    0 8px 32px rgba(46, 125, 50, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(129, 199, 132, 0.3);
}

/* 头像区域 */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 36px;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
}

/* 头像光晕 */
.avatar-wrapper :deep(.el-avatar) {
  border: 4px solid #FFFFFF;
  box-shadow:
    0 4px 20px rgba(129, 199, 132, 0.3),
    0 0 0 4px rgba(129, 199, 132, 0.15);
}

.change-avatar-btn {
  background: linear-gradient(135deg, #81C784 0%, #66BB6A 100%);
  border: none;
  color: white;
  border-radius: 20px;
  padding: 10px 24px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(129, 199, 132, 0.3);
  transition: all 0.3s ease;
}

.change-avatar-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(129, 199, 132, 0.4);
  background: linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%);
}

/* 表单区域 */
.info-section {
  max-width: 520px;
  margin: 0 auto;
}

.info-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #424242;
}

.info-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 0 0 1px #C8E6C9 inset;
  transition: all 0.3s ease;
}

.info-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #81C784 inset;
}

.info-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(129, 199, 132, 0.3), 0 0 0 1px #81C784 inset;
}

.info-form :deep(.el-radio__input.is-checked .el-radio__inner) {
  background: #4CAF50;
  border-color: #4CAF50;
}

.info-form :deep(.el-radio__label) {
  color: #424242;
}

.info-form :deep(.el-input-number) {
  width: 100%;
}

.info-form :deep(.el-input-number .el-input__wrapper) {
  border-radius: 12px;
}

/* 单位 */
.unit {
  margin-left: 12px;
  color: #66BB6A;
  font-weight: 600;
  font-size: 14px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 36px;
  padding-top: 28px;
  border-top: 1px solid #E8F5E9;
}

.action-buttons :deep(.el-button--primary) {
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
  border: none;
  border-radius: 24px;
  padding: 14px 36px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
}

.action-buttons :deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.4);
  background: linear-gradient(135deg, #43A047 0%, #2E7D32 100%);
}

.action-buttons :deep(.el-button) {
  border-radius: 24px;
  padding: 14px 28px;
  font-weight: 500;
}

/* 头像上传对话框 */
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
}

.avatar-upload :deep(.el-avatar) {
  border: 4px solid #E8F5E9;
  box-shadow: 0 4px 16px rgba(129, 199, 132, 0.2);
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 24px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #81C784 0%, #4CAF50 100%);
  padding: 20px 24px;
}

:deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

/* 日期选择器 */
:deep(.el-date-editor.el-input) {
  width: 100%;
}

/* 响应式 */
@media (max-width: 768px) {
  .profile-card {
    padding: 24px 20px;
    border-radius: 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons :deep(.el-button) {
    width: 100%;
  }
}
</style>