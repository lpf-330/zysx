<template>
    <div class="Box">
        <div class="item" @click="toggleRouter('heartData')">
            <div class="data">
                <div class="dataNum">{{ heartData[heartData.length - 1] }}&nbsp;bpm</div>
                <div class="title">心率</div>
            </div>
            <div class="chart">
                <HeartData :data="heartData"></HeartData>
            </div>
        </div>
        <div class="item" @click="toggleRouter('bloodData')">
            <div class="data">
                <div class="dataNum">{{ bloodData[bloodData.length - 1] }}&nbsp;&nbsp;&nbsp;</div>
                <div class="title">血糖</div>
            </div>
            <div class="chart">
                <BloodData :data="bloodData"></BloodData>
            </div>
        </div>
        <div class="item" @click="toggleRouter('piData')">
            <div class="data">
                <div class="dataNum">{{ piData[piData.length - 1] }}&nbsp;&nbsp;pi</div>
                <div class="title">灌注指数</div>
            </div>
            <div class="chart">
                <PiData :data="piData"></PiData>
            </div>
        </div>
        <div class="item" @click="toggleRouter('oxygenData')">
            <div class="data">
                <div class="dataNum">{{ oxygenData * 100 }}&nbsp;%</div>
                <div class="title">血氧</div>
            </div>
            <div class="chart">
                <OxygenData :data="oxygenData"></OxygenData>
            </div>
        </div>
        <div class="item" @click="toggleRouter('sleepData')">
            <div class="data">
                <div class="dataNum">
                    {{ Math.floor(sleepData[sleepData.length - 1] / 60) }}h{{ sleepData[sleepData.length - 1] % 60 }}min
                </div>
                <div class="title">睡眠</div>
            </div>
            <div class="chart">
                <SleepData :data="sleepData"></SleepData>
            </div>
        </div>
        <div class="item" @click="toggleRouter('pressureData')">
            <div class="data">
                <!-- <div class="dataNum">{{ pressureData[pressureData.length - 1] }}&nbsp;mmhg</div> -->
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
import { ref, onBeforeUnmount, onBeforeMount } from 'vue';
import { defineProps } from 'vue';
import router from '../router';
import axios from 'axios';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';



const heartData = ref([])
const bloodData = ref([])
const piData = ref([])
const oxygenData = ref(0)
const sleepData = ref([])
const pressureData = ref([])

const userInfoStore = storeToRefs(useUserInfoStore())
let user_id = userInfoStore.user_id.value


const fetchData = async () => {

    try {

        const url = `/api/data`;
        const response = await axios.post(url, {
            user_id: user_id
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log("响应data", response.data);

        for (let j = 0; j < 4; j++) {
            heartData.value.push(Number(response.data.heartData[j].heartData))
            piData.value.push(Number(response.data.piData[j].piData))
            sleepData.value.push(Number(response.data.sleepData[j].sleepData))
        }

        for (let j = 0; j < 7; j++) {
            bloodData.value.push(Number(response.data.bloodData[j].bloodData))
        }

        oxygenData.value = Number(response.data.oxygenData[response.data.oxygenData.length - 1].oxygenData) * 0.01
        pressureData.value.push(Number(response.data.pressureData[response.data.pressureData.length - 1].systolicBP))
        pressureData.value.push(Number(response.data.pressureData[response.data.pressureData.length - 1].diastolicBP))


        // console.log('heartData.value', heartData.value);



    } catch (error) {
        console.error("出错", error);
        alert("加载失败，请稍后再试。");
    }


}

onBeforeMount(fetchData)



// const props = defineProps({
//     onClick: Function
// })

const toggleRouter = (str) => {
    // props.onClick()
    userInfoStore.siderMode.value = 1
    router.push({ name: str })
}

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
    /* background-color: aquamarine; */
    box-sizing: border-box;
}

.item:hover {
    border: 0.02rem solid rgb(148, 199, 255);
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
    color: rgba(0, 122, 255, 1);
}
</style>