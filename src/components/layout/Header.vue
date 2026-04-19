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
      <el-dropdown @command="handleCommand" :teleported="false">
        <div class="header-actions">
          <div class="custom-bell-btn">
            <el-icon class="bell-icon"><Bell /></el-icon>
          </div>
          <el-badge :value="unreadCount" class="custom-badge" v-if="unreadCount > 0" />
        </div>
        <template #dropdown>
          <el-dropdown-menu class="warm-dropdown-menu">
            <el-dropdown-item v-for="alert in recentAlerts" :key="alert.id">
              <div class="alert-dropdown-item" @click="viewAlert(alert)">
                <div class="alert-content">
                  <div class="alert-title">{{ alert.title }}</div>
                  <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
                </div>
                <span :class="['custom-tag', getSeverityType(alert.severity)]">
                  {{ getSeverityText(alert.severity) }}
                </span>
              </div>
            </el-dropdown-item>
            <el-divider class="custom-divider" />
            <el-dropdown-item command="viewAll" class="dropdown-action-item">
              <el-icon><MessageBox /></el-icon>
              查看所有通知
            </el-dropdown-item>
            <el-dropdown-item command="settings" class="dropdown-action-item">
              <el-icon><Setting /></el-icon>
              通知设置
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-dropdown @command="handleUserCommand" :teleported="false">
        <div class="user-dropdown">
          <div class="avatar-wrapper">
            <el-avatar :size="34" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"></el-avatar>
          </div>
          <span class="username">张小明</span>
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="warm-dropdown-menu">
            <el-dropdown-item command="profile" class="dropdown-action-item">
              <el-icon><User /></el-icon>
              个人资料
            </el-dropdown-item>
            <el-dropdown-item command="settings" class="dropdown-action-item">
              <el-icon><Setting /></el-icon>
              账户设置
            </el-dropdown-item>
            <el-divider class="custom-divider" />
            <el-dropdown-item command="logout" class="dropdown-action-item logout-item">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 通知弹窗 - 使用Teleport全屏显示 -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="showAlertsDialog" class="alert-overlay" @click.self="showAlertsDialog = false">
          <div class="alert-modal">
            <div class="modal-container">
              <!-- 弹窗头部 -->
              <div class="modal-header">
                <div class="header-decoration">
                  <div class="leaf leaf-left"></div>
                  <div class="leaf leaf-right"></div>
                </div>
                <div class="modal-title-wrap">
                  <el-icon class="title-icon"><Bell /></el-icon>
                  <h2 class="modal-title">温暖提醒</h2>
                </div>
                <p class="modal-subtitle">关注您和家人的健康是我们最大的心愿</p>
                <button class="close-btn" @click="showAlertsDialog = false">
                  <el-icon><Close /></el-icon>
                </button>
              </div>

              <!-- 通知列表 -->
              <div class="modal-content">
                <transition-group name="alert-fade" tag="div" class="alert-list-inner">
                  <div
                    v-for="alert in store.alerts.slice(0, 8)"
                    :key="alert.id"
                    class="alert-card"
                    :class="[{ 'alert-unread': !alert.read, [`severity-${alert.severity}`]: true }]"
                    @click="viewAlert(alert)"
                  >
                    <div class="alert-icon-wrap">
                      <el-icon class="alert-icon" :class="alert.severity">
                        <Warning v-if="alert.severity === 'critical'" />
                        <WarningFilled v-else-if="alert.severity === 'warning'" />
                        <Bell v-else />
                      </el-icon>
                    </div>
                    <div class="alert-body">
                      <div class="alert-header">
                        <span class="alert-title-text">{{ alert.title }}</span>
                        <span :class="['severity-tag', alert.severity]">
                          {{ getSeverityText(alert.severity) }}
                        </span>
                      </div>
                      <p class="alert-message">{{ alert.content }}</p>
                      <div class="alert-meta">
                        <el-icon class="meta-icon"><Clock /></el-icon>
                        <span class="meta-time">{{ formatTime(alert.timestamp) }}</span>
                      </div>
                    </div>
                    <div class="alert-glow"></div>
                  </div>
                </transition-group>

                <!-- 空状态 -->
                <div v-if="store.alerts.length === 0" class="empty-state">
                  <div class="empty-illustration">
                    <el-icon class="empty-icon"><Document /></el-icon>
                  </div>
                  <p class="empty-text">暂无提醒消息</p>
                  <p class="empty-hint">一切安好，请放心</p>
                </div>
              </div>

              <!-- 弹窗底部 -->
              <div class="modal-footer" v-if="store.alerts.length > 0">
                <div class="footer-stats">
                  <span class="stat-dot"></span>
                  <span>共 {{ store.alerts.length }} 条提醒</span>
                  <span class="stat-divider">|</span>
                  <span class="unread-count">{{ unreadCount }} 条未读</span>
                </div>
                <el-button class="view-all-btn" @click="goToAlerts">
                  <span>查看全部</span>
                  <el-icon class="btn-arrow"><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </el-header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/alerts.js'
