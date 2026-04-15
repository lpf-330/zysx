<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, Clock, View, Download, Delete, Refresh, InfoFilled } from '@element-plus/icons-vue';
import {
    getHealthReportList,
    getHealthReport,
    deleteHealthReport,
} from '../api/healthReport';

const props = defineProps({
    userId: {
        type: String,
        required: true
    }
});

const reports = ref([]);
const isLoading = ref(false);
const deletingReportId = ref(null);
const showReportDetail = ref(false);
const activeReport = ref(null);

const totalReports = computed(() => reports.value.length);

const fetchReports = async () => {
    if (!props.userId) {
        reports.value = [];
        return;
    }

    isLoading.value = true;
    try {
        const response = await getHealthReportList(props.userId);
        let reportData = [];

        if (response && response.code === 200) {
            if (Array.isArray(response.data)) {
                reportData = response.data;
            }
        } else if (Array.isArray(response)) {
            reportData = response;
        }

        reports.value = reportData.map((report, index) => {
            const reportId = report.id || report.report_id || `report_${Date.now()}_${index}`;
            const title = report.title || report.report_title || `健康报告 #${reportId.toString().substring(0, 8)}`;
            const createTime = report.createdAt || report.createTime || report.created_time || new Date().toISOString();
            const content = report.content || report.report || report.report_content || '';
            const summary = report.summary || (content ? content.substring(0, 100).replace(/\n/g, ' ').trim() + '...' : '暂无摘要');

            return {
                id: reportId,
                title: title,
                content: content,
                summary: summary,
                createTime: createTime,
                createdAt: createTime,
                ...report
            };
        });

        reports.value.sort((a, b) => {
            try {
                const timeA = new Date(a.createdAt || a.createTime).getTime();
                const timeB = new Date(b.createdAt || b.createTime).getTime();
                return timeB - timeA;
            } catch (e) {
                return 0;
            }
        });

    } catch (error) {
        console.error('获取健康报告列表失败:', error);
        ElMessage.error('获取报告列表失败');
        reports.value = [];
    } finally {
        isLoading.value = false;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '未知时间';

    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return '刚刚';
        if (diffMinutes < 60) return `${diffMinutes}分钟前`;
        if (diffHours < 24) return `${diffHours}小时前`;
        if (diffDays < 7) return `${diffDays}天前`;

        return date.toLocaleDateString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
};

const formatDetailedDate = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
};

const getReportStatusType = (report) => {
    try {
        const createTime = new Date(report.createdAt || report.createTime);
        const now = new Date();
        const diffMs = now - createTime;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 1) return 'success';
        if (diffDays < 3) return 'warning';
        return 'info';
    } catch (e) {
        return 'info';
    }
};

const viewReport = async (report) => {
    try {
        activeReport.value = {
            ...report,
            formattedDate: formatDetailedDate(report.createdAt || report.createTime)
        };
        showReportDetail.value = true;

        if (!report.content && !report.report && report.id) {
            try {
                const response = await getHealthReport(report.id);
                if (response && response.code === 200) {
                    const content = response.data.report || response.data.content || '';
                    activeReport.value = {
                        ...activeReport.value,
                        content: content,
                        report: content
                    };
                }
            } catch (apiError) {
                console.error('从API获取报告详情失败:', apiError);
            }
        }
    } catch (error) {
        console.error('查看报告错误:', error);
        ElMessage.error('获取报告详情失败');
    }
};

const closeReportDetail = () => {
    showReportDetail.value = false;
    activeReport.value = null;
};

