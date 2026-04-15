<script setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';

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
            renderedReport.value = newReport.replace(/\n/g, '<br>');
        } else {
            renderedReport.value = '';
        }
    },
    { immediate: true }
);

const downloadReport = () => {
    if (!props.report || !props.report.trim()) {
        ElMessage.warning('当前没有可下载的报告内容');
        return;
    }

    try {
        const blob = new Blob([props.report], {
            type: 'text/markdown;charset=utf-8'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

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
            <div v-if="loading" class="loading-state">
                <div class="loading-spinner"></div>
                <div class="loading-text">正在为您生成健康报告，请稍候…</div>
            </div>

            <div v-else-if="renderedReport" class="report-content" v-html="renderedReport"></div>

            <div v-else class="empty-state">
                暂无报告内容
            </div>
        </div>

        <div class="report-footer" v-if="!loading && renderedReport">
            <el-button type="primary" size="small" plain @click="downloadReport">
                下载报告 (.md)
            </el-button>
        </div>
    </div>
</template>

<style scoped>
.report-contain {
    width: 79%;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #f0f9f0, #e0f2e0);
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 6px 16px rgba(45, 87, 45, 0.15);
    border: 1px solid #a3d9a3;
    display: flex;
    flex-direction: column;
    margin-left: 0.355rem;
}

.report-header {
    padding-bottom: 12px;
    border-bottom: 1px dashed #93c993;
    margin-bottom: 12px;
}

.header-title {
    font-size: 15px;
    font-weight: 600;
    color: #1d5d1d;
    display: flex;
    align-items: center;
}

.header-subtitle {
    font-size: 12px;
    color: #3d7a3d;
    margin-top: 4px;
}

.report-body {
    flex: 1;
    min-height: 120px;
    overflow-y: auto;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 120px;
    color: #2D572D;
}

.loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #a3d9a3;
    border-top-color: #2D572D;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.loading-text {
    font-size: 13px;
    color: #64748b;
}

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
    white-space: pre-wrap;
    word-wrap: break-word;
}

.report-footer {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px dashed #93c993;
    display: flex;
    justify-content: flex-end;
}

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