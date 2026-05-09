<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
   <div class="background">
      <RouterView></RouterView>
   </div>
</template>

<style scoped>
.background {
   width: 100%;
   min-height: 100vh;
}
</style>
