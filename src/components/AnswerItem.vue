<script setup>
import { defineProps } from 'vue';

const prop = defineProps({
    answer: String
})
</script>

<template>
    <div class="contain">
        <div class="avater">
            <svg class="icon iconImg" aria-hidden="true">
                <use xlink:href="#icon-huida1"></use>
            </svg>
        </div>
        <div class="answer">
            {{ prop.answer }}
        </div>
    </div>
</template>

<style scoped>
.contain {
    width: 100%;
    min-height: 0.3rem;
    margin-bottom: 0.06rem;
    display: flex;
    justify-content: flex-start;
    box-sizing: border-box;
    padding: 1%;
}

.answer {
    font-size: 0.09rem;
    font-family: 'OpenSans';
    background-color: #eff6ff;
    padding-left: 2%;
    padding-right: 2%;
    padding-top: 1.2%;
    padding-bottom: 1.2%;
    border-radius: 0.07rem;
    max-width: 88%;
    overflow-wrap: break-word;
    white-space: normal;
}

.avater {
    height: 0.2rem;
    width: 0.2rem;
    margin-right: 0.07rem;
}

.icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
}

.iconImg {
    font-size: 0.2rem;
}
</style>