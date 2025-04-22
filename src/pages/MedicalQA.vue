<script setup>
import { ref } from 'vue';
import axios from 'axios';

const query = ref('')

const postQuery = async () => {
    if (query.value !== '') {
        try {

            console.log("666"+query.value);
            
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
    <input type="text" v-model="query">
    <button @click="postQuery">提交</button>
</template>

<style scoped></style>