<script setup>
import { ref } from 'vue';
import axios from 'axios';
import QueryItem from '../components/QueryItem.vue';
import AnswerItem from '../components/AnswerItem.vue';

const query = ref('')
const QAList = []

const postQuery = async () => {
    if (query.value !== '') {
        try {

            console.log("666" + query.value);

            const url = "http://localhost:8081/api/medical/query"
            const response = await axios.post(url, {
                question: query.value
            },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            console.log("响应问答", response.data);

            if (response.data !== null) {
                QAList.push({ query: query.value, answer: response.data.answer })
            } else {
                QAList.push({ query: query.value, answer: '很抱歉没能听懂您的问题' })
            }

            query.value = ''


        } catch (error) {
            console.error("出错", error);
            alert("加载失败，请稍后再试。"); // 友好的错误提示  

        }
    }
    else {
        alert('请输入问题')
    }
}


</script>

<template>
    <el-container class="container">
        <el-header class="header">
            <span>医疗咨询助手</span>
            <div></div>
        </el-header>

        <div class="main">
            <el-scrollbar height="100%">
                <div v-for="(data, index) in QAList" v-bind:key="index">
                    <query-item :query="data.query"></query-item>
                    <answer-item :answer="data.answer"></answer-item>
                </div>


            </el-scrollbar>

        </div>

        <div class="footer">
            <el-scrollbar class="inputBoxMain" max-height="2rem">
                <el-input class="inputArea" v-model="query" style="width: 100%" autosize type="textarea"
                    placeholder="请输入要咨询的问题" />
            </el-scrollbar>

            <div class="inputBoxFooter">
                <button :class="query === '' ? 'subButton' : 'submitButton'" @click="postQuery">
                    <span class="iconfont icon-tijiaoxinxi"></span>
                </button>
            </div>
        </div>
    </el-container>
</template>

<style scoped>
.container {
    height: 100%;
    width: 80%;
    background-color: rgba(231, 248, 252, 0.579);
    box-sizing: border-box;
    padding-left: 15%;
    padding-right: 15%;
    position: relative;
    display: flex;
    align-items: center;
}

.header {
    width: 100%;
    height: 8%;
    padding: 0;
    background-color: rgba(231, 248, 252, 0.579);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-direction: column;
    position: relative;
}

.header div {
    width: 100%;
    height: 50%;
    background-color: linear-gradient(rgba(231, 248, 252, 0.579) 0%, rgba(255, 255, 255, 0) 100%);
    background-image: linear-gradient(rgba(231, 248, 252, 0.579) 0%, rgba(255, 255, 255, 0) 100%);
    background-position-x: initial;
    background-position-y: initial;
    background-size: initial;
    background-repeat: initial;
    background-attachment: initial;
    background-origin: initial;
    background-clip: initial;
    background-color: initial;
    position: absolute;
    top: 100%;
}

.header span {
    font-family: 'SiYuanHeiTi';
    font-size: 0.15rem;
    font-weight: 600;
}

.main {
    width: 88%;
    height: 78%;
    background-color: #fff;
    box-sizing: border-box;
    padding-top: 2.4%;
}

.footer {
    width: 70%;
    /* min-height: auto; */
    z-index: 1;
    padding: 0;
    padding-bottom: 0.6%;
    box-sizing: content-box;
    border-radius: 0.12rem;
    position: absolute;
    left: 15%;
    bottom: 5%;
    background-color: rgb(243 244 246);
    border-radius: 0.13rem;
    display: flex;
    flex-direction: column;
    border-style: solid;
    border-color: rgb(231, 231, 231);
    border-width: 0.01rem;
    box-sizing: border-box;
    padding-right: 0.5%;
}



.inputBoxFooter {
    height: 33%;
    display: flex;
    justify-content: end;
    align-items: flex-start;
    padding-left: 0.8%;
    padding-right: 0.8%;
}

.inputBoxMain {
    /* max-height: 35%; */
}

.inputBoxFooter button {
    height: 0.225rem;
    width: 0.225rem;
    border-radius: 50%;
    border-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.inputBoxFooter .subButton {
    background-color: rgb(214 222 232);
}

.inputBoxFooter .submitButton {
    background-color: #4d6bfe;
}

:deep(.inputArea .el-textarea__inner) {
    background-color: transparent;
    border: none;
    /* resize: none; */
    /* 可选：禁用文本域拖拽调整大小 */
    margin-top: 1%;
    margin-bottom: 1%;
    padding-left: 2%;
    padding-right: 2%;
    box-shadow: none !important;
    font-size: 0.09rem;
}

:deep(.inputArea .el-textarea__inner:focus) {
    outline: none !important;
    box-shadow: none !important;
}

.iconfont {
    font-size: 0.12rem;
    color: #fff;

}
</style>