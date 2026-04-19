import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockParents, mockAlerts, mockHealthData } from '../utils/mockData'

export const useAppStore = defineStore('app', () => {
    const parents = ref(mockParents)
    const alerts = ref(mockAlerts)
    const healthData = ref(mockHealthData)
    const selectedParentId = ref(null)
    const isLoading = ref(false)

    const currentRoute = ref('')
    const prevRoute = ref('')
    const navigationHistory = ref([])

    const selectedParent = computed(() => {
        return parents.value.find(parent => parent.id === selectedParentId.value)
    })

    const unreadAlerts = computed(() => {
        return alerts.value.filter(alert => !alert.read)
    })

    const criticalAlerts = computed(() => {
        return alerts.value.filter(alert => alert.severity === 'critical')
    })

    const selectParent = (parentId) => {
        selectedParentId.value = parentId
    }

    const addParent = (parentData) => {
        const newParent = {
            id: Date.now(),
            ...parentData,
            createdAt: new Date().toISOString()
        }
        parents.value.push(newParent)
        return newParent
    }

    const updateParent = (parentId, updates) => {
        const index = parents.value.findIndex(p => p.id === parentId)
        if (index !== -1) {
            parents.value[index] = { ...parents.value[index], ...updates }
        }
    }

    const markAlertAsRead = (alertId) => {
        const alert = alerts.value.find(a => a.id === alertId)
        if (alert) {
            alert.read = true
        }
    }

    const addAlert = (alertData) => {
        const newAlert = {
            id: Date.now(),
            ...alertData,
            timestamp: new Date().toISOString(),
            read: false
        }
        alerts.value.unshift(newAlert)
    }

    const deleteParent = (parentId) => {
        const index = parents.value.findIndex(p => p.id === parentId)
        if (index !== -1) {
            parents.value.splice(index, 1)
            if (selectedParentId.value === parentId) {
                selectedParentId.value = parents.value[0]?.id || null
            }
        }
    }

    const setCurrentRoute = (routeName) => {
        prevRoute.value = currentRoute.value
        currentRoute.value = routeName
        navigationHistory.value.push({
            route: routeName,
            timestamp: new Date().toISOString()
        })

        if (navigationHistory.value.length > 10) {
            navigationHistory.value.shift()
        }
    }

    const goBack = () => {
        if (navigationHistory.value.length > 1) {
            navigationHistory.value.pop()
            const prev = navigationHistory.value[navigationHistory.value.length - 1]
            return prev.route
        }
        return null
    }

    return {
        parents,
        alerts,
        healthData,
        selectedParentId,
        isLoading,
        currentRoute,
        prevRoute,
        navigationHistory,

        selectedParent,
        unreadAlerts,
        criticalAlerts,

        selectParent,
        addParent,
        updateParent,
        deleteParent,
        markAlertAsRead,
        addAlert,
        setCurrentRoute,
        goBack
    }
}, {
    persist: {
        pick: ['currentRoute', 'prevRoute', 'navigationHistory', 'selectedParentId']
    }
})
