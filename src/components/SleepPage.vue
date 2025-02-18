<template>
    <div class="background">
      <div class="chart">
          <SleepDataClear></SleepDataClear>
      </div>   
    </div>
  </template>
  
  <script setup>
import SleepDataClear from './SleepDataClear.vue';
  </script>
  
  <style scoped>
      .background {
      width: 100%;
      height: 100%;
      background-color: rgb(255, 255, 255);
      display: flex;
      justify-content: center;  
      align-items: center;    
      }
      .chart {
          width: 100%;
          height: 100%;
      }
  </style>