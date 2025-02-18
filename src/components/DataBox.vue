<template>  
     <div class="background">
        <div class="content">
            <div class="item">
                <div class="data">
                    <div class="dataNum">77&nbsp;&nbsp;&nbsp;bpm</div>
                    <div class="title">心率</div>
                </div>
                <div class="chart">
                    <HeartData></HeartData>
                </div>
            </div>
            <div class="item">
                <div class="data">
                    <div class="dataNum">77&nbsp;&nbsp;&nbsp;</div>
                    <div class="title">血糖</div>
                </div>
                <div class="chart">
                    <BloodData></BloodData>
                </div>
            </div>
            <div class="item">
                <div class="data">
                    <div class="dataNum">77&nbsp;&nbsp;&nbsp;pi</div>
                    <div class="title">灌注指数</div>
                </div>
                <div class="chart">
                    <PiData></PiData>
                </div>
            </div>
            <div class="item">
                <div class="data"><div class="dataNum">77&nbsp;&nbsp;&nbsp;%</div>
                <div class="title">血氧</div>
            </div>
                <div class="chart">
                    <OxygenData></OxygenData>
                </div>
            </div>
            <div class="item">
                <div class="data">
                    <div class="dataNum">7h7min&nbsp;&nbsp;&nbsp;</div>
                    <div class="title">睡眠</div>
                </div>
                <div class="chart">
                    <SleepData></SleepData>
                </div>
            </div>
            <div class="item">
                <div class="data">
                    <div class="dataNum">77&nbsp;&nbsp;&nbsp;mmhg</div>
                    <div class="title">血压</div>
                </div>
                <div class="chart">
                    <PressureData></PressureData>
                </div>
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
</script>  

<style scoped> 
   .background{  
    background-color:bisque;  
    height: 100%;  
    width: 100%;  
    display: flex;  
    justify-content: center;  
    align-items: center;  
    }  
    .content{  
        background-color: #fff;  
        width: 70%;  
        height: 55%;  
        border-radius: 0.3rem;  
        display: grid;  
        grid-template-columns:repeat(2, 1fr);  
        grid-template-rows: repeat(3, 1fr);  
    }  

    .item{  
        width: 100%;  
        height: 100%;  
        display: flex;  
        flex-direction: row;  
        border-radius: 0.2rem;   
        overflow: hidden;       
    }  

    .data{  
        height: 100%;  
        width: 40%;  
        display: flex;  
        flex-direction: column;  
        justify-content: center;  
        align-items: center;  
        font-size: 1.5rem;  
    }  

    .chart{  
        background-color: rgb(255, 255, 255);  
        height: 100%;  
        width: 60%;  
    }  

    .dataNum{  
        font-size: 0.1rem;  
    }  

    .title{  
        font-size: 0.1rem;  
    }  
</style>