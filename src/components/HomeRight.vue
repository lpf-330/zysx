<script setup>
import Calendar from './Calendar.vue';
import Memo from './Memo.vue';
</script>

<template>
    <div class="right-panel">
        <Calendar></Calendar>
        <Memo></Memo>
    </div>
</template>

<style scoped>
.right-panel {
    width: 26%;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}
</style>