import { useAuthStore } from '@/stores/authStore.js'
import { formatTime } from '@/utils/formatters'
import { showConfirm } from '@/composables/useDialog.js'
import {
  Bell,
  MessageBox,
  Setting,
  User,
  ArrowDown,
  SwitchButton,
  Warning,
  WarningFilled,
  Clock,
  Document,
  ArrowRight,
  Close
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const authStore = useAuthStore()

// 弹窗显示状态
const showAlertsDialog = ref(false)

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
    showAlertsDialog.value = true
  } else if (command === 'settings') {
    router.push('/alerts')
  }
}

const handleUserCommand = (command) => {
  if (command === 'logout') {
    showConfirm({
      title: '退出登录',
      message: '确定要退出登录吗？',
      type: 'warning',
      confirmText: '退出',
      cancelText: '取消',
      onConfirm: () => {
        authStore.logout()
        router.push('/login')
      }
    })
  } else if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'settings') {
    router.push('/accountSettings')
  }
}

const viewAlert = (alert) => {
  store.markAlertAsRead(alert.id)
  console.log('查看提醒:', alert)
}

const goToAlerts = () => {
  showAlertsDialog.value = false
  router.push('/alerts')
}
</script>

<style scoped>
/* 顶栏主体：温馨绿色渐变风格 */
.header {
  background: linear-gradient(180deg, #FFFFFF 0%, #F5FBF7 100%);
  border-bottom: 1px solid #E8F0EA;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 64px;
  box-shadow: 0 4px 24px rgba(106, 148, 114, 0.08);
  z-index: 10;
  position: relative;
}

/* 顶部装饰线 */
.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, #A8D5BA 15%, #7CB68E 50%, #A8D5BA 85%, transparent 100%);
  opacity: 0.7;
}

.header-left { flex: 1; }

.breadcrumb { display: flex; align-items: center; }

