<script setup>
import { ElScrollbar } from 'element-plus';
import 'element-plus/dist/index.css';
import { ref } from 'vue';
import axios from 'axios';
import { onBeforeUnmount } from 'vue';

const items = ref([
    { event: "吃药", time: "2025年5月4日15:30" },
    { event: "开会", time: "2024年5月15日13:10" }
])



// const fetchData = () => {
//     const url = 'http://localhost:8081/'    //这后面还没补完
//     const response = await axios.post(url, {
//         cancelToken: cancelTokenSource.token
//     },
//         {
//             headers: {
//                 'Content-Type': 'application/json',
//             }
//         }
//     )

//     if (response.data.code === 1) {

//     } else {
//         alert(response.data.msg)
//     }
// }

</script>

<template>
    <el-scrollbar height="1.3rem">
        <div class="content">
            <!-- 长内容 -->
            <div class="note" v-for="item in items" :key="item">
                <div class="event">{{ item.event }}</div>
                <div class="time">{{ item.time }}</div>
            </div>
        </div>
    </el-scrollbar>
</template>

<style scoped>
.content {
    padding-left: 5%;
}

.note {
    width: 90%;
    height: 0.5rem;
    margin-bottom: 8%;
    box-shadow: 0px 0.02rem 0.04rem rgba(0, 0, 0, 0.25);
    border-radius: 0.06rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    padding-left: 0.08rem;
    font-family: 'SiYuanHeiTi';
}

.event {
    font-size: 0.14rem;
}

.time {
    font-size: 0.1rem;
}
</style>