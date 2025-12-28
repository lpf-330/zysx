<script setup>
import { defineProps, ref, watch } from 'vue';
import { marked } from 'marked';
import { ElMessage } from 'element-plus'; // 引入 ElMessage 用于提示

const props = defineProps({
    report: String
});

const renderedReport = ref('');

watch(
    () => props.report,
    (newReport) => {
        if (newReport) {
            renderedReport.value = marked.parse(newReport);
        } else {
            renderedReport.value = '';
        }
    },
    { immediate: true }
);

// 1. 添加下载功能
const downloadReport = () => {
    if (!props.report || !props.report.trim()) {
        ElMessage.warning('当前没有可下载的报告内容');
        return;
    }
    const blob = new Blob([props.report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    a.download = `健康报告_${dateStr}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ElMessage.success('报告下载成功');
};
</script>

<template>
    <div class="report-contain">
        <div class="report-header">
            <div class="header-title">📋 今日健康报告</div>
            <div class="header-subtitle">由 AI 生成的个性化健康评估</div>
        </div>
        <div class="report-body">
            <div class="report-content" v-html="renderedReport"></div>
        </div>
        <div class="report-footer">
            <!-- 2. 修改按钮为蓝色风格，符合整体设计 -->
            <el-button type="primary" size="small" plain @click="downloadReport">
                <!-- 3. 添加下载图标 -->
                <el-icon><Download /></el-icon>
                下载报告
            </el-button>
        </div>
    </div>
</template>

<style scoped>
.report-contain {
    width: 70%; /* 与聊天区域宽度一致 */
    max-width: 7.5rem; /* 与聊天区域最大宽度一致 */
    margin-bottom: 16px;
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe); /* 蓝白色渐变背景 */
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.15);
    border: 1px solid #bae6fd;
    display: flex;
    flex-direction: column;
}

.report-header {
    padding-bottom: 12px;
    border-bottom: 1px dashed #93c5fd;
    margin-bottom: 12px;
}

.header-title {
    font-size: 15px;
    font-weight: 600;
    color: #1d4ed8;
    display: flex;
    align-items: center;
}

.header-subtitle {
    font-size: 12px;
    color: #60a5fa;
    margin-top: 4px;
}

.report-body {
    flex: 1;
    overflow-y: auto;
}

.report-content {
    font-size: 13px;
    color: #1e293b;
    line-height: 1.7;
}

/* 为 Markdown 渲染后的内容添加基础样式 */
.report-content h1,
.report-content h2,
.report-content h3,
.report-content h4,
.report-content h5,
.report-content h6 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #1e3a8a;
}

.report-content p {
    margin: 0.5rem 0;
}

.report-content ul,
.report-content ol {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
}

.report-content li {
    margin: 0.25rem 0;
}

.report-content strong {
    font-weight: 700;
    color: #1e3a8a;
}

.report-content em {
    font-style: italic;
    color: #64748b;
}

.report-content code {
    background-color: #dbeafe;
    border-radius: 4px;
    padding: 0.2em 0.4em;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
    color: #1e40af;
}

.report-content pre {
    background-color: #dbeafe;
    border-radius: 4px;
    padding: 0.5rem;
    overflow-x: auto;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
    color: #1e40af;
    margin: 0.5rem 0;
}

.report-content blockquote {
    border-left: 4px solid #3b82f6;
    padding: 0.5rem 1rem;
    margin: 0.5rem 0;
    color: #3730a3;
    font-style: italic;
    background-color: rgba(59, 130, 246, 0.1);
}

.report-content hr {
    border: 0;
    border-top: 1px solid #93c5fd;
    margin: 1rem 0;
}

.report-footer {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px dashed #93c5fd;
    display: flex;
    justify-content: flex-end;
}
</style>