const downloadReport = (report) => {
    if (!report) return;

    try {
        const reportContent = report.content || report.report || '';
        if (!reportContent.trim()) {
            ElMessage.warning('报告内容为空，无法下载');
            return;
        }

        const blob = new Blob([reportContent], {
            type: 'text/markdown;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date(report.createdAt || report.createTime).toISOString().split('T')[0];
        const reportId = report.id ? report.id.toString().substring(0, 8) : 'unknown';
        a.download = `健康报告_${reportId}_${date}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        ElMessage.success('报告下载开始');
    } catch (error) {
        console.error('下载报告错误:', error);
        ElMessage.error('下载报告失败');
    }
};

const deleteReport = async (reportId) => {
    if (!reportId) return;

    try {
        await ElMessageBox.confirm(
            '确定要删除这份健康报告吗？此操作不可恢复。',
            '删除确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );

        deletingReportId.value = reportId;
        await deleteHealthReport(reportId);

        reports.value = reports.value.filter(r => r.id !== reportId);

        if (activeReport.value && activeReport.value.id === reportId) {
            closeReportDetail();
        }

        ElMessage.success('报告删除成功');
    } catch (error) {
        if (error !== 'cancel') {
            console.error('删除报告错误:', error);
            ElMessage.error('删除失败');
        }
    } finally {
        deletingReportId.value = null;
    }
};

watch(() => props.userId, (newUserId) => {
    if (newUserId) {
        fetchReports();
    } else {
        reports.value = [];
    }
}, { immediate: true });

onMounted(() => {
    if (props.userId) {
        fetchReports();
    }
});

defineExpose({
    fetchReports
});
</script>

<template>
    <div class="health-report-list">
        <div class="header-section">
            <div class="title-container">
                <div class="title-icon">
                    <el-icon><Document /></el-icon>
                </div>
                <div class="title-content">
                    <h3 class="section-title">健康报告档案</h3>
                    <div class="section-subtitle">历史生成的健康报告管理</div>
                </div>
            </div>
            <el-button
                type="default"
                size="small"
                plain
                @click="fetchReports"
                :loading="isLoading"
                :disabled="!userId"
            >
                <el-icon><Refresh /></el-icon>
                刷新
            </el-button>
        </div>

        <div v-if="!userId" class="no-user-prompt">
            <div class="prompt-icon">
                <el-icon><InfoFilled /></el-icon>
            </div>
            <p>请先登录以查看健康报告档案</p>
        </div>

        <div v-else class="report-content">
            <div class="list-header">
                <div class="list-title">
                    <el-icon><Document /></el-icon>
                    <span>历史报告 ({{ totalReports }})</span>
                </div>
            </div>

            <div v-if="isLoading" class="loading-state">
                <div class="loading-spinner"></div>
                <p>加载报告中...</p>
            </div>

            <div v-else-if="reports.length === 0" class="empty-state">
                <div class="empty-icon">
                    <el-icon><Document /></el-icon>
                </div>
                <h4>暂无健康报告</h4>
                <p>在上方点击"生成健康报告"按钮创建第一份报告</p>
            </div>

            <el-scrollbar v-else class="report-scroll" height="calc(100%)">
                <div class="report-items">
                    <div
                        v-for="(report, index) in reports"
                        :key="report.id || index"
                        class="report-item"
                    >
                        <div class="report-item-content">
                            <div class="report-icon">
                                <el-icon><Document /></el-icon>
                            </div>
                            <div class="report-info">
                                <div class="report-header">
                                    <span class="report-name">{{ report.title || `健康报告 #${(report.id || '').toString().substring(0, 8)}` }}</span>
                                    <el-tag
                                        :type="getReportStatusType(report)"
                                        size="small"
                                        class="report-status"
                                    >
                                        {{ formatDate(report.createdAt || report.createTime) }}
                                    </el-tag>
                                </div>
                                <div class="report-meta">
                                    <span class="report-date">
                                        <el-icon><Clock /></el-icon>
                                        {{ formatDate(report.createdAt || report.createTime) }}
                                    </span>
                                </div>
                                <div v-if="report.summary && report.summary !== '暂无摘要'" class="report-summary">
                                    {{ report.summary }}
                                </div>
                            </div>
                        </div>

                        <div class="report-actions">
                            <el-button
                                type="primary"
                                size="small"
                                text
                                @click="viewReport(report)"
                            >
                                <el-icon><View /></el-icon>
                                查看
                            </el-button>
                            <el-button
                                type="success"
                                size="small"
                                text
                                @click="downloadReport(report)"
                                :disabled="!report.content && !report.report"
                            >
                                <el-icon><Download /></el-icon>
                                下载
                            </el-button>
                            <el-button
                                type="danger"
                                size="small"
                                text
                                @click="deleteReport(report.id)"
                                :loading="deletingReportId === report.id"
                            >
                                <el-icon><Delete /></el-icon>
                                删除
                            </el-button>
                        </div>
                    </div>
                </div>
            </el-scrollbar>
        </div>

        <el-dialog
            v-model="showReportDetail"
            :title="activeReport?.title || '健康报告详情'"
            width="80%"
            top="5vh"
            custom-class="report-detail-dialog"
            @close="closeReportDetail"
        >
            <div class="report-detail-content">
                <div class="detail-header">
                    <div class="detail-meta">
                        <span>
                            <el-icon><Clock /></el-icon>
                            生成时间: {{ activeReport?.formattedDate || '未知时间' }}
                        </span>
                    </div>
                </div>

                <el-scrollbar height="400px" class="detail-scroll">
                    <div class="detail-body">
                        {{ activeReport?.content || activeReport?.report || '暂无内容' }}
                    </div>
                </el-scrollbar>

                <div class="detail-footer">
                    <el-button
                        type="primary"
                        @click="downloadReport(activeReport)"
                        :disabled="!activeReport?.content && !activeReport?.report"
                    >
                        <el-icon><Download /></el-icon>
                        下载报告 (.md)
                    </el-button>
                    <el-button
                        type="danger"
                        @click="deleteReport(activeReport?.id)"
                    >
                        <el-icon><Delete /></el-icon>
                        删除报告
                    </el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<style scoped>
.health-report-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: transparent;
    padding: 16px;
    box-sizing: border-box;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
    margin-bottom: 16px;
}

.title-container {
    display: flex;
    align-items: center;
    gap: 12px;
}

.title-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #2D572D, #3d7a3d);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
}

.title-icon .el-icon {
    font-size: 18px;
}

.title-content {
    display: flex;
    flex-direction: column;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
}

.section-subtitle {
    font-size: 11px;
    color: #64748b;
    margin-top: 2px;
}

.no-user-prompt {
    text-align: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 247, 240, 0.9));
    border-radius: 12px;
    border: 1px dashed rgba(45, 87, 45, 0.3);
    margin-top: 20px;
}