:deep(.el-breadcrumb__separator) { color: #B8CFC3; }

.custom-link {
  color: #6B9B7A !important;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}
.custom-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #7CB68E, #A8D5BA);
  transition: width 0.3s ease;
  border-radius: 1px;
}
.custom-link:hover { color: #4A7D5A !important; }
.custom-link:hover::after { width: 100%; }
.custom-current { color: #4A6B56; font-weight: 600; }

.header-right { display: flex; align-items: center; gap: 24px; }

/* 铃铛按钮 */
.header-actions { position: relative; cursor: pointer; padding: 6px; }

.custom-bell-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E8F5E9 0%, #D4E8D8 100%);
  color: #6B9B7A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.custom-bell-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(168, 213, 186, 0.5) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.4s ease;
}

.header-actions:hover .custom-bell-btn::before { width: 70px; height: 70px; }

.header-actions:hover .custom-bell-btn {
  background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 100%);
  color: #4A7D5A;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(106, 155, 122, 0.2), 0 2px 8px rgba(106, 155, 122, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.header-actions:hover .bell-icon { animation: swing 0.6s ease-in-out; }

.custom-bell-btn.has-unread { animation: bellPulse 2s ease-in-out infinite; }

@keyframes bellPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
@keyframes swing { 20% { transform: rotate(15deg); } 40% { transform: rotate(-10deg); } 60% { transform: rotate(5deg); } 80% { transform: rotate(-5deg); } 100% { transform: rotate(0deg); } }

/* Badge */
.custom-badge { position: absolute; top: 2px; right: 2px; }
:deep(.el-badge__content) {
  background: linear-gradient(135deg, #E57373 0%, #EF5350 100%);
  border: 2px solid #FFFFFF;
  box-shadow: 0 2px 8px rgba(229, 115, 115, 0.4), 0 0 12px rgba(239, 83, 80, 0.2);
  font-weight: 600;
  animation: badgePulse 2s ease-in-out infinite;
}
@keyframes badgePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

/* 用户下拉菜单 */
.user-dropdown {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 16px 6px 6px;
  border-radius: 30px;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.4s ease;
  position: relative;
}

.user-dropdown::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 30px;
  background: linear-gradient(135deg, rgba(168, 213, 186, 0.1), rgba(124, 182, 142, 0.05));
  opacity: 0;
  transition: opacity 0.4s ease;
}

.user-dropdown:hover::before { opacity: 1; }
.user-dropdown:hover {
  background-color: rgba(232, 240, 230, 0.6);
  border: 1px solid rgba(168, 213, 186, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(106, 155, 122, 0.12);
}

.avatar-wrapper {
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, #C5DDC8 0%, #8DBC9A 50%, #7CB68E 100%);
  position: relative;
  transition: all 0.4s ease;
}

.user-dropdown:hover .avatar-wrapper { transform: scale(1.05); box-shadow: 0 4px 12px rgba(124, 182, 142, 0.3); }

.avatar-wrapper::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(168, 213, 186, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.user-dropdown:hover .avatar-wrapper::after { opacity: 1; animation: avatarGlow 1.5s ease-in-out infinite; }
@keyframes avatarGlow { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.8; } }

.username { font-weight: 600; color: #3E5A47; font-size: 14px; transition: color 0.3s ease; }
.user-dropdown:hover .username { color: #2D4A35; }

.arrow-icon { color: #8DA897; font-size: 12px; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.user-dropdown:hover .arrow-icon { transform: rotate(180deg) translateY(2px); color: #6B9B7A; }

/* 下拉菜单 */
:deep(.el-dropdown__popper) {
  border-radius: 16px !important;
  box-shadow: 0 12px 40px rgba(80, 110, 90, 0.15), 0 4px 12px rgba(80, 110, 90, 0.08) !important;
  border: 1px solid #E8F0EA !important;
  overflow: hidden;
  animation: dropdownFadeIn 0.3s ease;
}
@keyframes dropdownFadeIn { from { opacity: 0; transform: translateY(-8px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
:deep(.el-dropdown__popper) { background: linear-gradient(180deg, #FFFFFF 0%, #FAFCF9 100%) !important; }

.warm-dropdown-menu { padding: 8px !important; min-width: 180px; }

.dropdown-action-item {
  border-radius: 10px;
  margin: 4px 0;
  color: #5C7565 !important;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.dropdown-action-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  background: linear-gradient(90deg, rgba(168, 213, 186, 0.2), transparent);
  border-radius: 0 4px 4px 0;
  transition: width 0.3s ease;
}

.dropdown-action-item:hover {
  background: linear-gradient(90deg, rgba(232, 240, 230, 0.8), rgba(232, 240, 230, 0.4)) !important;
  color: #3E5A47 !important;
  transform: translateX(4px);
}
.dropdown-action-item:hover::before { width: 4px; height: 70%; }
.dropdown-action-item .el-icon { transition: all 0.3s ease; }
.dropdown-action-item:hover .el-icon { transform: scale(1.1); color: #6B9B7A; }

.logout-item:hover {
  background: linear-gradient(90deg, rgba(255, 241, 241, 0.8), rgba(255, 241, 241, 0.4)) !important;
  color: #E27B7B !important;
}
.logout-item:hover::before { background: linear-gradient(90deg, rgba(226, 123, 123, 0.2), transparent); }

.custom-divider { margin: 12px 8px; border-color: #E8F0EA; }

/* 提醒列表 */
.alert-dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 280px;
  padding: 12px 10px;
  border-radius: 10px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.alert-dropdown-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #A8D5BA, #7CB68E);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.alert-dropdown-item:hover {
  background: linear-gradient(90deg, rgba(252, 251, 245, 0.8), rgba(252, 251, 245, 0.4));
  transform: translateX(2px);
}
.alert-dropdown-item:hover::before { opacity: 1; }

.alert-content { flex: 1; margin-right: 12px; }
.alert-title { font-weight: 600; color: #3E5A47; margin-bottom: 4px; font-size: 14px; transition: color 0.3s ease; }
.alert-dropdown-item:hover .alert-title { color: #2D4A35; }
.alert-time { color: #8DA897; font-size: 12px; }

.custom-tag { padding: 5px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; transition: all 0.3s ease; }
.custom-tag.danger { background: linear-gradient(135deg, #FFF1F1 0%, #FFE8E8 100%); color: #E27B7B; box-shadow: 0 2px 8px rgba(226, 123, 123, 0.15); }
.custom-tag.warning { background: linear-gradient(135deg, #FEF7E6 0%, #FFF3D6 100%); color: #D4A353; box-shadow: 0 2px 8px rgba(212, 163, 83, 0.15); }
.custom-tag.info { background: linear-gradient(135deg, #EAF2ED 0%, #E3EBE3 100%); color: #729A80; box-shadow: 0 2px 8px rgba(114, 154, 128, 0.15); }

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #4CAF50;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(76, 175, 80, 0.1);
  color: #2E7D32;
}

.modal-container { background: linear-gradient(180deg, #F7FBF8 0%, #FFFFFF 50%, #F0F7F4 100%); border-radius: 20px; overflow: hidden; }

.modal-header {
  position: relative;
  padding: 32px 32px 24px;
  text-align: center;
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%);
  overflow: hidden;
}

.header-decoration { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; }

.leaf { position: absolute; width: 80px; height: 80px; opacity: 0.15; }
.leaf-left { left: -20px; top: -20px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%234CAF50' d='M50 0 C20 20 0 50 0 80 C20 80 40 70 60 60 C80 50 90 30 100 20 C90 10 70 0 50 0 Z'/%3E%3C/svg%3E") no-repeat center/contain; }
.leaf-right { right: -20px; bottom: -20px; width: 60px; height: 60px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%2381C784' d='M50 0 C20 20 0 50 0 80 C20 80 40 70 60 60 C80 50 90 30 100 20 C90 10 70 0 50 0 Z'/%3E%3C/svg%3E") no-repeat center/contain; }

.modal-title-wrap { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px; }

.title-icon { font-size: 32px; color: #2E7D32; animation: bell-shake 2s ease-in-out infinite; }
@keyframes bell-shake { 0%, 100% { transform: rotate(0deg); } 10%, 30% { transform: rotate(10deg); } 20%, 40% { transform: rotate(-10deg); } 50% { transform: rotate(0deg); } }

.modal-title { font-size: 24px; font-weight: 700; color: #1B5E20; margin: 0; letter-spacing: 2px; }
.modal-subtitle { font-size: 14px; color: #4CAF50; margin: 0; opacity: 0.9; }

.modal-content { padding: 20px 28px; max-height: 420px; overflow-y: auto; }
.alert-list-inner { display: flex; flex-direction: column; gap: 12px; }

.alert-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(76, 175, 80, 0.08);
  border: 1px solid #E8F5E9;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.alert-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(76, 175, 80, 0.15); border-color: #C8E6C9; }
.alert-card.alert-unread { background: linear-gradient(135deg, #F1F8E9 0%, #FFFFFF 100%); }
.alert-card.alert-unread::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(180deg, #4CAF50 0%, #81C784 100%); }

.alert-card.severity-critical { border-left: 4px solid #E57373; }
.alert-card.severity-critical .alert-icon-wrap { background: linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%); }
.alert-card.severity-critical .alert-icon { color: #E53935; }

.alert-card.severity-warning { border-left: 4px solid #FFB74D; }
.alert-card.severity-warning .alert-icon-wrap { background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%); }
.alert-card.severity-warning .alert-icon { color: #F57C00; }

.alert-card.severity-info { border-left: 4px solid #81C784; }
.alert-card.severity-info .alert-icon-wrap { background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); }
.alert-card.severity-info .alert-icon { color: #43A047; }

.alert-glow { position: absolute; top: 0; right: 0; width: 60px; height: 60px; background: radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, transparent 70%); pointer-events: none; }

.alert-icon-wrap { flex-shrink: 0; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.alert-icon { font-size: 22px; transition: transform 0.3s; }
.alert-card:hover .alert-icon { transform: scale(1.1); }

.alert-body { flex: 1; min-width: 0; }
.alert-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.alert-title-text { font-size: 15px; font-weight: 600; color: #2E3A2F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.severity-tag { flex-shrink: 0; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.severity-tag.critical { background: #FFEBEE; color: #E53935; }
.severity-tag.warning { background: #FFF3E0; color: #EF6C00; }
.severity-tag.info { background: #E8F5E9; color: #43A047; }

.alert-message { font-size: 13px; color: #6B7C6F; margin: 0 0 8px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.alert-meta { display: flex; align-items: center; gap: 4px; color: #90A495; font-size: 12px; }
.meta-icon { font-size: 12px; }

.empty-state { text-align: center; padding: 40px 20px; }
.empty-illustration { width: 80px; height: 80px; margin: 0 auto 16px; background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.empty-icon { font-size: 36px; color: #81C784; }
.empty-text { font-size: 16px; font-weight: 600; color: #4CAF50; margin: 0 0 4px; }
.empty-hint { font-size: 13px; color: #A5D6A7; margin: 0; }

.modal-footer { display: flex; align-items: center; justify-content: space-between; padding: 16px 28px 20px; background: linear-gradient(180deg, #FFFFFF 0%, #F7FBF8 100%); border-top: 1px solid #E8F5E9; }
.footer-stats { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #6B7C6F; }
.stat-dot { width: 8px; height: 8px; background: #4CAF50; border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
.stat-divider { color: #C8E6C9; }
.unread-count { color: #E57373; font-weight: 500; }

.view-all-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); border: none; border-radius: 25px; color: white; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.3s; }
.view-all-btn:hover { transform: translateX(4px); box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3); }
.btn-arrow { font-size: 14px; transition: transform 0.3s; }
.view-all-btn:hover .btn-arrow { transform: translateX(3px); }

.alert-fade-enter-active, .alert-fade-leave-active { transition: all 0.4s ease; }
.alert-fade-enter-from { opacity: 0; transform: translateX(-20px); }
.alert-fade-leave-to { opacity: 0; transform: translateX(20px); }
.alert-fade-move { transition: transform 0.4s ease; }
</style>

<style>
/* 非scoped样式 - 用于Teleport到body的元素 */
.alert-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, rgba(148, 163, 184, 0.3) 0%, rgba(15, 23, 42, 0.6) 100%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.alert-modal {
  /* background handled by .modal-container */
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow: hidden;
  width: 100%;
  max-width: 600px;
  animation: modal-enter 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>