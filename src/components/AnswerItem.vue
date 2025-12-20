<script setup>
import { defineProps, ref, watch } from 'vue'; // 1. 导入 watch
import { marked } from 'marked';

const props = defineProps({
    answer: String
});

// 用于存储渲染后的HTML内容
const renderedAnswer = ref('');

// 2. 监听 props.answer 的变化
watch(
    () => props.answer, // 监听目标
    (newAnswer) => {    // 回调函数
        if (newAnswer) {
            // 使用 marked 将 Markdown 转换为 HTML
            renderedAnswer.value = marked.parse(newAnswer);
        } else {
            // 如果 answer 为空，清空渲染结果
            renderedAnswer.value = '';
        }
    },
    { immediate: true } // 立即执行一次，处理初始值
);
</script>

<template>
    <div class="contain">
        <div class="avatar">
            <div class="avatar-circle">
                <span class="avatar-cross">+</span>
            </div>
        </div>
        <div class="answer-bubble">
            <div class="answer-header">
                医疗咨询助手
            </div>
            <div class="answer-text" v-html="renderedAnswer"></div>
            <div class="answer-meta">
                仅作健康科普参考，不能替代医生面诊
            </div>
        </div>
    </div>
</template>

<style scoped>
.contain {
    width: 100%;
    margin-bottom: 10px;
    display: flex;
    justify-content: flex-start;
    box-sizing: border-box;
    padding: 4px 14px;
}

.avatar {
    margin-right: 8px;
    display: flex;
    align-items: flex-start;
}

.avatar-circle {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2563eb;
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
}

.avatar-cross {
    font-size: 18px;
    font-weight: 700;
}

.answer-bubble {
    max-width: 82%;
    background: #f8fafc;
    border-radius: 4px 16px 16px 16px;
    padding: 8px 12px 6px 12px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
}

.answer-header {
    font-size: 12px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 4px;
}

.answer-text {
    font-size: 13px;
    color: #1f2937;
    line-height: 1.7;
    word-break: break-word;
}

.answer-meta {
    margin-top: 6px;
    font-size: 11px;
    color: #94a3b8;
}

/* 为 Markdown 渲染后的内容添加基础样式 */
.answer-text h1,
.answer-text h2,
.answer-text h3,
.answer-text h4,
.answer-text h5,
.answer-text h6 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #0f172a;
}

.answer-text p {
    margin: 0.5rem 0;
}

.answer-text ul,
.answer-text ol {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
}

.answer-text li {
    margin: 0.25rem 0;
}

.answer-text strong {
    font-weight: 700;
    color: #0f172a;
}

.answer-text em {
    font-style: italic;
    color: #64748b;
}

.answer-text code {
    background-color: #f1f5f9;
    border-radius: 4px;
    padding: 0.2em 0.4em;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
}

.answer-text pre {
    background-color: #f1f5f9;
    border-radius: 4px;
    padding: 0.5rem;
    overflow-x: auto;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
    margin: 0.5rem 0;
}

.answer-text blockquote {
    border-left: 4px solid #3b82f6;
    padding: 0.5rem 1rem;
    margin: 0.5rem 0;
    color: #64748b;
    font-style: italic;
}

.answer-text hr {
    border: 0;
    border-top: 1px solid #e2e8f0;
    margin: 1rem 0;
}
</style>