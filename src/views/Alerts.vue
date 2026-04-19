<template>
  <div class="main-content">
    <div class="alerts-page">

      <div class="page-header">
        <div class="header-left">
          <el-button class="back-btn" :icon="ArrowLeft" circle @click="goBack" />
        </div>
        <h1 class="page-title">提醒通知</h1>
        <div class="header-right"></div>
      </div>

      <div class="page-stats-grid">
        <div class="stat-card">
          <div class="stat-label">未读提醒</div>
          <div class="stat-value critical">{{ unreadAlerts.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">今日提醒</div>
          <div class="stat-value warning">{{ todayAlerts.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">本周提醒</div>
          <div class="stat-value info">{{ weekAlerts.length }}</div>
        </div>
      </div>

      <div class="alert-filters-section">
        <div class="tabs-container">
          <el-tabs v-model="activeFilter" class="centered-tabs">
            <el-tab-pane label="全部提醒" name="all" />
            <el-tab-pane label="健康预警" name="health" />
            <el-tab-pane label="用药提醒" name="medication" />
            <el-tab-pane label="日程提醒" name="schedule" />
            <el-tab-pane label="紧急事件" name="emergency" />
          </el-tabs>
        </div>

        <div class="filter-actions-centered">
          <el-select v-model="filterParent" placeholder="选择父母" clearable class="filter-item">
            <el-option label="全部父母" value="" />
            <el-option
              v-for="parent in parents"
              :key="parent.id"
              :label="parent.name"
              :value="parent.id"
            />
          </el-select>

          <el-select v-model="filterSeverity" placeholder="严重程度" clearable class="filter-item">
            <el-option label="全部" value="" />
            <el-option label="紧急" value="critical" />
            <el-option label="警告" value="warning" />
            <el-option label="通知" value="info" />
          </el-select>

          <el-date-picker
            v-model="filterDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="filter-date-picker"
          />

          <el-button class="mark-read-btn" @click="handleMarkAllAsRead" :disabled="unreadAlerts.length === 0">
            全部标为已读
          </el-button>
        </div>
      </div>

      <div class="alert-list-container">
        <AlertList
          :alerts="filteredAlerts"
          @view="handleViewAlert"
          @action="handleAlertAction"
          @mark-read="handleMarkAsRead"
          @delete="handleDeleteAlert"
        />

        <div v-if="filteredAlerts.length === 0" class="empty-alerts">
          <EmptyState
            title="暂无提醒"
            description="当有健康预警或待办提醒时，会在这里显示"
            icon="Bell"
          >
            <template #actions>
              <el-button plain @click="handleTestAlert">
                测试提醒
              </el-button>
            </template>
          </EmptyState>
        </div>
      </div>

      <el-dialog
        v-model="showDetailDialog"
        :title="currentAlert?.title"
        width="500px"
        align-center
      >
        <AlertDetail
          v-if="currentAlert"
          :alert="currentAlert"
          @action="handleDetailAction"
        />
      </el-dialog>

      <el-drawer v-model="showSettingsDrawer" title="提醒设置" size="400px">
        <AlertSettings
          :settings="alertSettings"
          @save="handleSaveSettings"
        />
      </el-drawer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/alerts.js'
import AlertList from '@/components/alerts/AlertList.vue'
import AlertDetail from '@/components/alerts/AlertDetail.vue'
import AlertSettings from '@/components/alerts/AlertSettings.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatDate } from '@/utils/formatters'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const store = useAppStore()

// 筛选条件
const activeFilter = ref('all')
const filterParent = ref('')
const filterSeverity = ref('')
const filterDate = ref('')

// 对话框状态
const showDetailDialog = ref(false)
const showSettingsDrawer = ref(false)
const currentAlert = ref(null)

// 提醒设置
const alertSettings = ref({
  pushEnabled: true,
  voiceEnabled: true,
  smsEnabled: false,
  emailEnabled: true,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '07:00'
  },
  healthAlerts: {
    critical: true,
    warning: true,
    info: false
  },
  medicationAlerts: {
    enabled: true,
    advanceMinutes: 10
  },
  scheduleAlerts: {
    enabled: true,
    advanceMinutes: 30
  }
})

// 计算属性
const parents = computed(() => store.parents)
const allAlerts = computed(() => store.alerts)
const unreadAlerts = computed(() => store.unreadAlerts)
const criticalAlerts = computed(() => store.criticalAlerts)

// 今日提醒
const todayAlerts = computed(() => {
  const today = formatDate(new Date(), 'YYYY-MM-DD')
  return allAlerts.value.filter(alert => alert.timestamp.startsWith(today))
})

// 本周提醒
const weekAlerts = computed(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return allAlerts.value.filter(alert => new Date(alert.timestamp) >= oneWeekAgo)
})

// 筛选后的提醒
const filteredAlerts = computed(() => {
  let alerts = allAlerts.value

  // 按类型筛选
  if (activeFilter.value !== 'all') {
    alerts = alerts.filter(alert => alert.type === activeFilter.value)
  }

  // 按父母筛选
  if (filterParent.value) {
    alerts = alerts.filter(alert => alert.parentId === parseInt(filterParent.value))
  }

  // 按严重程度筛选
  if (filterSeverity.value) {
    alerts = alerts.filter(alert => alert.severity === filterSeverity.value)
  }

  // 按日期筛选
  if (filterDate.value && filterDate.value[0] && filterDate.value[1]) {
    const startDate = new Date(filterDate.value[0])
    const endDate = new Date(filterDate.value[1])
    alerts = alerts.filter(alert => {
      const alertDate = new Date(alert.timestamp)
      return alertDate >= startDate && alertDate <= endDate
    })
  }

  return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

// 处理方法
const handleViewAlert = (alert) => {
  currentAlert.value = alert
  showDetailDialog.value = true
}

const handleAlertAction = ({ alert, action }) => {
  console.log('执行操作:', action, alert)

  switch (action) {
    case '查看详情':
      handleViewAlert(alert)
      break
    case '确认服药':
      handleConfirmMedication(alert)
      break
    case '联系医生':
      handleContactDoctor(alert)
      break
    case '查看位置':
      handleViewLocation(alert)
      break
  }
}

const handleMarkAsRead = (alertId) => {
  store.markAlertAsRead(alertId)
}

const handleMarkAllAsRead = () => {
  store.alerts.forEach(alert => {
    if (!alert.read) {
      store.markAlertAsRead(alert.id)
    }
  })
  ElMessage.success('已标记所有提醒为已读')
}

const handleDeleteAlert = (alertId) => {
  const index = store.alerts.findIndex(a => a.id === alertId)
  if (index !== -1) {
    store.alerts.splice(index, 1)
    ElMessage.success('提醒已删除')
  }
}

const handleDetailAction = (action) => {
  console.log('详情操作:', action)
  showDetailDialog.value = false
}

const handleSaveSettings = (settings) => {
  alertSettings.value = settings
  showSettingsDrawer.value = false
  ElMessage.success('设置已保存')
}

const handleTestAlert = () => {
  store.addAlert({
    type: 'health',
    severity: 'warning',
    title: '测试提醒',
    content: '这是一个测试提醒，用于验证提醒功能是否正常工作。',
    parentId: store.parents[0]?.id,
    parentName: store.parents[0]?.name || '测试用户',
    actions: ['查看详情', '忽略']
  })
  ElMessage.success('测试提醒已发送')
}

const handleConfirmMedication = (alert) => {
  ElMessage.success(`已确认${alert.parentName}服药`)
  store.markAlertAsRead(alert.id)
}

const handleContactDoctor = (alert) => {
  console.log('联系医生:', alert.parentName)
  ElMessage.info('正在为您联系医生...')
}

const handleViewLocation = (alert) => {
  console.log('查看位置:', alert.parentName)
  ElMessage.info('正在定位...')
}

// 打开设置
const openSettings = () => {
  showSettingsDrawer.value = true
}

onMounted(() => {
  // 页面加载时检查紧急提醒
  if (criticalAlerts.value.length > 0) {
    ElMessage.warning(`有${criticalAlerts.value.length}个紧急提醒待处理`)
  }
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 暴露方法给模板
defineExpose({
  openSettings
})
</script>

<style scoped>
/* 背景与主容器：纯净清爽 */
.main-content {
  padding: 32px 40px;
  background-color: #f7f9f7;
  min-height: calc(100vh - 120px);
  box-sizing: border-box;
}

.alerts-page {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 1. 标题区：两端占位，强制居中对称 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.header-left, .header-right {
  width: 40px;
}

.back-btn {
  border: 1px solid #e4e7ed;
  color: #606266;
  background: white;
}

.page-title {
  font-size: 22px;
  font-weight: 500;
  color: #303133;
  margin: 0;
  letter-spacing: 2px;
}

/* 2. 数据统计：三列等宽网格 */
.page-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.stat-card {
  background: #ffffff;
  padding: 32px 20px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
  letter-spacing: 1px;
}

.stat-value {
  font-size: 36px;
  font-weight: 400;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1;
}

.stat-value.critical { color: #f56c6c; }
.stat-value.warning  { color: #e6a23c; }
.stat-value.info     { color: #52c41a; }

/* 3. 筛选区域：全部居中，规整对齐 */
.alert-filters-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #ffffff;
  padding: 24px 32px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

/* 强制覆盖 Element Plus 默认的靠左对齐，实现 Tabs 居中 */
.tabs-container {
  border-bottom: 1px solid #f0f2f5;
}

:deep(.el-tabs__nav-scroll) {
  display: flex;
  justify-content: center;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__item) {
  color: #606266;
  font-size: 15px;
  padding: 0 24px !important;
}

:deep(.el-tabs__item.is-active) {
  color: #52c41a;
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  background-color: #52c41a;
  height: 3px;
  border-radius: 3px;
}

/* 下方筛选框：紧凑居中排列 */
.filter-actions-centered {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  width: 160px;
}

.filter-date-picker {
  width: 280px !important;
}

.mark-read-btn {
  border-color: #d9f7be;
  color: #52c41a;
  background: #f6ffed;
}

/* 4. 列表容器：干净利落 */
.alert-list-container {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  min-height: 400px;
}

.empty-alerts {
  padding: 100px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>