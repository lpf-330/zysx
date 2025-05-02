import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '../router'
import useUserInfoStore from './user'
import { storeToRefs } from 'pinia'
import axios from 'axios'

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


            const url = "http://localhost:8081/userInfo"
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

            if (response.data.code === 1) {
                const userInfoStore = storeToRefs(useUserInfoStore())

                token.value = response.data.data.token
                localStorage.setItem('token', response.data.data.token)

                userInfoStore.user_id.value = response.data.data.user_id
                userInfoStore.Username.value = response.data.data.username
                userInfoStore.Age.value = response.data.data.age
                userInfoStore.Avatar.value = response.data.data.avatar
                userInfoStore.Height.value = response.data.data.height
                userInfoStore.Weight.value = response.data.data.weight
                userInfoStore.gender.value = response.data.data.gender
                userInfoStore.phone_number.value = response.data.data.phone_number

                router.push({ name: 'index' })

            } else {
                alert(response.data.msg)
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
    }

    return { token, user, login, logout }
})