<template>

  <div class="main-content">

  
  <div class="alerts-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">提醒通知</h1>
      <div class="page-stats">
        <div class="stat-item">
          <div class="stat-label">未读提醒</div>
          <div class="stat-value critical">{{ unreadAlerts.length }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">今日提醒</div>
          <div class="stat-value warning">{{ todayAlerts.length }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">本周提醒</div>
          <div class="stat-value info">{{ weekAlerts.length }}</div>
        </div>
      </div>
    </div>

    <!-- 提醒类型筛选 -->
    <div class="alert-filters">
      <el-tabs v-model="activeFilter" class="filter-tabs">
        <el-tab-pane label="全部提醒" name="all" />
        <el-tab-pane label="健康预警" name="health" />
        <el-tab-pane label="用药提醒" name="medication" />
        <el-tab-pane label="日程提醒" name="schedule" />
        <el-tab-pane label="紧急事件" name="emergency" />
      </el-tabs>
      
      <div class="filter-actions">
        <el-select v-model="filterParent" placeholder="选择父母" clearable style="width: 120px">
          <el-option label="全部父母" value="" />
          <el-option
            v-for="parent in parents"
            :key="parent.id"
            :label="parent.name"
            :value="parent.id"
          />
        </el-select>
        
        <el-select v-model="filterSeverity" placeholder="严重程度" clearable style="width: 120px">
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
          style="width: 240px"
        />
        
        <el-button type="primary" @click="handleMarkAllAsRead" :disabled="unreadAlerts.length === 0">
          全部标为已读
        </el-button>
      </div>
    </div>

    <!-- 提醒列表 -->
    <div class="alert-list">
      <AlertList
        :alerts="filteredAlerts"
        @view="handleViewAlert"
        @action="handleAlertAction"
        @mark-read="handleMarkAsRead"
        @delete="handleDeleteAlert"
      />
      
      <!-- 空状态 -->
      <div v-if="filteredAlerts.length === 0" class="empty-alerts">
        <EmptyState
          title="暂无提醒"
          description="当有健康预警或待办提醒时，会在这里显示"
          icon="Bell"
        >
          <template #actions>
            <el-button type="primary" @click="handleTestAlert">
              测试提醒
            </el-button>
          </template>
        </EmptyState>
      </div>
    </div>

    <!-- 提醒详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="currentAlert?.title"
      width="500px"
    >
      <AlertDetail
        v-if="currentAlert"
        :alert="currentAlert"
        @action="handleDetailAction"
      />
    </el-dialog>

    <!-- 提醒设置抽屉 -->
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
import { useAppStore } from '@/stores/alerts.js'
import AlertList from '@/components/alerts/AlertList.vue'
import AlertDetail from '@/components/alerts/AlertDetail.vue'
import AlertSettings from '@/components/alerts/AlertSettings.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatDate } from '@/utils/formatters'

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

// 暴露方法给模板
defineExpose({
  openSettings
})
</script>

<style scoped>
  .main-content {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
  overflow-y: auto;
  height:100%;
}
.alerts-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.page-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  text-align: center;
  padding: 12px 24px;
  background: white;
  border-radius: 8px;
  min-width: 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-label {
  color: #909399;
  font-size: 12px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
}

.stat-value.critical {
  color: #f56c6c;
}

.stat-value.warning {
  color: #e6a23c;
}

.stat-value.info {
  color: #409eff;
}

.alert-filters {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.filter-tabs {
  margin-bottom: 20px;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.alert-list {
  background: white;
  border-radius: 12px;
  min-height: 400px;
  overflow: hidden;
}

.empty-alerts {
  padding: 80px 20px;
  text-align: center;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px !important;
}
</style>