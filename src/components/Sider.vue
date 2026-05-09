<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';

const siderMode = storeToRefs(useUserInfoStore()).siderMode
const router = useRouter()
const authStore = useAuthStore()
const items = ['home', 'heartData', 'medicalQA', 'person']
let isMounted = false

onMounted(() => {
    isMounted = true
})

onUnmounted(() => {
    isMounted = false
})

const select = (i) => {
    if (!isMounted) return
    siderMode.value = i
    // 使用 window.location.hash 强制页面刷新
    // 这是临时解决方案，确保路由切换正常工作
    const routeName = items[i]
    const currentPath = window.location.hash.slice(1) // 移除 # 号

    // 根据路由名称构建路径
    let targetPath
    switch(routeName) {
        case 'home':
            targetPath = '/index/home'
            break
        case 'heartData':
            targetPath = '/index/health/heartData'
            break
        case 'medicalQA':
            targetPath = '/index/medicalQA'
            break
        case 'person':
            targetPath = '/index/person'
            break
        default:
            targetPath = '/index/home'
    }

    if (currentPath !== targetPath) {
        window.location.hash = targetPath
    }
}

const exit = () => {
    if (!isMounted) return
    // 清除登录状态
    authStore.logout()
    // 跳转到登录页
    router.push('/login')
}
</script>

<template>
    <div class="header">
        <div class="logo">
            <img src="/首页logo.png" alt="" class="logoImg">
            <span class="logo-text">椿龄护安</span>
        </div>
        <div class="menu">
            <div class="opts">
                <div class="menuItem home" @click="select(0)" :class="{ active: siderMode === 0 }">
                    <span class="iconfont icon-zhuye"></span>
                    <span class="menuText">主页</span>
                </div>
                <div class="menuItem health" @click="select(1)" :class="{ active: siderMode === 1 }">
                    <span class="iconfont icon-jiankang"></span>
                    <span class="menuText">健康</span>
                </div>
                <div class="menuItem person" @click="select(2)" :class="{ active: siderMode === 2 }">
                    <span class="iconfont icon-V"></span>
                    <span class="menuText">咨询</span>
                </div>
                <div class="menuItem person" @click="select(3)" :class="{ active: siderMode === 3 }">
                    <span class="iconfont icon-yonghu"></span>
                    <span class="menuText">用户</span>
                </div>
            </div>
        </div>
        <div class="exit" @click="exit">
            <span class="iconfont icon-tuichu"></span>
            <span class="exit-text">退出</span>
        </div>
    </div>
</template>

<style scoped>
.header {
    background: linear-gradient(90deg, #2D572D 0%, #3d7a3d 50%, #2D572D 100%);
    height: 0.5rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    position: relative;
    z-index: 100;
    padding: 0 0.2rem;
}

.logo {
    height: 100%;
    display: flex;
    align-items: center;
    padding-right: 0.3rem;
}

.logoImg {
    height: 0.5rem;
    width: auto;
    object-fit: contain;
}

.logo-text {
    font-family: 'STXingkai', 'STKaiti', 'KaiTi', '楷体', serif;
    font-size: 0.24rem;
    font-weight: 500;
    color: #fff;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), 0 0 12px rgba(255, 255, 255, 0.15);
    letter-spacing: 0.1rem;
    margin-left: 0.15rem;
}

.menu {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.opts {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
}

.menuItem {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 0.5rem;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
}

.menuItem:hover {
    background: rgba(255, 255, 255, 0.1);
}

.menuItem.active {
    background: rgba(255, 255, 255, 0.15);
}

.menuItem.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 3px;
    background: #fff;
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
}

.iconfont {
    font-size: 0.14rem;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.25s ease;
}

.menuText {
    font-size: 0.12rem;
    font-family: 'SiYuanHeiTi';
    color: rgba(255, 255, 255, 0.5);
    margin-left: 0.05rem;
    transition: all 0.25s ease;
}

.menuItem:hover .iconfont,
.menuItem:hover .menuText {
    color: rgba(255, 255, 255, 0.85);
}

.menuItem.active .iconfont,
.menuItem.active .menuText {
    color: #fff;
}

.exit {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 0.2rem;
    cursor: pointer;
    transition: all 0.25s ease;
}

.exit:hover {
    background: rgba(255, 107, 107, 0.25);
}

.icon-tuichu {
    font-size: 0.14rem;
    color: rgba(255, 255, 255, 0.4);
    transition: all 0.25s ease;
}

.exit-text {
    font-size: 0.11rem;
    font-family: 'SiYuanHeiTi';
    color: rgba(255, 255, 255, 0.4);
    margin-left: 0.04rem;
    transition: all 0.25s ease;
}

.exit:hover .icon-tuichu,
.exit:hover .exit-text {
    color: #ff6b6b;
}
</style>
