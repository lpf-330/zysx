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
import { getBloodData, getHeartData, getOxygenData, getPiData, getPreData, getSlpData } from '../api/healthData';


const heartData = ref([])
const bloodData = ref([])
const piData = ref([])
const oxygenData = ref(0)
const sleepData = ref([])
const pressureData = ref([])

const userInfoStore = storeToRefs(useUserInfoStore())
const user_id = userInfoStore.user_id.value


const fetchData = async () => {
  try {
    // --- 并行发起所有 WebSocket 数据请求 ---
    // 使用 Promise.allSettled 同时开始所有请求，即使某个失败也能继续处理其他请求
    const [
      heartResponse,
      piResponse,
      sleepResponse, 
      bloodResponse,
      pressureResponse, 
      oxygenResponse 
    ] = await Promise.allSettled([
      getHeartData(user_id),
      getPiData(user_id),
      getSlpData(user_id),
      getBloodData(user_id),
      getPreData(user_id),
      getOxygenData(user_id)
    ]);


    // 处理心率数据
    if (heartResponse.status === 'fulfilled') {
      const response = heartResponse.value;
      console.log('心率数据展示', response);
      const heartArray = response || [];
      const heartCount = Math.min(4, heartArray.length);
      const latestHeartUnprocessed = heartArray.slice(0, heartCount);
      const latestHeartProcessed = latestHeartUnprocessed.reverse();

      for (const item of latestHeartProcessed) { 
        heartData.value.push(Number(item.heartData));
      }
    } else {
      console.error("获取心率数据失败:", heartResponse.reason);
    }

    // 处理血流灌注指数 (PI) 数据
    if (piResponse.status === 'fulfilled') {
      const response = piResponse.value;
      console.log('PI数据展示', response);
      const piCount = Math.min(4, response?.length || 0);
      const latestPiUnprocessed = (response || []).slice(0, piCount);
      const latestPiProcessed = latestPiUnprocessed.reverse();

      for (let j = 0; j < latestPiProcessed.length; j++) { 
        piData.value.push(Number(latestPiProcessed[j].piData));
      }
    } else {
      console.error("获取PI数据失败:", piResponse.reason);
    }

    // 处理睡眠数据
    if (sleepResponse.status === 'fulfilled') {
      const response = sleepResponse.value;
      console.log('睡眠数据展示', response);
      const sleepCount = Math.min(4, response?.length || 0);
      const latestSleepUnprocessed = (response || []).slice(0, sleepCount);
      const latestSleepProcessed = latestSleepUnprocessed.reverse(); 

      for (let j = 0; j < latestSleepProcessed.length; j++) { 
        sleepData.value.push(Number(latestSleepProcessed[j].sleepData));
      }
    } else {
      console.error("获取睡眠数据失败:", sleepResponse.reason);
    }

    // 处理血糖数据
    if (bloodResponse.status === 'fulfilled') {
      const response = bloodResponse.value;
      console.log('血糖数据展示', response);
      const bloodCount = Math.min(7, response?.length || 0);
      const latestBloodUnprocessed = (response || []).slice(0, bloodCount);
      const latestBloodProcessed = latestBloodUnprocessed.reverse();

      for (let j = 0; j < latestBloodProcessed.length; j++) { 
        bloodData.value.push(Number(latestBloodProcessed[j].bloodData));
      }
    } else {
      console.error("获取血糖数据失败:", bloodResponse.reason);
    }

    // 处理血压数据
    if (pressureResponse.status === 'fulfilled') {
      const response = pressureResponse.value;
      console.log('血压数据展示', response);
      if (response && response.length > 0) {
        const latestBP = response[0];
        pressureData.value.push(Number(latestBP.systolicBp));
        pressureData.value.push(Number(latestBP.diastolicBp));
      }
    } else {
      console.error("获取血压数据失败:", pressureResponse.reason);
    }

    // 处理血氧数据
    if (oxygenResponse.status === 'fulfilled') {
      const response = oxygenResponse.value;
      console.log('血氧数据展示', response);
      if (response && response.length > 0) {
        const latestOxygen = response[0];
        oxygenData.value = Number(latestOxygen.oxygenData) * 0.01;
      } else {
         oxygenData.value = 0;
      }
    } else {
      console.error("获取血氧数据失败:", oxygenResponse.reason);
       oxygenData.value = 0; 
    }

    console.log('所有数据获取完成');
    console.log('heartData.value (fetchData后):', heartData.value);
    console.log('piData.value (fetchData后):', piData.value);
    console.log('sleepData.value (fetchData后):', sleepData.value);
    console.log('bloodData.value (fetchData后):', bloodData.value);
    console.log('pressureData.value (fetchData后):', pressureData.value);
    console.log('oxygenData.value (fetchData后):', oxygenData.value);

  } catch (error) {
    console.error("获取数据过程中发生未知错误", error);
    alert("加载失败，请稍后再试。");
  }
};

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