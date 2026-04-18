import { defineStore } from "pinia";

const useMedicalHistoryStore = defineStore("medicalHistory", {
    state: () => ({
        family_history: '',
        allergy_history: '',
        past_medical_history: '',
        surgical_history: '',
        medication_compliance: ''
    }),
    actions: {
        fullReset() {
            this.$reset()
            localStorage.removeItem('medicalHistory')
        }
    },
    persist: true
})

export default useMedicalHistoryStore