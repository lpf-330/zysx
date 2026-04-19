<template>
  <div class="main-content">
    <div class="settings-page">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <el-button class="back-btn" :icon="ArrowLeft" circle @click="goBack" />
          <h1 class="page-title">账户设置</h1>
        </div>
      </div>

      <!-- 设置内容 -->
      <div class="settings-content">
        <!-- 账户安全 -->
        <div class="settings-card">
          <h3 class="card-title">账户安全</h3>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">登录密码</div>
              <div class="setting-desc">定期更换密码可以保护账户安全</div>
            </div>
            <el-button @click="showPasswordDialog = true">修改密码</el-button>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">绑定手机</div>
              <div class="setting-desc">{{ userInfo.phone_number || '未绑定手机号' }}</div>
            </div>
            <el-button @click="showPhoneDialog = true">更换手机</el-button>
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="settings-card">
          <h3 class="card-title">通知设置</h3>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">健康预警</div>
              <div class="setting-desc">接收健康数据异常提醒</div>
            </div>
            <el-switch v-model="notificationSettings.healthAlerts" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">用药提醒</div>
              <div class="setting-desc">接收用药提醒通知</div>
            </div>
            <el-switch v-model="notificationSettings.medicationReminders" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">日程提醒</div>
              <div class="setting-desc">接收日程安排提醒</div>
            </div>
            <el-switch v-model="notificationSettings.scheduleReminders" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">系统消息</div>
              <div class="setting-desc">接收系统公告和更新通知</div>
            </div>
            <el-switch v-model="notificationSettings.systemMessages" />
          </div>
        </div>

        <!-- 隐私设置 -->
        <div class="settings-card">
          <h3 class="card-title">隐私设置</h3>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">数据可见性</div>
              <div class="setting-desc">控制健康数据的分享范围</div>
            </div>
            <el-select v-model="privacySettings.dataVisibility" style="width: 140px">
              <el-option label="仅自己" value="self" />
              <el-option label="仅父母" value="parents" />
              <el-option label="全部可见" value="all" />
            </el-select>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">位置共享</div>
              <div class="setting-desc">与父母共享实时位置</div>
            </div>
            <el-switch v-model="privacySettings.locationSharing" />
          </div>
        </div>

        <!-- 通用设置 -->
        <div class="settings-card">
          <h3 class="card-title">通用设置</h3>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">深色模式</div>
              <div class="setting-desc">切换深色/浅色主题</div>
            </div>
            <el-switch v-model="generalSettings.darkMode" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">语言</div>
              <div class="setting-desc">选择界面显示语言</div>
            </div>
            <el-select v-model="generalSettings.language" style="width: 140px">
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en" />
            </el-select>
          </div>
        </div>

        <!-- 账户操作 -->
        <div class="settings-card danger-card">
          <h3 class="card-title">账户操作</h3>
          <div class="setting-item danger-item">
            <div class="setting-info">
              <div class="setting-label">退出登录</div>
              <div class="setting-desc">退出当前账户登录状态</div>
            </div>
            <el-button type="danger" @click="handleLogout">退出登录</el-button>
          </div>
          <div class="setting-item danger-item">
            <div class="setting-info">
              <div class="setting-label">注销账户</div>
              <div class="setting-desc">删除账户及所有相关数据，不可恢复</div>
            </div>
            <el-button type="danger" plain @click="showDeleteDialog = true">注销账户</el-button>
          </div>
        </div>
      </div>

      <!-- 修改密码对话框 -->
      <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
          <el-form-item label="当前密码" prop="oldPassword">
            <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入当前密码" />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button type="primary" @click="handleChangePassword" :loading="changingPassword">确定</el-button>
        </template>
      </el-dialog>

      <!-- 更换手机对话框 -->
      <el-dialog v-model="showPhoneDialog" title="更换手机" width="400px">
        <el-form :model="phoneForm" :rules="phoneRules" ref="phoneFormRef" label-width="100px">
          <el-form-item label="新手机号" prop="phone">
            <el-input v-model="phoneForm.phone" placeholder="请输入新手机号" />
          </el-form-item>
          <el-form-item label="验证码" prop="code">
            <el-input v-model="phoneForm.code" placeholder="请输入验证码" style="width: 160px" />
            <el-button @click="sendCode" :disabled="codeCountdown > 0" style="margin-left: 8px">
              {{ codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码' }}
            </el-button>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showPhoneDialog = false">取消</el-button>
          <el-button type="primary" @click="handleChangePhone" :loading="changingPhone">确定</el-button>
        </template>
      </el-dialog>

      <!-- 注销账户确认对话框 -->
      <el-dialog v-model="showDeleteDialog" title="注销账户" width="400px">
        <div class="delete-warning">
          <el-icon class="warning-icon"><WarningFilled /></el-icon>
          <p>确定要注销账户吗？此操作将删除所有数据且不可恢复。</p>
        </div>
        <el-input v-model="deleteConfirmText" placeholder="请输入 确认注销" style="margin-top: 16px" />
        <template #footer>
          <el-button @click="showDeleteDialog = false">取消</el-button>
          <el-button type="danger" @click="handleDeleteAccount" :disabled="deleteConfirmText !== '确认注销'">
            确认注销
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/stores/user'
import { useAuthStore } from '@/stores/authStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { WarningFilled, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserInfoStore()
const authStore = useAuthStore()

// 用户信息
const userInfo = reactive({
  phone_number: ''
})

onMounted(() => {
  userInfo.phone_number = userStore.phone_number || ''
})

// 通知设置
const notificationSettings = reactive({
  healthAlerts: true,
  medicationReminders: true,
  scheduleReminders: true,
  systemMessages: true
})

// 隐私设置
const privacySettings = reactive({
  dataVisibility: 'parents',
  locationSharing: true
})

// 通用设置
const generalSettings = reactive({
  darkMode: false,
  language: 'zh-CN'
})

// 对话框状态
const showPasswordDialog = ref(false)
const showPhoneDialog = ref(false)
const showDeleteDialog = ref(false)

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordFormRef = ref(null)
const changingPassword = ref(false)

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 更换手机表单
const phoneForm = reactive({
  phone: '',
  code: ''
})
const phoneFormRef = ref(null)
const codeCountdown = ref(0)
const changingPhone = ref(false)

const phoneRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

// 注销确认
const deleteConfirmText = ref('')

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      changingPassword.value = true
      try {
        // TODO: 调用后端接口
        ElMessage.success('密码修改成功')
        showPasswordDialog.value = false
        passwordForm.oldPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      } catch (error) {
        ElMessage.error('密码修改失败')
      } finally {
        changingPassword.value = false
      }
    }
  })
}

