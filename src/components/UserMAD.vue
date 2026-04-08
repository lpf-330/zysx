<script setup>
import useMedicalHistoryStore from '../stores/medicalHistory';
import { storeToRefs } from 'pinia';

const medicalHistoryStore = storeToRefs(useMedicalHistoryStore())

const hasRecord = () => {
    const value = medicalHistoryStore.medication_compliance.value;
    return value !== '' && value !== null;
};
</script>

<template>
    <div class="medication-card">
        <div class="card-header">
            <span class="header-icon">◆</span>
            <span class="header-title">用药记录</span>
            <span class="status-indicator" :class="{ 'has': hasRecord() }">
                <span class="status-dot"></span>
                <span class="status-text">{{ hasRecord() ? '有用药' : '暂无' }}</span>
            </span>
        </div>

        <div class="card-content">
            <div class="info-row">
                <span class="info-label">依从性</span>
                <span class="info-value high">{{ medicalHistoryStore.medication_compliance.value || '暂无记录' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">药品名称</span>
                <span class="info-value">盐酸二甲双胍</span>
            </div>
            <div class="info-row">
                <span class="info-label">剂量</span>
                <span class="info-value">500mg × 2次/日</span>
            </div>
            <div class="info-row">
                <span class="info-label">服用时间</span>
                <span class="info-value">早8:00 晚20:00</span>
            </div>
            <div class="info-row">
                <span class="info-label">剩余药量</span>
                <span class="info-value warn">还剩5天</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.medication-card {
    background: linear-gradient(135deg, #ffffff 0%, #fafcf8 100%);
    border-radius: 0.12rem;
    box-shadow: 0 2px 12px rgba(45, 87, 45, 0.06);
    border: 1px solid rgba(45, 87, 45, 0.06);
    overflow: hidden;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.08rem;
    padding: 0.1rem 0.12rem;
    border-bottom: 1px solid rgba(45, 87, 45, 0.06);
}

.header-icon {
    font-size: 0.12rem;
    color: #2D572D;
}

.header-title {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.12rem;
    font-weight: 600;
    color: #1a1a1a;
}

.status-indicator {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.04rem;
    padding: 0.02rem 0.08rem;
    border-radius: 0.1rem;
    background: rgba(153, 153, 153, 0.1);
}

.status-indicator.has {
    background: rgba(129, 199, 132, 0.12);
}

.status-dot {
    width: 0.05rem;
    height: 0.05rem;
    border-radius: 50%;
    background: #999;
}

.status-indicator.has .status-dot {
    background: #4CAF50;
}

.status-text {
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.09rem;
    color: #999;
}

.status-indicator.has .status-text {
    color: #388E3C;
}

.card-content {
    padding: 0.1rem 0.12rem;
}

.info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.08rem 0.1rem;
    background: rgba(45, 87, 45, 0.02);
    border-radius: 0.06rem;
}

.info-label {
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.1rem;
    color: #666;
}

.info-value {
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.1rem;
    color: #333;
}

.info-value.high {
    color: #4CAF50;
    font-weight: 600;
}

.info-value.warn {
    color: #FF9800;
    font-weight: 500;
}
</style>