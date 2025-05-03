<script setup>
import Calendar from './Calendar.vue';
import Memo from './Memo.vue';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import { ref, onBeforeUnmount } from 'vue';



const userInfoStore = storeToRefs(useUserInfoStore())


</script>

<template>
    <div class="content">
        <div class="message">
            <div class="title">
                <div></div>
                <span>信息</span>
            </div>
            <div class="user">
                <div class="userImg"></div>
                <span class="userName">{{ userInfoStore.Username }}</span>
                <div class="userMes">
                    <div class="age">
                        <span>年龄</span>
                        <span>{{ userInfoStore.Age }}岁</span>

                    </div>
                    <div class="height">
                        <span>身高</span>
                        <span>{{ userInfoStore.Height }}米</span>

                    </div>
                    <div class="weight">
                        <span>体重</span>
                        <span>{{ userInfoStore.Weight }}公斤</span>

                    </div>
                </div>
            </div>
        </div>
        <div class="calendarBox">
            <div class="title">
                <div></div>
                <span>日历</span>
            </div>
            <div class="calendar">
                <Calendar></Calendar>
            </div>
        </div>
        <div class="memoBox">
            <div class="title">
                <div></div>
                <span>待办</span>
            </div>
            <div class="memo">
                <Memo></Memo>
            </div>
        </div>
    </div>
</template>

<style scoped>
.content {
    height: 100%;
    width: 27%;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.message {
    width: 85%;
    height: 28%;
    margin-top: 0.11rem;
}

.title {
    height: 0.20rem;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.title div {
    height: 100%;
    width: 0.06rem;
    background-color: #4B686F;
    border-radius: 0.02rem;
}

.title span {
    font-size: 0.12rem;
    font-family: 'SiYuanHeiTi';
    color: rgba(75, 104, 111, 1);
    margin-left: 0.03rem;
}

.user {
    width: 100%;
    padding-left: 8%;
    padding-right: 8%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.userImg {
    height: 0.5rem;
    width: 0.5rem;
    border-radius: 50%;
    background-color: cadetblue;
}

.userMes {
    height: 0.45rem;
    width: 1.8rem;
    background-color: rgba(239, 239, 239, 1);
    margin-top: 0.08rem;
    border-radius: 0.06rem;
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.userName {
    font-size: 0.13rem;
    color: rgba(96, 125, 139, 1);
    font-family: 'SiYuanHeiTi';
}

.userMes div {
    height: 100%;
    width: 33%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
}

.userMes span {
    font-family: 'SiYuanHeiTi';
    font-size: 0.1rem;
    color: rgba(75, 104, 111, 1);
}

.calendarBox {
    width: 100%;
    height: 43%;
    background-color: aquamarine;
    padding-left: 8%;
    padding-right: 8%;
    box-sizing: border-box;
    margin-top: 0.11rem;
}

.memoBox {
    width: 100%;
    height: 28%;
    padding-left: 8%;
    padding-right: 8%;
    box-sizing: border-box;
    margin-top: 0.11rem;
}

.memo {
    width: 100%;
    height: 1.7rem;
    margin-top: 0.08rem;
}

.calendar {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>