.prompt-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 16px;
    color: rgba(45, 87, 45, 0.4);
}

.prompt-icon .el-icon {
    font-size: 32px;
}

.no-user-prompt p {
    color: #64748b;
    font-size: 13px;
    margin: 0;
}

.report-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.list-header {
    margin-bottom: 12px;
}

.list-title {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
}

.list-title .el-icon {
    color: #2D572D;
}

.loading-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #2D572D;
}

.loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(45, 87, 45, 0.3);
    border-top-color: #2D572D;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.loading-state p {
    color: #64748b;
    font-size: 13px;
    margin: 0;
}

.empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
}

.empty-icon {
    width: 60px;
    height: 60px;
    color: rgba(45, 87, 45, 0.3);
    margin-bottom: 16px;
}

.empty-icon .el-icon {
    font-size: 36px;
}

.empty-state h4 {
    font-size: 15px;
    color: #0f172a;
    margin: 0 0 8px 0;
    font-weight: 600;
}

.empty-state p {
    color: #64748b;
    font-size: 12px;
    margin: 0;
}

.report-scroll {
    flex: 1;
}

.report-items {
    padding: 4px 2px 4px 0;
}

.report-item {
    background: white;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
    margin-bottom: 10px;
    box-shadow: 0 2px 8px rgba(45, 87, 45, 0.05);
}

.report-item:hover {
    border-color: #a3d9a3;
    box-shadow: 0 4px 12px rgba(45, 87, 45, 0.1);
    transform: translateY(-1px);
}

.report-item-content {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
}

.report-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #e0f2e0, #d0e8d0);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(45, 87, 45, 0.1);
    flex-shrink: 0;
}

.report-icon .el-icon {
    font-size: 18px;
    color: #2D572D;
}

.report-info {
    flex: 1;
    min-width: 0;
}

.report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    flex-wrap: wrap;
    gap: 8px;
}

.report-name {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
}

.report-status {
    font-size: 11px;
    flex-shrink: 0;
}

.report-meta {
    display: flex;
    gap: 16px;
    font-size: 11px;
    color: #64748b;
    margin-bottom: 8px;
    flex-wrap: wrap;
}

.report-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
}

.report-meta .el-icon {
    font-size: 10px;
    opacity: 0.7;
}

.report-summary {
    font-size: 12px;
    color: #475569;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 4px;
    padding: 4px 0;
}

.report-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    border-top: 1px solid #f1f5f9;
    padding-top: 12px;
}

.report-actions .el-button {
    padding: 6px 10px;
    font-size: 11px;
    height: 28px;
}

.report-detail-content {
    padding: 0;
}

.detail-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
}

.detail-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 12px;
    color: #64748b;
}

.detail-meta span {
    background: #f1f5f9;
    padding: 6px 10px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.detail-body {
    padding: 20px;
    font-size: 13px;
    line-height: 1.7;
    color: #1f2937;
    max-height: 50vh;
    overflow-y: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.detail-footer {
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

@media (max-width: 768px) {
    .health-report-list {
        padding: 12px;
    }

    .report-item {
        padding: 12px;
    }

    .detail-footer {
        flex-direction: column;
    }

    .detail-footer .el-button {
        width: 100%;
        margin-bottom: 8px;
    }
}
</style>