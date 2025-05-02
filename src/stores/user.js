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
        phone_number: null
    }),
    actions: {

    },
    persist: true
})

export default useUserInfoStore