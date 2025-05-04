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

    },
    persist: true
})

export default useUserInfoStore