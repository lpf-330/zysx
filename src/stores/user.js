import { defineStore } from "pinia";

const useUserInfoStore = defineStore("userInfo", {
    state: () => ({
        user_id: null,
        Username: '',
        Password: '',
        Avatar: '',
        Age: null,
        Height: null,
        Weight: null
    }),
    actions: {

    }
})

export default useUserInfoStore