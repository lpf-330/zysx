<script setup>
import Calendar from './Calendar.vue';
import Memo from './Memo.vue';
import TodoManagment from './TodoManagment.vue';
import { ref } from 'vue';

const selectedDate = ref(null);

const handleDateSelected = (date) => {
    selectedDate.value = date;
};

const showTodoManagement = ref(false);

const openTodoManagement = () => {
  showTodoManagement.value = true;
};

const closeTodoManagement = () => {
  showTodoManagement.value = false;
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
                <div class="userImg"></div>
                <span class="userName">用户</span>
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

    <Teleport to="body">
        <div v-if="showTodoManagement" class="todo-modal-overlay" @click="closeTodoManagement">
            <div class="todo-modal-content" @click.stop>
                <TodoManagment @close="closeTodoManagement" />
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
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
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

.userName {
    font-size: 0.13rem;
    color: rgba(96, 125, 139, 1);
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
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
    cursor: pointer;
}

.memoBox:hover {
    opacity: 0.8;
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