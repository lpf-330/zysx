<script setup>
import { defineProps } from 'vue';

const prop = defineProps({
    query: String
})

</script>

<template>
    <div class="contain">
        <div class="query">{{ prop.query }}</div>
    </div>
</template>

<style scoped>
.contain {
    width: 100%;
    min-height: 0.3rem;
    margin-bottom: 0.06rem;
    display: flex;
    justify-content: flex-end;
    box-sizing: border-box;
    padding: 1%;
    padding-right: 3.4%;
}

.query {
    font-size: 0.09rem;
    font-family: 'OpenSans';
    background-color: #eff6ff;
    padding-left: 2%;
    padding-right: 2%;
    padding-top: 1.2%;
    padding-bottom: 1.2%;
    border-radius: 0.07rem;
    max-width: 90.4%;
    overflow-wrap: break-word;
    white-space: normal;
}
</style>