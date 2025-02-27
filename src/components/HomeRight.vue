<script setup>
import Calendar from './Calendar.vue';
import Memo from './Memo.vue';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import { onBeforeUnmount } from 'vue';



const user = storeToRefs(useUserInfoStore()).user.value.data
//const user = storeToRefs(useUserInfoStore()).user.value
// const username=user.username
// const password=user.password

const cancelTokenSource = axios.CancelToken.source();

let updateUser = async (user_id, username) => {
    try {


        const url = `http://localhost:8081/userInfo1?user_id=${encodeURIComponent(user_id)}&username=${encodeURIComponent(username)}`; // 通过查询字符串拼接 URL  

        // 发送 GET 请求  
        const response = await axios.post(url, {
            cancelToken: cancelTokenSource.token
        });



        console.log("响应", response.data);




    } catch (error) {
        console.error("出错", error);
        alert("加载失败，请稍后再试。"); // 友好的错误提示  

    }



}

// let updateUser = async () => {


//     try {


//         //const url = `http://localhost:8081/userInfo?username=${encodeURIComponent(username.value)}&password=${encodeURIComponent(password.value)}`; // 通过查询字符串拼接 URL  

//         // 发送 GET 请求  
//         const url = "http://localhost:8081/userInfo"
//         const response = await axios.post(url, {
//             //cancelToken: cancelTokenSource.token,
//             username: username.value,
//             password: password.value
//         },
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                 }
//             }
//         );

//         console.log("响应登录",response);
//         userInfoStore.user.value = response.data.data;
//         router.push({name: "index"})

//         // if (response.data.code === 1) {
//         //     userInfoStore.user.value = response.data.data;
//         //     console.log("响应", userInfoStore.user.value);
//         //     router.push({ name: 'index' })


//         // } else {
//         //     alert(user.value.msg)
//         // }



//     } catch (error) {
//         console.error("出错", error);
//         alert("加载失败，请稍后再试。"); // 友好的错误提示  

//     }



// }


const updateUserName = () => {
    const user_id = user.user_id
    const username = document.querySelector('#userName').value

    updateUser(user_id, username)
    user.username = username
}


// //计算年龄
// const today = new Date();
// const birthdate = new Date(user.birthdate);
// let age = today.getFullYear() - birthdate.getFullYear();


onBeforeUnmount(() => {
    cancelTokenSource.cancel('Component unmounted, request canceled');
})

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
                <span class="userName">{{ user.username }}</span>
                <div class="userMes">
                    <div class="age">
                        <span>年龄</span>
                        <span>{{ age }}岁</span>

                    </div>
                    <div class="height">
                        <span>身高</span>
                        <span>{{ user.height }}米</span>

                    </div>
                    <div class="weight">
                        <span>体重</span>
                        <span>{{ user.weight }}公斤</span>

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
    height: 25%;
    margin-top: 0.15rem;
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
    padding-left: 8%;
    padding-right: 8%;
    box-sizing: border-box;
    margin-top: 0.16rem;
}

.memoBox {
    width: 100%;
    padding-left: 8%;
    padding-right: 8%;
    box-sizing: border-box;
    margin-top: 0.2rem;
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