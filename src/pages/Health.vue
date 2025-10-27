<script setup>
import TimeBox from '../components/TimeBox.vue'
import { RouterView } from 'vue-router';
import DataBox from '../components/DataBox.vue';
import { ref } from 'vue';
import HistoricalData from '../components/HistoricalData.vue';
import DayView from '../components/DayView.vue';

const shouldAnimate = ref(true);

const shiftControlBox = () => {
    const controlBox = document.querySelector('.controlBox')

    if (shouldAnimate.value) {
        controlBox.style.transitionDuration = '1.5s';
    } else {
        controlBox.style.transitionDuration = '1.5s';
        setTimeout(() => {
            controlBox.style.transitionDuration = '0s';
        }, 1500);
    }

    controlBox.classList.toggle('comeIn')
    controlBox.classList.toggle('comeOut')

    document.querySelector('.icon-lachu').classList.toggle('buttonAlt')

    shouldAnimate.value = !shouldAnimate.value;
}
</script>

<template>
    <div class="main-container">
        <div class="mid">
            <TimeBox></TimeBox>
            <div class="health">
                <RouterView></RouterView>
            </div>
            <div class="spring" @click="shiftControlBox">
                <div class="round roundTop"></div>
                <div class="springMid">
                    <span class="iconfont icon-lachu"></span>
                </div>
                <div class="round roundBottom"></div>
            </div>
        </div>

        <div class="controlBox comeOut">
            <DataBox :onClick="shiftControlBox"></DataBox>
        </div>
        <div class="right">
            <HistoricalData></HistoricalData>
        </div>
    </div>
</template>

<style scoped>
.main-container {
    width: 87%;
    height: 100%;
    display: flex;
}

.controlBox {
    width: 5.5rem;
    height: 3.2rem;
    background-color: #ffffff;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) translateY(100%);
    border-radius: 0.2rem 0.2rem 0.2rem 0.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0.04rem 0.04rem 0.05rem 0.005rem rgba(115, 115, 115, 0.211);
    z-index: 1;
    overflow: hidden;
    transition: transform 1.5s ease;
}

.comeIn {
    transform: translateX(-59%) translateY(-8%);
}

.comeOut {
    transform: translateX(-59%) translateY(100%);
}

.buttonAlt {
    transform: rotateZ(180deg);
}

.mid {
    width: 73%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
}

.health {
    width: 100%;
    height: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
}

.right {
    height: 100%;
    width: 27%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.spring {
    height: 0.6rem;
    width: 0.35rem;
    position: absolute;
    margin-top: 0.01rem;
    left: 50%;
    transform: translateX(-50%) rotate(90deg);
    z-index: 3;
}

.round {
    height: 0.35rem;
    width: 0.3rem;
    border-radius: 50%;
    position: absolute;
    box-sizing: border-box;
    border-style: solid;
    border-color: rgba(112, 128, 144, 0.635);
    z-index: 3;
    cursor: pointer;
}

.roundTop {
    top: -0.175rem;
    background-color: #ffffff;
}

.roundBottom {
    top: 0.425rem;
    background-color: #ffffff;
}

.springMid {
    height: 0.6rem;
    width: 0.3rem;
    box-sizing: border-box;
    border-style: solid;
    border-color: rgba(112, 128, 144, 0.635);
    border-bottom: 0;
    border-top: 0;
    z-index: 4;
    background-color: #ffffff;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.iconfont {
    font-size: 0.15rem;
    color: rgb(172, 191, 212);
    transition-duration: 1.5s;
}
</style>