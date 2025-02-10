<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';



let selected = ref(0)
const router = useRouter()
const items = ['home', 'health', 'person']

const select = (i) => {
    selected.value = i
    router.push({ name: items[i] })
}

const exit = () => {
    router.push('/')
}

</script>

<template>
    <div class="content">
        <div class="logo">
            <img src="../assets/img/logoText.png" alt="" class="logoImg">
        </div>
        <div class="menu">
            <div class="opts">
                <div class="home" @click="select(0)">
                    <span class="iconfont icon-zhuye" :class="{ active: selected === 0 }"></span>
                    <span class="menuText" :class="{ active: selected === 0 }">主页</span>
                </div>
                <div class="health" @click="select(1)">
                    <span class="iconfont icon-jiankang" :class="{ active: selected === 1 }"></span>
                    <span class="menuText" :class="{ active: selected === 1 }">健康</span>
                </div>
                <div class="person" @click="select(2)">
                    <span class="iconfont icon-yonghu" :class="{ active: selected === 2 }"></span>
                    <span class="menuText" :class="{ active: selected === 2 }">用户</span>
                </div>
            </div>
            <span class="iconfont YLine" :style="{ top: `${1.35 + selected * 0.68}rem` }"></span>
        </div>
        <div class="exit">
            <span class="iconfont icon-tuichu" @click="exit"></span>
        </div>
    </div>
</template>

<style scoped>
.content {
    background-color: #fff;
    height: 100%;
    width: 13%;
    display: flex;
    flex-direction: column;
}

.logo {
    width: 100%;
    height: 20%;
    padding-left: 0.3rem;
    padding-top: 0.35rem;
    box-sizing: border-box;
}

.menu {
    width: 100%;
    height: 70%;
}

.opts {
    display: flex;
    flex-direction: column;
    padding-left: 15%;
    padding-top: 5%;
    box-sizing: border-box;
}

.exit {
    width: 100%;
    height: 10%;
    box-sizing: border-box;
    padding-left: 10%;
    padding-top: 10%;
}

.logoImg {
    width: 0.7rem;
    height: 0.65rem;
}

.home,
.health,
.person {
    width: 90%;
    height: 0.4rem;
    margin-bottom: 20%;
    margin-top: 5%;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
}

.iconfont {
    font-size: 0.23rem;
    color: #C2DEEC;
    transition-duration: 0.5s;
}

.menuText {
    font-size: 0.14rem;
    font-family: 'SiYuanHeiTi';
    color: #C2DEEC;
    margin-left: 20%;
    margin-right: 27%;
    transition-duration: 0.5s;
}


.YLine {
    display: inline-block;
    width: 10%;
    color: #6EB4FF;
    position: absolute;
    left: 1.05rem;
    transition-duration: 0.5s;
}

.YLine::before {
    content: "\e6be";
    float: left;
}

.active {
    color: #6EB4FF;
}

.icon-tuichu {
    cursor: pointer;
}
</style>