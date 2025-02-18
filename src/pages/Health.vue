<script setup>
// import PressureDataClear from '../components/PressureDataClear.vue';
// import SleepDataClear from '../components/SleepDataClear.vue';
// import OxygenDataClear from '../components/OxygenDataClear.vue';
// import PiDataClear from '../components/PiDataClear.vue';
// import BloodDataClear from '../components/BloodDataClear.vue';
import HeartDataClear from '../components/HeartDataClear.vue';
</script>

<template>
     <div class="health">
        <HeartDataClear></HeartDataClear>
    </div>
</template>

<style scoped>
.health {
    width: 70%;
    height: 90%;
}
</style>