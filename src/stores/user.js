import { defineStore } from "pinia";

export const useUserInfoStore = defineStore("userInfo", {
    state: () => ({
        user_id: null,
        username: '',
        avatar: '',
        age: null,
        height: null,
        weight: null,
        gender: '',
        phone_number: null,
        siderMode: 0
    }),
    actions: {
        fullReset() {
            this.$reset()
            localStorage.removeItem('userInfo')
        }
    },
    persist: true
})

export default useUserInfoStore