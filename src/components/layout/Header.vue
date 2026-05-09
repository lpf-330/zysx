<template>
  <el-header class="header">
    <div class="header-left">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
            <router-link v-if="item.path" :to="item.path">{{ item.title }}</router-link>
            <span v-else>{{ item.title }}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    
    <div class="header-right">
      <el-dropdown @command="handleCommand">
        <div class="header-actions">
          <el-button type="info" plain circle>
            <el-icon><Bell /></el-icon>
          </el-button>
          <el-badge :value="unreadCount" class="badge" v-if="unreadCount > 0" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="alert in recentAlerts" :key="alert.id">
              <div class="alert-dropdown-item" @click="viewAlert(alert)">
                <div class="alert-content">
                  <div class="alert-title">{{ alert.title }}</div>
                  <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
                </div>
                <el-tag :type="getSeverityType(alert.severity)" size="small">
                  {{ getSeverityText(alert.severity) }}
                </el-tag>
              </div>
            </el-dropdown-item>
            <el-divider />
            <el-dropdown-item command="viewAll">
              <el-icon><MessageBox /></el-icon>
              查看所有通知
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              通知设置
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <el-dropdown @command="handleUserCommand">
        <div class="user-dropdown">
          <el-avatar :size="32" src=""></el-avatar>
          <span class="username">张小明</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人资料
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              账户设置
            </el-dropdown-item>
            <el-divider />
            <el-dropdown-item command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/alerts.js'
import { useAuthStore } from '@/stores/authStore'
import { formatTime } from '@/utils/formatters'
import {
  Bell,
  MessageBox,
  Setting,
  User,
  ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const authStore = useAuthStore()

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(record => record.meta.title)
  return matched.map(record => ({
    path: record.path,
    title: record.meta.title
  }))
})

const unreadCount = computed(() => store.unreadAlerts.length)
const recentAlerts = computed(() => store.alerts.slice(0, 3))

const getSeverityType = (severity) => {
  const map = {
    critical: 'danger',
    warning: 'warning',
    info: 'info'
  }
  return map[severity] || 'info'
}

const getSeverityText = (severity) => {
  const map = {
    critical: '紧急',
    warning: '警告',
    info: '通知'
  }
  return map[severity] || '通知'
}

const handleCommand = (command) => {
  if (command === 'viewAll') {
    router.push('/alerts')
  } else if (command === 'settings') {
    router.push('/settings')
  }
}

const handleUserCommand = (command) => {
  if (command === 'logout') {
    // 退出登录
    authStore.logout()
    router.push('/login')
  } else if (command === 'profile') {
    // 个人资料
    console.log('个人资料')
  }
}

const viewAlert = (alert) => {
  store.markAlertAsRead(alert.id)
  // 跳转到提醒详情
  console.log('查看提醒:', alert)
}
</script>

<style scoped>
.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  flex: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-actions {
  position: relative;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-dropdown:hover {
  background-color: #f5f7fa;
}

.username {
  font-weight: 500;
  color: #303133;
}

.alert-dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 300px;
  padding: 8px 0;
}

.alert-content {
  flex: 1;
  margin-right: 12px;
}

.alert-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
  font-size: 13px;
}

.alert-time {
  color: #909399;
  font-size: 12px;
}
</style>