<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';
import { updateUserInfo } from '../api/user';
import { ElMessage } from 'element-plus';

const dialogFormVisible = ref(false)
const form = ref({
    Username: '',
    gender: '',
    Age: '',
    Height: '',
    Weight: '',
    phone_number: ''
})

const userInfoStore = storeToRefs(useUserInfoStore())

const router = useRouter()

const logout = () => {
    localStorage.clear();
    router.push('/');
}

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

    <div class="action-bar">
        <button class="action-btn edit" @click="openDialog">
            <span class="btn-icon">✎</span>
            <span class="btn-text">编辑信息</span>
        </button>
        <button class="action-btn logout" @click="logout">
            <span class="btn-icon">⏻</span>
            <span class="btn-text">退出登录</span>
        </button>
    </div>
</template>

<style scoped>
.action-bar {
    display: flex;
    gap: 0.08rem;
}

.action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.05rem;
    padding: 0.08rem 0.1rem;
    border: none;
    border-radius: 0.06rem;
    cursor: pointer;
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.1rem;
    transition: all 0.3s ease;
}

.action-btn.edit {
    background: linear-gradient(135deg, rgba(45, 87, 45, 0.08) 0%, rgba(45, 87, 45, 0.12) 100%);
    color: #2D572D;
}

.action-btn.edit:hover {
    background: linear-gradient(135deg, rgba(45, 87, 45, 0.15) 0%, rgba(45, 87, 45, 0.2) 100%);
}

.action-btn.logout {
    background: linear-gradient(135deg, rgba(229, 115, 115, 0.08) 0%, rgba(229, 115, 115, 0.12) 100%);
    color: #E57373;
}

.action-btn.logout:hover {
    background: linear-gradient(135deg, rgba(229, 115, 115, 0.15) 0%, rgba(229, 115, 115, 0.2) 100%);
}

.btn-icon {
    font-size: 0.1rem;
}

.btn-text {
    font-weight: 500;
}

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
    z-index: 1000;
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