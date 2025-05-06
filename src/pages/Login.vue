<script setup>
import { onBeforeUnmount, onUnmounted, ref, onMounted } from 'vue';
import router from '../router'
import { RouterLink } from 'vue-router';
import axios from 'axios';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/authStore';
import useMedicalHistoryStore from "../stores/medicalHistory";

let userInfoStore = storeToRefs(useUserInfoStore())
const authStore = useAuthStore()

const account = ref('')
const password = ref('')
const passwordTest = /^[a-zA-Z0-9_]{1,20}$/


useUserInfoStore().fullReset()
useMedicalHistoryStore().fullReset()


const LoginTest = () => {
    console.log(122);

    if (account.value) {
        if (password.value) {
            if (passwordTest.test(password.value)) {
                console.log(123);

                authStore.login(account.value, password.value)

            } else {
                alert("密码必须在20个字符内，且仅限英文字母，数字和下划线")
            }
        } else {
            alert("请输入密码")
        }
    } else {
        alert("请输入账号")
    }
}

const toRegister = () => {
    // router.push({ name: 'register' })
    router.push('/register')
}


</script>

<template>
    <div class="backgrand">
        <div class="header">
            <div class="hero">
                <h1>您好 用户<br>
                    <span class="heroTxt">欢迎来到 </span>
                    <span class="gradient-text">智养生息</span>
                </h1>
                <p>如果您没有账号<br>可以<a @click="toRegister">点击这里</a>进行注册.</p>
            </div>
        </div>

        <form class="from">
            <!-- <h1>智养生息</h1> -->
            <input type="text" name="AccountNumber" id="account" class="account" placeholder="&nbsp&nbsp账号"
                v-model="account">
            <input type="password" name="KeyWord" id="passward" class="password" placeholder="&nbsp&nbsp密码"
                v-model="password">
            <input type="button" id="login" class="login" value="登录" @click="LoginTest">
            <div class="linkBox">
                <!-- <router-link to="/admLogin" class="link">管理员登录</router-link> -->
                <!-- <router-link to="/register" class="link">用户注册</router-link> -->
            </div>
        </form>

    </div>
</template>

<style scoped>
.backgrand {
    width: 100%;
    height: 100%;
    /* background-color: #acacac57; */
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    box-sizing: border-box;
    padding-left: 10%;
    padding-right: 10%;
}

.from {
    border: 1%;
    border-radius: 0.1rem;
    /* display: inline-block; */
    /* position: fixed;
    top: 50%;
    left: 50%;
    right: 50%;
    transform: translate(-50%, -50%); */
    height: 50%;
    width: 30%;
    margin: 0;
    padding: 0;
    text-align: center;
    /* background-color: white; */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* box-shadow: 0px 0.5vh 1vh 0 #acacac; */
}

/* .from h1 {
    font-size: 0.25rem;
    position: relative;
    top: -8%;
    font-family: 'FanYuanTi';
} */

.account,
.password {
    position: relative;
    top: -5%;
    width: 75%;
    height: 11%;
    border-radius: 0.06rem;
    border-width: 0.01rem;
    padding-left: 2%;
    margin-bottom: 7%;
    font-size: 0.08rem;
    border-color: #e1e1e11a;
    background-color: #f2f4ff;
}

.login {
    width: 75%;
    height: 12%;
    font-size: 0.14rem;
    color: #fff;
    border-radius: 0.06rem;
    background-color: rgb(0, 140, 255);
    box-shadow: rgba(0, 140, 255, 0.63) 0 20px 30px -10px;
    border: 0;
    cursor: pointer;
    transition: box-shadow 0.3s;
}

form input.login:hover {
    box-shadow: rgba(0, 140, 255, 0.63) 0 10px 30px -10px;
}

.link {
    font-size: 0.08rem;
    text-decoration: none;
}

.linkBox {
    width: 30%;
    margin-top: 2%;
}

.linkBox a:nth-of-type(1) {
    margin-right: 5%;
}

.linkBox a:nth-of-type(2) {
    margin-left: 5%;
}

.header {
    width: 28%;
    /* height: 20%; */
    /* background-color: aqua; */
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

.hero {
    flex: 1 0 66.6666%;
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 70px 0;

}

.hero h1 {
    font-size: 0.3rem;
}

.hero p {
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 0.1rem;
    font-weight: 400;
    line-height: 1.8;
    color: #333333;
    /* background-color: #fcfcff; */
    user-select: none;
    -webkit-user-drag: none;
}

.hero h1 .heroTxt {
    font-size: 0.2rem;
}

.hero::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 8%;
    width: 1.5rem;
    height: 0.5rem;
    /* background: linear-gradient(to right, #4460f1, #c471ed, #f64f59); */
    background: linear-gradient(to right, #00ffd5, #00fbff, #0073ff);
    z-index: -1;
    filter: blur(70px);
}

.hero a {
    font-weight: 500;
    color: #4460f1;
    transition: color .3s;
}

.hero a:hover {
    color: #333333;
    text-decoration: underline;
}

a {
    text-decoration: none;
    color: inherit;
    -webkit-tap-highlight-color: transparent;
}

.gradient-text {
    /* 设置渐变背景 */
    background: linear-gradient(to bottom right, #00ffd5, #0073ff);

    /* 将背景裁剪为文字形状 */
    -webkit-background-clip: text;
    background-clip: text;

    /* 设置文字颜色为透明以显示背景渐变 */
    color: transparent;

    /* 兼容性处理 */
    -webkit-text-fill-color: transparent;

    /* 其他样式 */
    /* font-size: 2rem; */
    /* font-weight: bold; */
}
</style>
