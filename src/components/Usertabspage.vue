<script lang="ts" setup>
import { ref } from 'vue';
import { onMounted } from 'vue';
import useUserInfoStore from '../stores/user';
import useMedicalHistoryStore from '../stores/medicalHistory';
import { storeToRefs } from 'pinia';
import { getUserTabPageData } from '../api/user'

const activeName = ref('first')

const userStore = useUserInfoStore();
const { user_id } = storeToRefs(userStore);
const medicalHistoryStore = storeToRefs(useMedicalHistoryStore())

const fetchUsertabpagedata = async () => {
    try {
        const response = await getUserTabPageData(user_id.value)
        medicalHistoryStore.allergy_history.value = response.allergy_history
        medicalHistoryStore.family_history.value = response.family_history
        medicalHistoryStore.past_medical_history.value = response.past_medical_history
        medicalHistoryStore.surgical_history.value = response.surgical_history
        medicalHistoryStore.medication_compliance.value = response.medical_compliance
    } catch (error) {
        console.error("出错", error);
    }
};

onMounted(() => {
    fetchUsertabpagedata();
});

const tabs = [
    { name: 'first', label: '家族遗传', key: 'family_history' },
    { name: 'second', label: '过敏史', key: 'allergy_history' },
    { name: 'third', label: '既往病史', key: 'past_medical_history' },
    { name: 'fourth', label: '手术史', key: 'surgical_history' },
];

const getTabIcon = (name: string) => {
    const icons: Record<string, string> = {
        first: '✦',
        second: '◇',
        third: '○',
        fourth: '□'
    };
    return icons[name] || '●';
};

const hasRecord = (key: string) => {
    const value = medicalHistoryStore[key as keyof typeof medicalHistoryStore].value;
    return value !== '' && value !== null;
};
</script>

<template>
    <div class="medical-card">
        <div class="card-header">
            <span class="header-icon">☰</span>
            <span class="header-title">医疗记录</span>
        </div>

        <div class="tabs-nav">
            <div
                v-for="tab in tabs"
                :key="tab.name"
                class="tab-item"
                :class="{ 'active': activeName === tab.name }"
                @click="activeName = tab.name"
            >
                <span class="tab-icon">{{ getTabIcon(tab.name) }}</span>
                <span class="tab-label">{{ tab.label }}</span>
            </div>
        </div>

        <div class="tab-content">
            <div v-show="activeName === 'first'" class="tab-panel">
                <div class="record-header">
                    <span class="record-title">家族遗传病史</span>
                    <span class="record-badge" :class="{ 'has': hasRecord('family_history') }">
                        {{ hasRecord('family_history') ? '有记录' : '无记录' }}
                    </span>
                </div>
                <div class="record-detail">
                    {{ medicalHistoryStore.family_history.value || '暂无详细记录' }}
                </div>
            </div>

            <div v-show="activeName === 'second'" class="tab-panel">
                <div class="record-header">
                    <span class="record-title">过敏史</span>
                    <span class="record-badge" :class="{ 'has': hasRecord('allergy_history') }">
                        {{ hasRecord('allergy_history') ? '有记录' : '无记录' }}
                    </span>
                </div>
                <div class="record-detail">
                    {{ medicalHistoryStore.allergy_history.value || '暂无详细记录' }}
                </div>
            </div>

            <div v-show="activeName === 'third'" class="tab-panel">
                <div class="record-header">
                    <span class="record-title">既往病史</span>
                    <span class="record-badge" :class="{ 'has': hasRecord('past_medical_history') }">
                        {{ hasRecord('past_medical_history') ? '有记录' : '无记录' }}
                    </span>
                </div>
                <div class="record-detail">
                    {{ medicalHistoryStore.past_medical_history.value || '暂无详细记录' }}
                </div>
            </div>

            <div v-show="activeName === 'fourth'" class="tab-panel">
                <div class="record-header">
                    <span class="record-title">手术史</span>
                    <span class="record-badge" :class="{ 'has': hasRecord('surgical_history') }">
                        {{ hasRecord('surgical_history') ? '有记录' : '无记录' }}
                    </span>
                </div>
                <div class="record-detail">
                    {{ medicalHistoryStore.surgical_history.value || '暂无详细记录' }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.medical-card {
    background: linear-gradient(135deg, #ffffff 0%, #fafcf8 100%);
    border-radius: 0.12rem;
    box-shadow: 0 2px 12px rgba(45, 87, 45, 0.06);
    border: 1px solid rgba(45, 87, 45, 0.06);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.08rem;
    padding: 0.12rem 0.15rem;
    border-bottom: 1px solid rgba(45, 87, 45, 0.06);
}

.header-icon {
    font-size: 0.14rem;
    color: #2D572D;
}

.header-title {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.13rem;
    font-weight: 600;
    color: #1a1a1a;
}

.tabs-nav {
    display: flex;
    padding: 0.08rem 0.12rem;
    gap: 0.06rem;
    background: rgba(45, 87, 45, 0.02);
}

.tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.04rem;
    padding: 0.08rem;
    cursor: pointer;
    border-radius: 0.06rem;
    transition: all 0.2s ease;
}

.tab-item:hover {
    background: rgba(45, 87, 45, 0.05);
}

.tab-item.active {
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.tab-icon {
    font-size: 0.12rem;
    color: #999;
}

.tab-item.active .tab-icon {
    color: #2D572D;
}

.tab-label {
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.1rem;
    color: #666;
}

.tab-item.active .tab-label {
    color: #2D572D;
    font-weight: 500;
}

.tab-content {
    flex: 1;
    padding: 0.12rem 0.15rem;
    overflow-y: auto;
}

.tab-panel {
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.record-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.1rem;
}

.record-title {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.12rem;
    font-weight: 500;
    color: #333;
}

.record-badge {
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.09rem;
    padding: 0.02rem 0.08rem;
    border-radius: 0.04rem;
    background: rgba(153, 153, 153, 0.1);
    color: #999;
}

.record-badge.has {
    background: rgba(129, 199, 132, 0.15);
    color: #388E3C;
}

.record-detail {
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.11rem;
    color: #666;
    line-height: 1.6;
    padding: 0.1rem;
    background: rgba(45, 87, 45, 0.02);
    border-radius: 0.06rem;
    border-left: 2px solid rgba(45, 87, 45, 0.1);
}
</style>