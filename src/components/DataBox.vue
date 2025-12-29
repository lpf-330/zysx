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
import { 
    getBloodData, 
    getHeartData, 
    getOxygenData, 
    getPiData, 
    getPreData, 
    getSlpData,
    // 实时订阅函数
    subscribeHeartData,
    subscribeBloodData,
    subscribeOxygenData,
    subscribePiData,
    subscribePreData,
    subscribeSlpData,
    unsubscribeUserAllRealTimeData
} from '../api/healthData';


const heartData = ref([])
const bloodData = ref([])
const piData = ref([])
const oxygenData = ref(0)
const sleepData = ref([])
const pressureData = ref([])

const userInfoStore = storeToRefs(useUserInfoStore())
const user_id = userInfoStore.user_id.value


// 初始数据获取
const fetchData = async () => {
  try {
    // 使用 Promise.allSettled 同时开始所有请求
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

      heartData.value = latestHeartProcessed.map(item => Number(item.heartData));
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

      piData.value = latestPiProcessed.map(item => Number(item.piData));
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

      sleepData.value = latestSleepProcessed.map(item => Number(item.sleepData));
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

      bloodData.value = latestBloodProcessed.map(item => Number(item.bloodData));
    } else {
      console.error("获取血糖数据失败:", bloodResponse.reason);
    }

    // 处理血压数据
    if (pressureResponse.status === 'fulfilled') {
      const response = pressureResponse.value;
      console.log('血压数据展示', response);
      if (response && response.length > 0) {
        const latestBP = response[0];
        pressureData.value = [
          Number(latestBP.systolicBp),
          Number(latestBP.diastolicBp)
        ];
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

// 实时数据订阅
const startRealTimeSubscriptions = () => {
  // 清理旧的订阅
  unsubscribeUserAllRealTimeData(user_id);
  
  // 订阅心率数据
  subscribeHeartData(user_id, (data) => {
    console.log('收到实时心率数据:', data);
    if (Array.isArray(data) && data.length > 0) {
      // 保持最新4条数据
      const heartCount = Math.min(4, data.length);
      const latestHeartUnprocessed = data.slice(0, heartCount);
      const latestHeartProcessed = latestHeartUnprocessed.reverse();
      
      // 更新心率数据
      heartData.value = latestHeartProcessed.map(item => Number(item.heartData));
    }
  });
  
  // 订阅血糖数据
  subscribeBloodData(user_id, (data) => {
    console.log('收到实时血糖数据:', data);
    if (Array.isArray(data) && data.length > 0) {
      const bloodCount = Math.min(7, data.length);
      const latestBloodUnprocessed = data.slice(0, bloodCount);
      const latestBloodProcessed = latestBloodUnprocessed.reverse();
      
      bloodData.value = latestBloodProcessed.map(item => Number(item.bloodData));
    }
  });
  
  // 订阅灌注指数数据
  subscribePiData(user_id, (data) => {
    console.log('收到实时PI数据:', data);
    if (Array.isArray(data) && data.length > 0) {
      const piCount = Math.min(4, data.length);
      const latestPiUnprocessed = data.slice(0, piCount);
      const latestPiProcessed = latestPiUnprocessed.reverse();
      
      piData.value = latestPiProcessed.map(item => Number(item.piData));
    }
  });
  
  // 订阅血氧数据
  subscribeOxygenData(user_id, (data) => {
    console.log('收到实时血氧数据:', data);
    if (Array.isArray(data) && data.length > 0) {
      const latestOxygen = data[0];
      oxygenData.value = Number(latestOxygen.oxygenData) * 0.01;
    }
  });
  
  // 订阅睡眠数据
  subscribeSlpData(user_id, (data) => {
    console.log('收到实时睡眠数据:', data);
    if (Array.isArray(data) && data.length > 0) {
      const sleepCount = Math.min(4, data.length);
      const latestSleepUnprocessed = data.slice(0, sleepCount);
      const latestSleepProcessed = latestSleepUnprocessed.reverse();
      
      sleepData.value = latestSleepProcessed.map(item => Number(item.sleepData));
    }
  });
  
  // 订阅血压数据
  subscribePreData(user_id, (data) => {
    console.log('收到实时血压数据:', data);
    if (Array.isArray(data) && data.length > 0) {
      const latestBP = data[0];
      pressureData.value = [
        Number(latestBP.systolicBp),
        Number(latestBP.diastolicBp)
      ];
    }
  });
};

onBeforeMount(() => {
  // 初始获取一次数据
  fetchData();
  // 开始实时订阅
  startRealTimeSubscriptions();
});

// 组件卸载时清理
onBeforeUnmount(() => {
  unsubscribeUserAllRealTimeData(user_id);
});

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