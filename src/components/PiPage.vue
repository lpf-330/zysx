<template>
    <div class="background">
      <div class="chart">
          <PiDataClear></PiDataClear>
      </div>   
    </div>
  </template>
  
  <script setup>
  import PiDataClear from './PiDataClear.vue';
  </script>
  
  <style scoped>
      .background {
      width: 100%;
      height: 80%;
      background-color: rgb(255, 255, 255);
      display: flex;
      justify-content: center;  
      align-items: center;    
      }
      .chart {
          width: 100%;
          height: 40%;
      }
  </style>