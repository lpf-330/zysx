import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '../router'
import useUserInfoStore from './user'
import { storeToRefs } from 'pinia'
import useMedicalHistoryStore from './medicalHistory'
import { userLogin, childLogin } from '../api/login'
import useChildUserStore from './childUser'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(null)
    const user = ref(null)

    const login = async (account, password, loginType = 'user') => {
        try {
            if (loginType === 'user') {
                const response = await userLogin(account, password)

                if (response.code === 1) {
                    const userInfoStore = storeToRefs(useUserInfoStore())

                    token.value = response.data.token

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
                const response = await childLogin(account, password)

                if (response.code === 1) {
                    token.value = response.data.token

                    const childUserStore = useChildUserStore()
                    childUserStore.setChildAndParents(response.data.childInfo, response.data.parents || [])

                    router.push({ name: 'childHome' })
                } else {
                    alert(response.msg)
                }
            }
        } catch (error) {
            console.error("登录出错", error);
            alert("加载失败，请稍后再试。");
        }
    }

    const logout = () => {
        token.value = null
        user.value = null

        useUserInfoStore().fullReset()
        useMedicalHistoryStore().fullReset()

        const childUserStore = useChildUserStore()
        childUserStore.fullReset()
    }

    return { token, user, login, logout }
}, {
    persist: true
})
