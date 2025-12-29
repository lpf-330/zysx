<script setup>
import { defineProps, ref, watch } from 'vue';
import { marked } from 'marked';
import { ElMessage, ElIcon } from 'element-plus';
import { Download, Loading } from '@element-plus/icons-vue';

const props = defineProps({
    report: String,
    loading: {
        type: Boolean,
        default: false
    }
});

const renderedReport = ref('');

watch(
    () => props.report,
    (newReport) => {
        if (newReport && newReport.trim()) {
            renderedReport.value = marked.parse(newReport);
        } else {
            renderedReport.value = '';
        }
    },
    { immediate: true }
);

// 修改下载功能，下载 markdown 格式
const downloadReport = () => {
    if (!props.report || !props.report.trim()) {
        ElMessage.warning('当前没有可下载的报告内容');
        return;
    }
    
    try {
        // 创建 markdown 格式的报告内容
        const reportContent = props.report;
        
        // 创建 Blob 对象，使用 markdown 的 MIME 类型
        const blob = new Blob([reportContent], { 
            type: 'text/markdown;charset=utf-8' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // 使用当前日期作为文件名，扩展名为 .md
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        a.download = `健康报告_${dateStr}_${timeStr}.md`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        ElMessage.success('Markdown 报告下载成功');
    } catch (error) {
        console.error('下载报告失败:', error);
        ElMessage.error('下载失败，请重试');
    }
};
</script>

<template>
    <div class="report-contain">
        <div class="report-header">
            <div class="header-title">📋 今日健康报告</div>
            <div class="header-subtitle">由 AI 生成的个性化健康评估</div>
        </div>
        
        <div class="report-body">
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <div class="loading-text">正在为您生成健康报告，请稍候…</div>
            </div>
            
            <!-- 报告内容 -->
            <div v-else-if="renderedReport" class="report-content" v-html="renderedReport"></div>
            
            <!-- 空状态 -->
            <div v-else class="empty-state">
                暂无报告内容
            </div>
        </div>
        
        <div class="report-footer" v-if="!loading && renderedReport">
            <el-button type="primary" size="small" plain @click="downloadReport">
                <el-icon><Download /></el-icon>
                下载报告 (.md)
            </el-button>
        </div>
    </div>
</template>

<style scoped>
.report-contain {
    width: 79%;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.15);
    border: 1px solid #bae6fd;
    display: flex;
    flex-direction: column;
    margin-left: 0.355rem;
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
    min-height: 120px;
    overflow-y: auto;
}

/* 加载状态样式 */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 120px;
    color: #3b82f6;
}

.loading-icon {
    font-size: 24px;
    margin-bottom: 8px;
    animation: spin 1s linear infinite;
}

.loading-text {
    font-size: 13px;
    color: #64748b;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* 空状态样式 */
.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    color: #94a3b8;
    font-size: 13px;
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

/* 响应式设计 */
@media (max-width: 768px) {
    .report-contain {
        width: 90%;
        padding: 12px;
        border-radius: 14px;
    }
    
    .header-title {
        font-size: 14px;
    }
    
    .header-subtitle {
        font-size: 11px;
    }
    
    .loading-text,
    .report-content {
        font-size: 12px;
    }
}
</style>