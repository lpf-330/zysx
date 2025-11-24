<script setup>
import { ref } from 'vue';
import axios from 'axios';
import QueryItem from '../components/QueryItem.vue';
import AnswerItem from '../components/AnswerItem.vue';
import { userQuery } from '../api/medicalQA';

const query = ref('')
const QAList = ref([])

const postQuery = async () => {
    if (query.value !== '') {
        try {
            const response = await userQuery(query.value)

            if (response !== null) {
                QAList.value.push({ query: query.value, answer: response.answer })
            } else {
                QAList.value.push({ query: query.value, answer: '很抱歉没能听懂您的问题' })
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
                <div v-for="(data, index) in QAList" :key="index">
                    <query-item :query="data.query"></query-item>
                    <answer-item :answer="data.answer"></answer-item>
                </div>
            </el-scrollbar>
        </div>

        <div class="footer">
            <el-scrollbar class="inputBoxMain" max-height="2rem">
                <el-input 
                    class="inputArea" 
                    v-model="query" 
                    style="width: 100%" 
                    autosize 
                    type="textarea"
                    placeholder="请输入要咨询的问题" 
                    :rows="1"
                />
            </el-scrollbar>

            <div class="inputBoxFooter">
                <button 
                    :class="query === '' ? 'subButton' : 'submitButton'" 
                    @click="postQuery"
                    :disabled="query === ''"
                >
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
    background: linear-gradient(135deg, rgba(231, 248, 252, 0.8) 0%, rgba(240, 248, 255, 0.6) 100%);
    box-sizing: border-box;
    padding-left: 15%;
    padding-right: 15%;
    position: relative;
    display: flex;
    align-items: center;
    backdrop-filter: blur(10px);
}

.header {
    width: 100%;
    height: 8%;
    padding: 0;
    background: linear-gradient(135deg, rgba(231, 248, 252, 0.8) 0%, rgba(240, 248, 255, 0.6) 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.header div {
    width: 100%;
    height: 50%;
    background-image: linear-gradient(rgba(231, 248, 252, 0.579) 0%, rgba(255, 255, 255, 0) 100%);
    position: absolute;
    top: 100%;
}

.header span {
    font-family: 'SiYuanHeiTi', 'Microsoft YaHei', sans-serif;
    font-size: 0.18rem;
    font-weight: 600;
    color: #2c3e50;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.main {
    width: 106%;
    height: 70%;
    background-color: rgba(255, 255, 255, 0.9);
    box-sizing: border-box;
    padding-top: 2.4%;
    border-radius: 0.15rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);
}

.footer {
    width: 70%;
    z-index: 1;
    padding: 0;
    padding-bottom: 0.6%;
    box-sizing: content-box;
    border-radius: 0.15rem;
    position: absolute;
    left: 15%;
    bottom: 5%;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 0.15rem;
    display: flex;
    flex-direction: column;
    border: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.inputBoxFooter {
    height: 33%;
    display: flex;
    justify-content: end;
    align-items: flex-start;
    padding-left: 0.8%;
    padding-right: 0.8%;
    margin-top: 0.05rem;
}

.inputBoxMain {
    margin-left: 0.8%;
    margin-right: 0.8%;
    margin-top: 0.05rem;
}

.inputBoxFooter button {
    height: 0.25rem;
    width: 0.25rem;
    border-radius: 50%;
    border-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.inputBoxFooter .subButton {
    background-color: #cbd5e1;
    cursor: not-allowed;
}

.inputBoxFooter .subButton:hover {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.inputBoxFooter .submitButton {
    background: linear-gradient(135deg, #4d6bfe 0%, #6a8bff 100%);
}

.inputBoxFooter .submitButton:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(77, 107, 254, 0.3);
}

.inputBoxFooter .submitButton:active {
    transform: scale(0.95);
}

:deep(.inputArea .el-textarea__inner) {
    background-color: transparent;
    border: none;
    margin-top: 1%;
    margin-bottom: 1%;
    padding-left: 2%;
    padding-right: 2%;
    box-shadow: none !important;
    font-size: 0.09rem;
    font-family: 'OpenSans', 'Microsoft YaHei', sans-serif;
    resize: none;
    border-radius: 0.07rem;
    transition: all 0.3s ease;
}

:deep(.inputArea .el-textarea__inner:focus) {
    outline: none !important;
    box-shadow: none !important;
    background-color: rgba(249, 250, 251, 0.5);
}

/* 添加滚动条样式 */
:deep(.el-scrollbar__bar.is-vertical) {
    width: 6px !important;
}

:deep(.el-scrollbar__bar.is-vertical > div) {
    background-color: rgba(148, 163, 184, 0.5) !important;
    border-radius: 3px !important;
}

:deep(.el-scrollbar__bar.is-horizontal) {
    height: 6px !important;
}

:deep(.el-scrollbar__bar.is-horizontal > div) {
    background-color: rgba(148, 163, 184, 0.5) !important;
    border-radius: 3px !important;
}

/* 添加响应式设计 */
@media (max-width: 768px) {
    .container {
        width: 95%;
        padding-left: 2.5%;
        padding-right: 2.5%;
    }
    
    .footer {
        width: 90%;
        left: 5%;
    }
    
    .header span {
        font-size: 0.16rem;
    }
}
</style>