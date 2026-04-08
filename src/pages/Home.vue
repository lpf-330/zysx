<script setup>
import TimeBox from '../components/TimeBox.vue';
import HomeMid from '../components/HomeMid.vue';
import HomeRight from '../components/HomeRight.vue'


</script>

<template>
    <div class="home-container">
        <div class="left-section">
            <TimeBox></TimeBox>
            <HomeMid></HomeMid>
        </div>
        <HomeRight></HomeRight>
    </div>
</template>

<style scoped>
.home-container {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    padding: 0.3rem;
    box-sizing: border-box;
    gap: 0.3rem;
}

.left-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}
</style>