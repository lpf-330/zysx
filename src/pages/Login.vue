<script setup>
import { onBeforeUnmount, onUnmounted, ref } from 'vue';
import router from '../router'
import { RouterLink } from 'vue-router';
import axios from 'axios';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';

let userInfoStore = storeToRefs(useUserInfoStore())

const username = ref('')
const password = ref('')
const passwordTest = /^[a-zA-Z0-9_]{1,20}$/

const cancelTokenSource = axios.CancelToken.source();

let fetchUser = async () => {


    try {


        // const url = `http://localhost:8081/userInfo?username=${encodeURIComponent(username.value)}&password=${encodeURIComponent(password.value)}`; // 通过查询字符串拼接 URL  
        const url = 'http://localhost:8081/login'
        // 发送 GET 请求  
        const response = await axios.post(url, {
            cancelToken: cancelTokenSource.token,
            username: username.value,
            password: password.value
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        console.log(response);


        // if (response.data.code === 1) {
        //     userInfoStore.user.value = response.data.data;
        //     console.log("响应", userInfoStore.user.value);
        //     router.push({ name: 'index' })


        // } else {
        //     alert(user.value.msg)
        // }



    } catch (error) {
        console.error("出错", error);
        alert("加载失败，请稍后再试。"); // 友好的错误提示  

    }



}



const LoginTest = () => {
    console.log(122);

    if (username.value) {
        if (password.value) {
            if (passwordTest.test(password.value)) {
                console.log(123);

                fetchUser()


            } else {
                alert("密码必须在12个字符内，且仅限英文字母，数字和下划线")
            }
        } else {
            alert("请输入密码")
        }
    } else {
        alert("请输入账号")
    }
}

onBeforeUnmount(() => {
    cancelTokenSource.cancel('Component unmounted, request canceled');
})

</script>

<template>
    <div class="backgrand">
        <form class="from">
            <h1>登录</h1>
            <input type="text" name="AccountNumber" id="account" class="account" placeholder="&nbsp&nbsp请输入账号"
                v-model="username">
            <input type="text" name="KeyWord" id="passward" class="password" placeholder="&nbsp&nbsp请输入密码"
                v-model="password">
            <input type="button" id="login" class="login" value="登录" @click="LoginTest">
            <div class="linkBox">
                <!-- <router-link to="/admLogin" class="link">管理员登录</router-link> -->
                <router-link to="/register" class="link">用户注册</router-link>
            </div>
        </form>

    </div>
</template>

<style scoped>
.backgrand {
    width: 100%;
    height: 100%;
    background-color: #acacac57;
}

.from {
    padding-top: 10%;
    border: 1%;
    border-radius: 0.1rem;
    display: inline-block;
    position: fixed;
    top: 50%;
    left: 50%;
    right: 50%;
    transform: translate(-50%, -50%);
    height: 50%;
    width: 38%;
    margin: 0;
    padding: 0;
    text-align: center;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0px 0.5vh 1vh 0 #acacac;
}

.from h1 {
    font-size: 0.25rem;
    position: relative;
    top: -8%;
}

.account,
.password {
    position: relative;
    top: -5%;
    width: 40%;
    height: 6%;
    border-radius: 0.06rem;
    border-width: 0.02rem;
    padding-left: 2%;
    margin-bottom: 4%;
    font-size: 0.08rem;
    border-color: #e1e1e13e;
}

.login {
    width: 40%;
    height: 8%;
    font-size: 0.14rem;
    color: #fff;
    border-radius: 0.02rem;
    background-color: rgb(0, 140, 255);
    box-shadow: 0px 0.5vh 0.5vh 0 rgba(0, 140, 255, 0.63);
    border: 0;
    cursor: pointer;
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
</style>
