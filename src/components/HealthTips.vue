<template>
  <div class="health-tips">
    <div class="tips-header">
      <div class="tips-icon">☘</div>
      <span class="tips-title">健康小贴士</span>
    </div>
    <div class="tips-content">
      <div class="tip-item" v-for="(tip, index) in tips" :key="index">
        <div class="tip-icon">{{ tip.icon }}</div>
        <div class="tip-text">{{ tip.text }}</div>
      </div>
    </div>
    <div class="tips-footer">
      <span class="footer-text">每日健康提醒</span>
      <div class="pulse-dot"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const tips = ref([
  { icon: '💧', text: '建议每日饮用1500-2000ml水' },
  { icon: '🚶', text: '每天步行8000步有助于健康' },
  { icon: '😴', text: '保持7-8小时充足睡眠' },
  { icon: '🥗', text: '均衡饮食，少油少盐少糖' }
]);
</script>

<style scoped>
.health-tips {
  background: linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%);
  border-radius: 0.12rem;
  padding: 0.12rem;
  box-shadow: 0 2px 12px rgba(45, 87, 45, 0.1);
  border: 1px solid rgba(129, 199, 132, 0.3);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 0.06rem;
  padding-bottom: 0.08rem;
  border-bottom: 1px solid rgba(45, 87, 45, 0.1);
  margin-bottom: 0.1rem;
}

.tips-icon {
  font-size: 0.18rem;
}

.tips-title {
  font-size: 0.13rem;
  font-weight: 600;
  color: #2D572D;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.tips-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.08rem;
  padding: 0.06rem 0.08rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.06rem;
  transition: all 0.2s ease;
}

.tip-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateX(2px);
}

.tip-icon {
  font-size: 0.14rem;
  flex-shrink: 0;
}

.tip-text {
  font-size: 0.1rem;
  color: #4a5568;
  line-height: 1.4;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.tips-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.08rem;
  border-top: 1px solid rgba(45, 87, 45, 0.1);
  margin-top: 0.08rem;
}

.footer-text {
  font-size: 0.09rem;
  color: #81C784;
  font-family: 'DIN Alternate', 'Roboto', sans-serif;
}

.pulse-dot {
  width: 0.08rem;
  height: 0.08rem;
  background: #81C784;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
</style>
