<script setup>
import DataBox from './DataBox.vue';
</script>

<template>
    <div class="content">
        <DataBox></DataBox>
    </div>
</template>

<style scoped>
.content {
    flex: 1;
    display: flex;
    background: rgba(255,255,255,0.85);
    border-radius: 0.1rem;
    padding: 0.15rem;
    box-shadow: 0 2px 12px rgba(45, 87, 45, 0.05);
    border: 1px solid rgba(45, 87, 45, 0.08);
}
</style>