// 发送验证码
const sendCode = () => {
  if (!phoneForm.phone || !/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  codeCountdown.value = 60
  const timer = setInterval(() => {
    codeCountdown.value--
    if (codeCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  ElMessage.success('验证码已发送')
}

// 更换手机
const handleChangePhone = async () => {
  if (!phoneFormRef.value) return
  await phoneFormRef.value.validate(async (valid) => {
    if (valid) {
      changingPhone.value = true
      try {
        // TODO: 调用后端接口
        ElMessage.success('手机号更换成功')
        showPhoneDialog.value = false
        userInfo.phone_number = phoneForm.phone
        phoneForm.phone = ''
        phoneForm.code = ''
      } catch (error) {
        ElMessage.error('手机号更换失败')
      } finally {
        changingPhone.value = false
      }
    }
  })
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    authStore.logout()
    router.push('/login')
  }).catch(() => {})
}

// 注销账户
const handleDeleteAccount = async () => {
  try {
    // TODO: 调用后端接口
    ElMessage.success('账户已注销')
    authStore.logout()
    router.push('/login')
  } catch (error) {
    ElMessage.error('账户注销失败')
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.main-content {
  padding: 20px;
  background: linear-gradient(180deg, #f0f9eb 0%, #e1f3d8 100%);
  min-height: calc(100vh - 120px);
}

.settings-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border: none;
  color: white;
}

.back-btn:hover {
  background: linear-gradient(135deg, #73d13d 0%, #95de64 100%);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #2d5a27;
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-card {
  background: linear-gradient(135deg, #ffffff 0%, #f0f9eb 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(82, 196, 26, 0.12);
  border: 1px solid #d9f7be;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d5a27;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #d9f7be;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e8f5e9;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: #2d5a27;
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 12px;
  color: #7c9a6e;
}

.danger-card {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
  border-color: #ffccc7;
}

.danger-card .card-title {
  color: #cf1322;
}

.danger-item .setting-label {
  color: #cf1322;
}

.delete-warning {
  text-align: center;
  padding: 20px;
}

.warning-icon {
  font-size: 48px;
  color: #f56c6c;
  margin-bottom: 16px;
}

.delete-warning p {
  color: #606266;
  margin: 0;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #73d13d 0%, #95de64 100%);
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  border: none;
}

:deep(.el-switch.is-checked .el-switch__core) {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border-color: #52c41a;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2) !important;
}

:deep(.el-dialog) {
  border-radius: 16px;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f0f9eb 0%, #d9f7be 100%);
  border-radius: 16px 16px 0 0;
  padding: 20px;
}

:deep(.el-dialog__title) {
  color: #2d5a27;
  font-weight: 600;
}

:deep(.el-form-item__label) {
  color: #2d5a27;
}

:deep(.el-input__wrapper) {
  border-radius: 10px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2) !important;
}
</style>