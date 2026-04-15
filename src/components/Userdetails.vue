<script setup>
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { updateUserInfo } from '../api/user';
import { ElMessage } from 'element-plus';

const userInfoStore = storeToRefs(useUserInfoStore())

const dialogFormVisible = ref(false)
const form = ref({
    Username: '',
    gender: '',
    Age: '',
    Height: '',
    Weight: '',
    phone_number: ''
})

const openDialog = () => {
    form.value = {
        Username: userInfoStore.Username.value,
        gender: userInfoStore.gender.value,
        Age: userInfoStore.Age.value,
        Height: userInfoStore.Height.value,
        Weight: userInfoStore.Weight.value,
        phone_number: userInfoStore.phone_number.value
    }
    dialogFormVisible.value = true
}

const confirmUpdate = async () => {
    try {
        await updateUserInfo(
            userInfoStore.user_id.value,
            form.value.Username,
            form.value.gender,
            form.value.Age,
            form.value.Height,
            form.value.Weight,
            form.value.phone_number
        )
        userInfoStore.Username.value = form.value.Username
        userInfoStore.gender.value = form.value.gender
        userInfoStore.Age.value = form.value.Age
        userInfoStore.Height.value = form.value.Height
        userInfoStore.Weight.value = form.value.Weight
        userInfoStore.phone_number.value = form.value.phone_number

        ElMessage({
            message: '信息修改成功',
            type: 'success',
        })
        dialogFormVisible.value = false
    } catch (error) {
        ElMessage({
            message: '修改失败，请稍后再试',
            type: 'error',
        })
    }
}
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
            <button class="edit-btn" @click="openDialog">
                <span class="edit-icon">✎</span>
                <span class="edit-text">编辑信息</span>
            </button>
        </div>

        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-icon">{{ userInfoStore.gender.value === '女' ? '♀' : '♂' }}</span>
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
                    <span class="stat-value">{{ userInfoStore.Height.value }}cm</span>
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

        <!-- 编辑信息弹窗 -->
        <div class="popup-overlay" v-if="dialogFormVisible" @click.self="dialogFormVisible = false">
            <div class="popup-card">
                <div class="popup-header">
                    <div class="header-title">
                        <span class="title-icon">✎</span>
                        <span class="title-text">编辑个人信息</span>
                    </div>
                    <button class="close-btn" @click="dialogFormVisible = false">×</button>
                </div>

                <div class="popup-body">
                    <div class="form-grid">
                        <div class="form-item">
                            <label class="form-label">姓名</label>
                            <input v-model="form.Username" class="form-input" placeholder="请输入姓名" />
                        </div>

                        <div class="form-item">
                            <label class="form-label">性别</label>
                            <select v-model="form.gender" class="form-select">
                                <option value="">请选择</option>
                                <option value="男">男</option>
                                <option value="女">女</option>
                            </select>
                        </div>

                        <div class="form-item">
                            <label class="form-label">年龄</label>
                            <input v-model="form.Age" class="form-input" type="number" placeholder="请输入年龄" />
                        </div>

                        <div class="form-item">
                            <label class="form-label">身高(cm)</label>
                            <input v-model="form.Height" class="form-input" type="number" placeholder="请输入身高" />
                        </div>

                        <div class="form-item">
                            <label class="form-label">体重(kg)</label>
                            <input v-model="form.Weight" class="form-input" type="number" placeholder="请输入体重" />
                        </div>

                        <div class="form-item">
                            <label class="form-label">手机号</label>
                            <input v-model="form.phone_number" class="form-input" placeholder="请输入手机号" />
                        </div>
                    </div>
                </div>

                <div class="popup-footer">
                    <button class="btn-cancel" @click="dialogFormVisible = false">取消</button>
                    <button class="btn-confirm" @click="confirmUpdate">确认修改</button>
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
    overflow: visible;
    position: relative;
    z-index: 10;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.12rem;
    padding: 0.15rem;
    background: linear-gradient(135deg, #2D572D 0%, #3d7a3d 100%);
    justify-content: space-between;
}

.edit-btn {
    display: flex;
    align-items: center;
    gap: 0.05rem;
    padding: 0.06rem 0.1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.06rem;
    color: #fff;
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.09rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.edit-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.edit-icon {
    font-size: 0.1rem;
}

.edit-text {
    font-weight: 500;
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

/* 弹窗样式 */
.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.popup-card {
    width: 4rem;
    background: #fff;
    border-radius: 0.15rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    animation: slideUp 0.3s ease;
    position: relative;
    z-index: 10000;
}

@keyframes slideUp {
    from { transform: translateY(0.2rem); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.18rem 0.2rem;
    background: linear-gradient(135deg, #2D572D 0%, #3d7a3d 100%);
}

.header-title {
    display: flex;
    align-items: center;
    gap: 0.1rem;
}

.title-icon {
    font-size: 0.16rem;
    color: #fff;
}

.title-text {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.15rem;
    font-weight: 600;
    color: #fff;
}

.close-btn {
    width: 0.28rem;
    height: 0.28rem;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: #fff;
    font-size: 0.16rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.popup-body {
    padding: 0.2rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.15rem;
}

.form-item {
    display: flex;
    flex-direction: column;
    gap: 0.06rem;
}

.form-item:last-child {
    grid-column: span 2;
}

.form-label {
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.1rem;
    color: #666;
}

.form-input,
.form-select {
    padding: 0.1rem 0.12rem;
    border: 1px solid rgba(45, 87, 45, 0.2);
    border-radius: 0.06rem;
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.12rem;
    outline: none;
    transition: border-color 0.2s ease;
}

.form-input:focus,
.form-select:focus {
    border-color: #2D572D;
}

.form-select {
    background: #fff;
    cursor: pointer;
}

.popup-footer {
    display: flex;
    gap: 0.12rem;
    padding: 0.15rem 0.2rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    background: #fafafa;
}

.btn-cancel,
.btn-confirm {
    flex: 1;
    padding: 0.1rem;
    border: none;
    border-radius: 0.06rem;
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.12rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-cancel {
    background: #f5f5f5;
    color: #666;
}

.btn-cancel:hover {
    background: #e8e8e8;
}

.btn-confirm {
    background: linear-gradient(135deg, #2D572D 0%, #3d7a3d 100%);
    color: #fff;
}

.btn-confirm:hover {
    background: linear-gradient(135deg, #3d7a3d 0%, #4a8a4a 100%);
}
</style>