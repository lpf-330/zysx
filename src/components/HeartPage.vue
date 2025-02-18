<template>
  <div class="background">
    <HeartDataClear></HeartDataClear>
  </div>
</template>

<script setup>
import HeartDataClear from './HeartDataClear.vue';
</script>

<style scoped>
    .background {
    width: 100%;
    height: 100%;
    background-color: rgb(150, 203, 215);
    display: flex;
    justify-content: center;  
    align-items: center;    
    }
</style>