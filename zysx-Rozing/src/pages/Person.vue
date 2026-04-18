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
}

.top-row {
    display: flex;
    gap: 0.2rem;
    margin-bottom: 0.15rem;
    width: 93%;
    margin: auto;
    margin-top: 2%;
}

.user-details-flex {
    flex: 1;
}

.tips-column {
    width: 2.3rem;
    height: 1.4rem;
    flex-shrink: 0;
    margin-top: 2%;
}

.user-info {
    margin: auto;
    margin-top: 2%;
    height: 3.4rem;
    width: 93%;
    display: flex;
}

.demo-tabs {
    width: 93%;
    height: 94%;
}

.MAD {
    display: flex;
    justify-content: flex-end;
    width: 3rem;
    height: 3.55rem;
}
</style>