<script setup>
import TimeBox from '../components/TimeBox.vue';
import HomeMid from '../components/HomeMid.vue';
import HomeRight from '../components/HomeRight.vue'



</script>

<template>
    <div class="mid">
        <TimeBox></TimeBox>
        <HomeMid></HomeMid>
    </div>
    <HomeRight></HomeRight>
</template>

<style scoped>
.mid {
    width: 60%;
    height: 100%;
}
</style>