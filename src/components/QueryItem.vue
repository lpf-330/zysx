<script setup>
import { defineProps } from 'vue';

const prop = defineProps({
    query: String
});
</script>

<template>
    <div class="contain">
        <div class="query-bubble">
            <div class="query-text">{{ prop.query }}</div>
            <div class="query-meta">我</div>
        </div>
    </div>
</template>

<style scoped>
.contain {
    width: 100%;
    margin-bottom: 8px;
    display: flex;
    justify-content: flex-end;
    box-sizing: border-box;
    padding: 2px 14px;
}

.query-bubble {
    max-width: 80%;
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    border-radius: 16px 4px 16px 16px;
    padding: 8px 12px 6px 12px;
    color: #eff6ff;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
    display: flex;
    flex-direction: column;
}

.query-text {
    font-size: 13px;
    line-height: 1.6;
    word-break: break-word;
}

.query-meta {
    margin-top: 4px;
    font-size: 11px;
    align-self: flex-end;
    opacity: 0.85;
}
</style>