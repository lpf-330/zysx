<script setup>
import { ref } from 'vue';

const memos = ref([
    { id: 1, text: '按时服药', completed: false, time: '08:00' },
    { id: 2, text: '适量运动', completed: true, time: '09:00' },
    { id: 3, text: '健康饮食', completed: false, time: '12:00' },
]);

const newMemo = ref('');

const addMemo = () => {
    if (newMemo.value.trim()) {
        memos.value.push({
            id: Date.now(),
            text: newMemo.value,
            completed: false,
            time: ''
        });
        newMemo.value = '';
    }
};

const toggleMemo = (id) => {
    const memo = memos.value.find(m => m.id === id);
    if (memo) {
        memo.completed = !memo.completed;
    }
};

const deleteMemo = (id) => {
    memos.value = memos.value.filter(m => m.id !== id);
};
</script>

<template>
    <div class="memo-card">
        <div class="memo-header">
            <span class="memo-title">今日待办</span>
            <span class="memo-count">{{ memos.length }}</span>
        </div>
        <div class="memo-list">
            <div
                v-for="memo in memos"
                :key="memo.id"
                class="memo-item"
                :class="{ 'completed': memo.completed }"
            >
                <div class="memo-checkbox" @click="toggleMemo(memo.id)">
                    <span v-if="memo.completed" class="check-mark"></span>
                </div>
                <span class="memo-text">{{ memo.text }}</span>
                <span v-if="memo.time" class="memo-time">{{ memo.time }}</span>
                <button class="delete-btn" @click="deleteMemo(memo.id)">
                    <span>×</span>
                </button>
            </div>
        </div>
        <div class="add-memo">
            <input
                v-model="newMemo"
                placeholder="添加待办事项..."
                class="memo-input"
                @keyup.enter="addMemo"
            >
            <button class="add-btn" @click="addMemo">
                <span>+</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.memo-card {
    background: linear-gradient(135deg, #ffffff 0%, #fafcf8 100%);
    border-radius: 0.1rem;
    padding: 0.15rem;
    box-shadow: 0 2px 10px rgba(45, 87, 45, 0.05);
    border: 1px solid rgba(45, 87, 45, 0.08);
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
}

.memo-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 0.1rem;
    margin-bottom: 0.08rem;
    border-bottom: 1px solid rgba(45, 87, 45, 0.06);
}

.memo-title {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.13rem;
    font-weight: 600;
    color: #2D572D;
}

.memo-count {
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.1rem;
    color: #999;
    background: rgba(45, 87, 45, 0.06);
    padding: 0.02rem 0.08rem;
    border-radius: 0.1rem;
}

.memo-list {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
}

.memo-item {
    display: flex;
    align-items: center;
    padding: 0.08rem 0;
    border-bottom: 1px solid rgba(45, 87, 45, 0.04);
    transition: all 0.2s ease;
}

.memo-item:hover {
    background: rgba(45, 87, 45, 0.02);
}

.memo-item.completed .memo-text {
    color: #bbb;
    text-decoration: line-through;
}

.memo-checkbox {
    width: 0.16rem;
    height: 0.16rem;
    border: 1.5px solid #ccc;
    border-radius: 0.03rem;
    margin-right: 0.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.memo-item.completed .memo-checkbox {
    background: #2D572D;
    border-color: #2D572D;
}

.check-mark {
    width: 0.08rem;
    height: 0.05rem;
    border-left: 1.5px solid #fff;
    border-bottom: 1.5px solid #fff;
    transform: rotate(-45deg);
    margin-bottom: 0.02rem;
}

.memo-text {
    flex: 1;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.11rem;
    color: #333;
}

.memo-time {
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.09rem;
    color: #999;
    margin-left: 0.1rem;
}

.delete-btn {
    background: none;
    border: none;
    color: #ccc;
    font-size: 0.14rem;
    cursor: pointer;
    padding: 0 0.04rem;
    opacity: 0;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.memo-item:hover .delete-btn {
    opacity: 1;
}

.delete-btn:hover {
    color: #D32F2F;
}

.add-memo {
    display: flex;
    gap: 0.08rem;
    margin-top: 0.1rem;
    padding-top: 0.1rem;
    border-top: 1px solid rgba(45, 87, 45, 0.06);
}

.memo-input {
    flex: 1;
    border: 1px solid rgba(45, 87, 45, 0.15);
    border-radius: 0.05rem;
    padding: 0.06rem 0.1rem;
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.11rem;
    outline: none;
    transition: border-color 0.2s ease;
}

.memo-input:focus {
    border-color: #2D572D;
}

.memo-input::placeholder {
    color: #ccc;
}

.add-btn {
    background: #2D572D;
    border: none;
    color: #fff;
    width: 0.26rem;
    height: 0.26rem;
    border-radius: 0.05rem;
    cursor: pointer;
    font-size: 0.14rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.add-btn:hover {
    background: #3d7a3d;
}
</style>