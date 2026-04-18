import { defineStore } from "pinia";

const useUserInfoStore = defineStore("userInfo", {
    state: () => ({
        user_id: null,
        Username: '',
        Avatar: '',
        Age: null,
        Height: null,
        Weight: null,
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