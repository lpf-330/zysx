<script setup>
import { ref } from 'vue';
import router from '../router'
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore()

const account = ref('')
const password = ref('')
const passwordTest = /^[a-zA-Z0-9_]{1,20}$/
const loginType = ref('user') // 'user' 或 'child'

const LoginTest = () => {
    console.log('登录类型:', loginType.value);

    if (account.value) {
        if (password.value) {
            if (passwordTest.test(password.value)) {
                console.log('开始登录');
                authStore.login(account.value, password.value, loginType.value)
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
    router.push('/register')
}

// 切换登录类型
const toggleLoginType = () => {
    loginType.value = loginType.value === 'user' ? 'child' : 'user'
    // 清空输入框
    account.value = ''
    password.value = ''
}

</script>

<template>
    <div class="backgrand">
        <div class="header">
            <div class="hero">
                <h1>{{ loginType === 'user' ? '您好 用户' : '您好 子女' }}<br>
                    <span class="heroTxt">欢迎来到 </span>
                    <span class="gradient-text">颐康智联</span>
                </h1>
                <p>
                    <template v-if="loginType === 'user'">
                        如果您没有账号<br>可以<a @click="toRegister">点击这里</a>进行注册.
                    </template>
                    <template v-else>
                        如果您是用户登录<br>可以<a @click="toggleLoginType">点击这里</a>切换回用户登录.
                    </template>
                </p>
            </div>
        </div>

        <form class="from">
            <!-- 登录类型切换按钮 -->
            <div class="login-type-toggle" @click="toggleLoginType">
                {{ loginType === 'user' ? '切换到子女端登录' : '切换到用户登录' }}
            </div>
            
            <div class="login-type-indicator">
                {{ loginType === 'user' ? '用户登录' : '子女端登录' }}
            </div>
            
            <input type="text" name="AccountNumber" id="account" class="account" 
                   :placeholder="loginType === 'user' ? '&nbsp;&nbsp;用户账号' : '&nbsp;&nbsp;子女账号'"
                   v-model="account">
            <input type="password" name="KeyWord" id="password" class="password" 
                   placeholder="&nbsp;&nbsp;密码"
                   v-model="password">
            <input type="button" id="login" class="login" 
                   :value="loginType === 'user' ? '用户登录' : '子女端登录'" 
                   @click="LoginTest">
            <div class="linkBox">
                <!-- 用户注册链接只在用户登录时显示 -->
                <router-link v-if="loginType === 'user'" to="/register" class="link">用户注册</router-link>
            </div>
        </form>
    </div>
</template>

<style scoped>
.backgrand {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    box-sizing: border-box;
    padding-left: 10%;
    padding-right: 10%;
}

.from {
    border-radius: 0.1rem;
    height: 50%;
    width: 30%;
    margin: 0;
    padding: 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
}

/* 新增：登录类型切换按钮 */
.login-type-toggle {
    position: absolute;
    top: -0.15rem;
    right: 0;
    font-size: 0.08rem;
    color: #4460f1;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0.03rem 0.1rem;
    border: 1px solid #e1e1e1;
    border-radius: 0.15rem;
    background-color: white;
    user-select: none;
}

.login-type-toggle:hover {
    background-color: #f5f5f5;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 新增：登录类型指示器 */
.login-type-indicator {
    font-size: 0.12rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 0.2rem;
    user-select: none;
}

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
    transition: box-shadow 0.3s, background-color 0.3s;
}

form input.login:hover {
    box-shadow: rgba(0, 140, 255, 0.63) 0 10px 30px -10px;
}

/* 子女端登录时按钮样式 */
.is-child .login {
    background-color: #ff6b6b;
    box-shadow: rgba(255, 107, 107, 0.63) 0 20px 30px -10px;
}

.is-child .login:hover {
    box-shadow: rgba(255, 107, 107, 0.63) 0 10px 30px -10px;
}

.linkBox {
    width: 100%;
    margin-top: 0.05rem;
    display: flex;
    justify-content: center;
}

.link {
    font-size: 0.08rem;
    text-decoration: none;
    color: #4460f1;
    transition: color .3s;
}

.link:hover {
    color: #333333;
    text-decoration: underline;
}

.header {
    width: 28%;
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
    background: linear-gradient(to bottom right, #00ffd5, #0073ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
}
</style>