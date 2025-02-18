<script setup>
import HealthMid from '../components/HealthMid.vue';
import HealthRight from '../components/HealthRight.vue';


</script>

<template>
    <div class="mid">
        <HealthMid></HealthMid>
    </div>
    <HealthRight></HealthRight>
</template>

<style scoped>
.mid {
    width: 60%;
    height: 100%;
}
</style>