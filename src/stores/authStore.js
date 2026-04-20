import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '../router'
import useUserInfoStore from './user'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import useMedicalHistoryStore from './medicalHistory'
import { userLogin, childLogin } from '../api/login'
import useChildUserStore from './childUser'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || null)
    const user = ref(null)

    // 登录方法 - 现在支持用户和监护人端登录
    const login = async (account, password, loginType = 'user') => {
        try {
            console.log('login', account, password, loginType);

            if (loginType === 'user') {
                // 用户登录
                const response = await userLogin(account, password)
                console.log("用户登录响应", response);

                if (response.code === 1) {
                    const userInfoStore = storeToRefs(useUserInfoStore())

                    token.value = response.data.token
                    localStorage.setItem('token', response.data.token)

                    userInfoStore.user_id.value = response.data.id
                    userInfoStore.Username.value = response.data.username
                    userInfoStore.Age.value = response.data.birthDate
                    userInfoStore.Avatar.value = response.data.avatar
                    userInfoStore.Height.value = response.data.height
                    userInfoStore.Weight.value = response.data.weight
                    userInfoStore.gender.value = response.data.gender
                    userInfoStore.phone_number.value = response.data.phone

                    router.push({ name: 'index' })
                } else {
                    alert(response.msg)
                }
            } else if (loginType === 'child') {
                // 监护人端登录
                const response = await childLogin(account, password)
                console.log("子女登录响应", response);

                if (response.code === 1) {
                    token.value = response.data.token
                    localStorage.setItem('token', response.data.token)

                    // 设置子女信息和父母信息
                    const childUserStore = useChildUserStore()
                    childUserStore.setChildAndParents(response.data.childInfo, response.data.parents || [])

                    router.push({ name: 'childHome' })
                } else {
                    alert(response.msg)
                }
            }
        } catch (error) {
            console.error("登录出错", error);
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

        // 如果是子女登录，也要重置子女信息
        const childUserStore = useChildUserStore()
        childUserStore.fullReset()
    }

    return { token, user, login, logout }
})