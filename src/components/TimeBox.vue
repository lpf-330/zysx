<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';



const timeStr = ref('');
const userName = ref('用户')

let timer = null;




function formatTime(date) {
    return date.toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    }).replace(':', ' 时 ') + ' 分';
}


function updateDateTime() {
    const now = new Date();

    timeStr.value = formatTime(now);
}

onMounted(() => {
    updateDateTime();
    const secondsToNextMinute = 60 - new Date().getSeconds();
    timer = setTimeout(() => {
        updateDateTime();
        timer = setInterval(updateDateTime, 60000);
    }, secondsToNextMinute * 1000);
});

onBeforeUnmount(() => {
    clearTimeout(timer);
});
</script>

<template>
    <div class="box">
        <span class="time">{{ timeStr }}</span>
        <span class="date">{{ userName }}，你好！</span>
    </div>
</template>

<style scoped>
.box {
    width: 25%;
    height: 10%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    padding-left: 2.5%;
}

.time {
    font-family: 'PuHuiTi';
    color: #85A3AA;
    font-size: 0.125rem;
}

.date {
    font-family: 'PuHuiTi';
    margin-top: 0.01rem;
    font-size: 0.16rem;
}
</style>