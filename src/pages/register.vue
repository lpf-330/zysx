<script setup>
import { onBeforeUnmount, onUnmounted, ref } from 'vue';
import router from '../router'
import { RouterLink } from 'vue-router';
import axios from 'axios';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/authStore';


const account = ref('')
const password = ref('')
const passwordTest = /^[a-zA-Z0-9_]{1,20}$/
const accountTest = /^[a-zA-Z0-9_]{1,18}$/

const rigisterTest = () => {
  console.log(122);

  if (account.value) {
    if (password.value) {

      if (accountTest.test(account.value)) {
        if (passwordTest.test(password.value)) {
          console.log(123);



        } else {
          alert("密码必须在20个字符内，且仅限英文字母，数字和下划线")
        }
      } else {
        alert("密码必须在18个字符内，且仅限英文字母，数字和下划线")
      }

    } else {
      alert("请输入密码")
    }
  } else {
    alert("请输入账号")
  }
}

/**
 * 用户注册（插入一个新用户时，用户名默认为他的账号）
 * 请求参数：
 * account：String
 * password：String
 * 
 * 返回参数：
 * 是否注册成功
 * 
 */
const register = async (account, password) => {

  try {

    const url = "http://localhost:8081/"
    const response = await axios.post(url, {
      account: account,
      password: password
    },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    console.log("响应登录", response.data);



  } catch (error) {
    console.error("出错", error);
    alert("加载失败，请稍后再试。"); // 友好的错误提示  
  }

}

const toLogin = () => {
  router.push('/login')
}

</script>

<template>
  <div class="backgrand">
    <form class="from">
      <span class="iconfont icon-fanhui" @click="toLogin"></span>
      <h1>用户注册</h1>
      <input type="text" name="AccountNumber" id="account" class="account" placeholder="&nbsp&nbsp请输入账号"
        v-model="account">
      <input type="text" name="KeyWord" id="passward" class="password" placeholder="&nbsp&nbsp请输入密码" v-model="password">
      <input type="button" id="rigister" class="rigister" value="注册" @click="rigisterTest">
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
  position: relative;
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

.rigister {
  width: 43%;
  height: 8%;
  font-size: 0.14rem;
  color: #fff;
  border-radius: 0.02rem;
  background-color: rgb(0, 140, 255);
  box-shadow: rgba(0, 140, 255, 0.63) 0 20px 30px -10px;
  border: 0;
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.rigister:hover {
  box-shadow: rgba(0, 140, 255, 0.63) 0 10px 30px -10px;
}

.iconfont {
  position: absolute;
  font-size: 0.15rem;
  font-weight: 500;
  left: 5%;
  top: 5%;
  color: #767676;
  cursor: pointer;
}

.iconfont {
  position: absolute;
  font-size: 0.15rem;
  font-weight: 500;
  left: 5%;
  top: 5%;
  color: #767676;
  cursor: pointer;
}
</style>
