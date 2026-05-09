import { defineStore } from 'pinia'
import router from '../router'
import useUserInfoStore from './user'
import useMedicalHistoryStore from './medicalHistory'
import { userLogin, childLogin } from '../api/login'
import useChildUserStore from './childUser'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: null,
        loginType: localStorage.getItem('loginType') || null // 'user' 或 'child'
    }),
    getters: {
        isAuthenticated: (state) => !!state.token
    },
    actions: {
        // 登录方法 - 支持用户和监护人端登录
        async login(account, password, type = 'user') {
            try {
                console.log('login', account, password, type);
                this.loginType = type;
                localStorage.setItem('loginType', type);

                if (type === 'user') {
                    // 用户登录
                    const response = await userLogin(account, password)
                    console.log("用户登录响应", response);

                    if (response.code === 1) {
                        const userInfoStore = useUserInfoStore()

                        this.token = response.data.token
                        localStorage.setItem('token', response.data.token)

                        userInfoStore.user_id = response.data.id
                        userInfoStore.Username = response.data.username
                        userInfoStore.Age = response.data.birthDate
                        userInfoStore.Avatar = response.data.avatar
                        userInfoStore.Height = response.data.height
                        userInfoStore.Weight = response.data.weight
                        userInfoStore.gender = response.data.gender
                        userInfoStore.phone_number = response.data.phone

                        this.user = {
                            id: response.data.id,
                            username: response.data.username
                        }

                        router.push({ name: 'index' })
                    } else {
                        alert(response.msg)
                    }
                } else if (type === 'child') {
                    // 监护人端登录
                    const response = await childLogin(account, password)
                    console.log("子女登录响应", response);

                    if (response.code === 1) {
                        this.token = response.data.token
                        localStorage.setItem('token', response.data.token)

                        // 设置子女信息和父母信息
                        const childUserStore = useChildUserStore()
                        childUserStore.setChildAndParents(response.data.childInfo, response.data.parents || [])

                        this.user = {
                            id: response.data.childInfo.id,
                            username: response.data.childInfo.username
                        }

                        router.push({ name: 'childHome' })
                    } else {
                        alert(response.msg)
                    }
                }
            } catch (error) {
                console.error("登录出错", error);
                alert("加载失败，请稍后再试。");
            }
        },

        // 退出方法
        logout() {
            this.token = null
            this.user = null
            this.loginType = null
            localStorage.removeItem('token')
            localStorage.removeItem('loginType')

            useUserInfoStore().fullReset()
            useMedicalHistoryStore().fullReset()

            // 如果是子女登录，也要重置子女信息
            const childUserStore = useChildUserStore()
            childUserStore.fullReset()
        },

        // 检查并恢复登录状态
        checkAuthState() {
            const token = localStorage.getItem('token')
            const loginType = localStorage.getItem('loginType')

            if (token && !this.token) {
                this.token = token
            }
            if (loginType && !this.loginType) {
                this.loginType = loginType
            }

            return !!this.token
        }
    },
    persist: {
        key: 'auth',
        storage: localStorage,
        paths: ['token', 'user', 'loginType']
    }
})