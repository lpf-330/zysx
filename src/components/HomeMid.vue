<script setup>
import DataBox from './DataBox.vue';
</script>

<template>
    <div class="content">
        <div class="DataBox">
            <DataBox></DataBox>
        </div>
    </div>
</template>

<style scoped>
.content {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.DataBox {
    width: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
}
</style>
