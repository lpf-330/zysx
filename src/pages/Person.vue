<script setup>
import Userdetails from '../components/Userdetails.vue';
import Userpagecenter from '../components/Userpagecenter.vue';
import Usertabspage from '../components/Usertabspage.vue';
import UserMAD from '../components/UserMAD.vue';
import HealthTips from '../components/HealthTips.vue';
import { ref } from 'vue';

const userpagecenterRef = ref(null);

const openEditDrawer = () => {
    userpagecenterRef.value?.openDrawer();
};
</script>

<template>
    <div class="person">
        <div class="top-row">
            <Userdetails :openEditDrawer="openEditDrawer" class="user-details-flex"></Userdetails>
            <div class="tips-column">
                <HealthTips></HealthTips>
            </div>
        </div>
        <div class="user-info">
            <div class="demo-tabs">
                <Usertabspage></Usertabspage>
            </div>
            <div class="MAD">
                <UserMAD></UserMAD>
            </div>
        </div>
        <Userpagecenter ref="userpagecenterRef"></Userpagecenter>
    </div>
</template>

<style scoped>
.person {
    height: 100%;
    width: 98%;
    display: flex;
    flex-direction: column;
    padding: 0.15rem 0;
    box-sizing: border-box;
}

.top-row {
    display: flex;
    gap: 0.2rem;
    width: 93%;
    margin: 0 auto 0.15rem auto;
    flex-shrink: 0;
}

.user-details-flex {
    flex: 1;
}

.tips-column {
    width: 2.3rem;
    height: 1.4rem;
    flex-shrink: 0;
}

.user-info {
    margin: 0 auto;
    flex: 1;
    min-height: 0;
    width: 93%;
    display: flex;
    gap: 0.2rem;
}

.demo-tabs {
    flex: 1;
    min-width: 0;
    min-height: 0;
    max-height: 100%;
    overflow: hidden;
}

.MAD {
    display: flex;
    justify-content: flex-end;
    width: 3rem;
    flex-shrink: 0;
    max-height: 100%;
    overflow: hidden;
}
</style>