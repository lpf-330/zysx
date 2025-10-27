import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '../router'
import useUserInfoStore from './user'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import useMedicalHistoryStore from './medicalHistory'
import { userLogin } from '../api/login'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || null)
    const user = ref(null)

    // 登录方法
    // const login = async (credentials) => {
    //     const res = await fetch('/api/login', {
    //         method: 'POST',
    //         body: JSON.stringify(credentials)
    //     })
    //     const data = await res.json()

    //     token.value = data.token
    //     user.value = data.user
    //     localStorage.setItem('token', data.token)

    //     // 登录后重定向到首页（会被路由守卫再次拦截）
    //     router.push('/home')
    // }


    const login = async (account, password) => {


        try {
            console.log('login', account, password);


            const url = "/api/userInfo"
            // const url = 'http://localhost:8081/api/userInfo'
            const response = await userLogin(account, password)

            console.log("响应登录", response);

            if (response.code === 1) {
                const userInfoStore = storeToRefs(useUserInfoStore())

                token.value = response.data.token
                localStorage.setItem('token', response.data.token)

                userInfoStore.user_id.value = response.data.user_id
                userInfoStore.Username.value = response.data.username
                userInfoStore.Age.value = response.data.age
                userInfoStore.Avatar.value = response.data.avatar
                userInfoStore.Height.value = response.data.height
                userInfoStore.Weight.value = response.data.weight
                userInfoStore.gender.value = response.data.gender
                userInfoStore.phone_number.value = response.data.phone_number

                router.push({ name: 'index' })

            } else {
                alert(response.msg)
            }

        } catch (error) {
            console.error("出错", error);
            alert("加载失败，请稍后再试。"); // 友好的错误提示  
        }

    }

    // 退出方法
    const logout = () => {
        token.value = null
        user.value = null
        localStorage.removeItem('token')

        useUserInfoStore().fullReset()
        useMedicalHistoryStore().fullReset()
    }

    return { token, user, login, logout }
})