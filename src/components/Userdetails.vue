<script setup>
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';

const userInfoStore = storeToRefs(useUserInfoStore())
</script>

<template>
    <div class="profile-card">
        <div class="card-header">
            <div class="avatar-wrapper">
                <div
                    class="avatar"
                    :style="{
                        backgroundImage: `url(${(userInfoStore.Avatar.value === '' || userInfoStore.Avatar.value === null) ? 'src/assets/img/userAvater.jpg' : userInfoStore.Avatar.value})`
                    }"
                ></div>
                <div class="status-dot"></div>
            </div>
            <div class="user-info">
                <h3 class="username">{{ userInfoStore.Username.value }}</h3>
                <span class="user-tag">健康管理用户</span>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-icon">♂♀</span>
                <div class="stat-content">
                    <span class="stat-label">性别</span>
                    <span class="stat-value">{{ userInfoStore.gender.value }}</span>
                </div>
            </div>
            <div class="stat-item">
                <span class="stat-icon">✧</span>
                <div class="stat-content">
                    <span class="stat-label">年龄</span>
                    <span class="stat-value">{{ userInfoStore.Age.value }}岁</span>
                </div>
            </div>
            <div class="stat-item">
                <span class="stat-icon">↕</span>
                <div class="stat-content">
                    <span class="stat-label">身高</span>
                    <span class="stat-value">{{ userInfoStore.Height.value * 100 }}cm</span>
                </div>
            </div>
            <div class="stat-item">
                <span class="stat-icon">⚖</span>
                <div class="stat-content">
                    <span class="stat-label">体重</span>
                    <span class="stat-value">{{ userInfoStore.Weight.value }}kg</span>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.profile-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%);
    border-radius: 0.12rem;
    box-shadow: 0 2px 12px rgba(45, 87, 45, 0.06);
    border: 1px solid rgba(45, 87, 45, 0.06);
    overflow: hidden;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.12rem;
    padding: 0.15rem;
    background: linear-gradient(135deg, #2D572D 0%, #3d7a3d 100%);
}

.avatar-wrapper {
    position: relative;
}

.avatar {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: #e0e0e0;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.status-dot {
    position: absolute;
    bottom: 0.02rem;
    right: 0.02rem;
    width: 0.1rem;
    height: 0.1rem;
    border-radius: 50%;
    background: #4CAF50;
    border: 2px solid #fff;
}

.user-info {
    flex: 1;
}

.username {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.14rem;
    font-weight: 600;
    color: #fff;
    margin: 0;
}

.user-tag {
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.09rem;
    color: rgba(255, 255, 255, 0.7);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.08rem;
    padding: 0.12rem;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.06rem;
    padding: 0.08rem;
    background: rgba(45, 87, 45, 0.03);
    border-radius: 0.06rem;
}

.stat-icon {
    font-size: 0.14rem;
    color: #2D572D;
    width: 0.24rem;
    text-align: center;
}

.stat-content {
    display: flex;
    flex-direction: column;
}

.stat-label {
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.08rem;
    color: #999;
}

.stat-value {
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.11rem;
    font-weight: 600;
    color: #333;
}

.contact-row {
    display: flex;
    align-items: center;
    gap: 0.08rem;
    padding: 0.1rem 0.12rem;
    border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.contact-icon {
    font-size: 0.12rem;
    color: #2D572D;
}

.contact-value {
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.11rem;
    color: #666;
}
</style>