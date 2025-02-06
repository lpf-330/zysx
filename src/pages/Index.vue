<script setup>
import Sider from '../components/Sider.vue';
import { RouterView } from 'vue-router';


</script>

<template>
    <div class="background">
        <Sider></Sider>
        <RouterView></RouterView>
    </div>
</template>

<style scoped>
.background {
    display: flex;
    flex-direction: row;
    background-color: rgba(231, 248, 252, 0.579);
}
</style>