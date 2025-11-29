<script setup>
import Calendar from './Calendar.vue';
import Memo from './Memo.vue';
import TodoManagement from './TodoManagment.vue'; // 导入待办管理组件
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import { ref, onBeforeUnmount } from 'vue';

// 计算年龄的函数
const calculateAge = (birthDateString) => {
  if (!birthDateString) return '';
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // 如果还没过生日，则年龄减一岁
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  // 确保年龄不为负数
  return Math.max(0, age);
};

const userInfoStore = storeToRefs(useUserInfoStore())

// 控制待办管理窗口的显示
const showTodoManagement = ref(false);

// 打开待办管理窗口
const openTodoManagement = () => {
  showTodoManagement.value = true;
};

// 关闭待办管理窗口
const closeTodoManagement = () => {
  showTodoManagement.value = false;
};

const selectedDate = ref(null);

const handleDateSelected = (date) => {
    selectedDate.value = date;
    console.log('选中的日期:', date);
};
</script>

<template>
    <div class="content">
        <div class="message">
            <div class="title">
                <div></div>
                <span>信息</span>
            </div>
            <div class="user">
                <div class="userImg"
                    :style="{ backgroundImage: `url(${(userInfoStore.Avatar.value === '' || userInfoStore.Avatar.value === null) ? 'src/assets/img/userAvater.jpg' : userInfoStore.Avatar.value})` }">
                </div>
                <span class="userName">{{ userInfoStore.Username }}</span>
                <div class="userMes">
                    <div class="age">
                        <span>年龄</span>
                        <span>{{ calculateAge(userInfoStore.Age.value) }}岁</span>
                    </div>
                    <div class="height">
                        <span>身高</span>
                        <span>{{ userInfoStore.Height }}厘米</span>
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
                <Calendar @date-selected="handleDateSelected" />
            </div>
        </div>
        <div class="memoBox" @click="openTodoManagement">
            <div class="title">
                <div></div>
                <span>待办</span>
            </div>
            <div class="memo">
                <Memo :selected-date="selectedDate" />
            </div>
        </div>
    </div>

    <!-- 待办管理窗口 -->
    <Teleport to="body">
        <div v-if="showTodoManagement" class="todo-modal-overlay" @click="closeTodoManagement">
            <div class="todo-modal-content" @click.stop>
                <TodoManagement @close="closeTodoManagement" />
            </div>
        </div>
    </Teleport>
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
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
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
    cursor: pointer; /* 添加手型光标 */
}

.memoBox:hover {
    opacity: 0.8; /* 添加悬停效果 */
}

.memo {
    width: 100%;
    height: 1.7rem;
    margin-top: 0.05rem;
}

.calendar {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 待办管理窗口样式 */
.todo-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.todo-modal-content {
    width: 90%;
    max-width: 8rem;
    height: 90vh;
    background: white;
    border-radius: 0.1rem;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
</style>