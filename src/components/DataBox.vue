<template>
    <div class="Box">
        <div class="item">
            <div class="data">
                <div class="dataNum">{{heartData[heartData.length-1]}}&nbsp;bpm</div>
                <div class="title">心率</div>
            </div>
            <div class="chart">
                <HeartData :data="heartData"></HeartData>
            </div>
        </div>
        <div class="item">
            <div class="data">
                <div class="dataNum">{{bloodData[bloodData.length-1]}}&nbsp;&nbsp;&nbsp;</div>
                <div class="title">血糖</div>
            </div>
            <div class="chart">
                <BloodData :data="bloodData"></BloodData>
            </div>
        </div>
        <div class="item">
            <div class="data">
                <div class="dataNum">{{piData[piData.length-1]}}&nbsp;&nbsp;pi</div>
                <div class="title">灌注指数</div>
            </div>
            <div class="chart">
                <PiData :data="piData"></PiData>
            </div>
        </div>
        <div class="item">
            <div class="data">
                <div class="dataNum">{{oxygenData*100}}&nbsp;%</div>
                <div class="title">血氧</div>
            </div>
            <div class="chart">
                <OxygenData :data="oxygenData"></OxygenData>
            </div>
        </div>
        <div class="item">
            <div class="data">
                <div class="dataNum">{{Math.floor(sleepData[sleepData.length-1]/60)}}h{{sleepData[sleepData.length-1]%60}}min</div>
                <div class="title">睡眠</div>
            </div>
            <div class="chart">
                <SleepData :data="sleepData"></SleepData>
            </div>
        </div>
        <div class="item">
            <div class="data">
                <div class="dataNum">{{pressureData[pressureData.length-1]}}&nbsp;mmhg</div>
                <div class="title">血压</div>
            </div>
            <div class="chart">
                <PressureData :data="pressureData"></PressureData>
            </div>
        </div>
    </div>
</template>

<script setup>
import HeartData from './HeartData.vue';
import BloodData from './BloodData.vue';
import PiData from './PiData.vue';
import OxygenData from './OxygenData.vue';
import SleepData from './SleepData.vue';
import PressureData from './PressureData.vue';
import { ref } from 'vue';

//从数据库中获取用户最近的数据，在数组中越靠右的数据对应的时间越新
const heartData = ref([86, 87, 87, 90])
const bloodData = ref([20, 80, 100, 40, 34, 90, 60])
const piData = ref([62, 65, 59, 52, 78])
const oxygenData = ref(0.6)
const sleepData = ref([400, 580, 400, 404, 601, 508, 707, 600, 708, 503])
const pressureData = ref([20, 40, 60, 80])


</script>

<style scoped>
.Box {
    background-color: #fff;
    width: 90%;
    height: 80%;
    border-radius: 0.3rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
}

.item {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    border-radius: 0.2rem;
    overflow: hidden;
}

.data {
    height: 100%;
    width: 40%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
}

.chart {
    background-color: rgb(255, 255, 255);
    height: 100%;
    width: 60%;
}

.dataNum {
    font-size: 0.1rem;
}

.title {
    font-size: 0.1rem;
}
</style>