<script setup>
import Sider from '../components/Sider.vue';
import { RouterView, useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
    <div class="background">
        <Sider></Sider>
        <div class="content">
            <RouterView />
        </div>
    </div>
</template>

<style scoped>
.background {
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%);
    height: 100vh;
    width: 100vw;
}

.content {
    flex: 1;
    display: flex;
    flex-direction: row;
    overflow: hidden;
}
</style>
