<!-- 用户管理健康报告列表 -->
<template>
    <div class="health-report-list-container">
        <div class="list-header">
            <div class="header-title">📋 健康报告列表</div>
            <el-button
                type="primary"
                size="small"
                :disabled="isGenerating"
                @click="generateReport"
            >
                <el-icon v-if="isGenerating"><Loading /></el-icon>
                <span v-else>生成新报告</span>
            </el-button>
        </div>

        <div v-if="isLoading" class="loading-state">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
        </div>

        <div v-else-if="reports.length === 0" class="empty-state">
            <div class="empty-icon">📋</div>
            <p>暂无健康报告</p>
            <p>点击上方按钮生成第一份报告</p>
        </div>

        <div v-else class="report-list">
            <div
                v-for="report in reports"
                :key="report.id"
                class="report-card"
            >
                <div class="report-card-header">
                    <div class="report-card-title">报告 #{{ report.id }}</div>
                    <div class="report-card-date">{{ formatDate(report.createTime) }}</div>
                </div>
                <div class="report-card-content">
                    <p>{{ truncateContent(report.report || '') }}</p>
                </div>
                <div class="report-card-actions">
                    <el-button size="small" @click="viewReport(report)">查看</el-button>
                    <el-button size="small" @click="downloadReport(report)">下载</el-button>
                    <el-button size="small" type="danger" @click="deleteReport(report.id)">删除</el-button>
                </div>
            </div>
        </div>

        <!-- 查看报告详情的弹窗 -->
        <el-drawer
            v-model="showDetailDrawer"
            title="健康报告详情"
            size="50%"
            direction="rtl"
            destroy-on-close
        >
            <div v-if="selectedReport" class="detail-content">
                <div class="detail-header">
                    <h3>报告 #{{ selectedReport.id }}</h3>
                    <p class="detail-date">{{ formatDate(selectedReport.createTime) }}</p>
                </div>
                <div class="detail-body">
                    <div class="report-content" v-html="renderedDetailReport"></div>
                </div>
                <div class="detail-footer">
                    <el-button type="primary" @click="downloadReport(selectedReport)">下载此报告</el-button>
                </div>
            </div>
        </el-drawer>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { marked } from 'marked';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
    getHealthReportList,
    generateHealthReport as apiGenerateHealthReport,
    getHealthReport,
    deleteHealthReport as apiDeleteHealthReport,
    saveHealthReport
} from '../api/healthReport';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';

const userInfoStore = storeToRefs(useUserInfoStore());
const user_id = userInfoStore.user_id.value;

const reports = ref([]);
const isLoading = ref(false);
const isGenerating = ref(false);
const showDetailDrawer = ref(false);
const selectedReport = ref(null);
const renderedDetailReport = ref('');

// 格式化日期
const formatDate = (dateString) => {
    try {
        return new Date(dateString).toLocaleString('zh-CN');
    } catch (e) {
        console.error('Date formatting error:', e);
        return dateString || '未知时间';
    }
};

// 截取内容用于列表显示
const truncateContent = (content, length = 100) => {
    if (!content) return '';
    return content.length > length ? content.substring(0, length) + '...' : content;
};

// 获取报告列表
const fetchReports = async () => {
    if (!user_id) return;
    isLoading.value = true;
    try {
        const response = await getHealthReportList(user_id);
        if (response.code === 200) {
            reports.value = response.data || [];
            reports.value.sort((a, b) => new Date(b.createTime) - new Date(a.createTime)); // 按时间倒序
        } else {
            throw new Error(response.message || '获取列表失败');
        }
    } catch (error) {
        console.error('获取报告列表错误:', error);
        ElMessage.error(`获取列表失败: ${error.message}`);
        reports.value = []; // 获取失败时清空列表
    } finally {
        isLoading.value = false;
    }
};

// 生成报告
const generateReport = async () => {
    if (isGenerating.value || !user_id) return;
    isGenerating.value = true;
    try {
        console.log('开始生成报告，用户ID:', user_id);
        const { reader } = await apiGenerateHealthReport(user_id);
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let accumulatedReport = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            let lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('data:')) {
                    const dataContent = trimmedLine.substring(5).trim();
                    if (dataContent && dataContent !== '[DONE]') {
                        try {
                            const parsedData = JSON.parse(dataContent);
                            if (parsedData.answer) {
                                accumulatedReport += parsedData.answer;
                            }
                        } catch (e) {
                            accumulatedReport += dataContent + '\n';
                        }
                    }
                }
            }
        }

        if (buffer.trim()) {
            accumulatedReport += buffer;
        }

        if (!accumulatedReport.trim()) {
            throw new Error('生成的报告内容为空');
        }

        // 保存报告
        const saveResponse = await saveHealthReport(user_id, accumulatedReport.trim());
        if (saveResponse.code === 200) {
            ElMessage.success('健康报告生成并保存成功！');
            // 刷新列表
            await fetchReports();
        } else {
            throw new Error(saveResponse.message || '保存报告失败');
        }
    } catch (error) {
        console.error('生成报告错误:', error);
        ElMessage.error(`生成报告失败: ${error.message || '未知错误'}`);
    } finally {
        isGenerating.value = false;
    }
};

// 查看报告详情
const viewReport = async (report) => {
    try {
        // 如果报告内容已经存在，直接显示
        if (report.report) {
            selectedReport.value = report;
            renderedDetailReport.value = marked.parse(report.report);
            showDetailDrawer.value = true;
            return;
        }
        // 否则调用API获取
        const response = await getHealthReport(report.id);
        if (response.code === 200) {
            selectedReport.value = response.data;
            renderedDetailReport.value = marked.parse(response.data.report || '');
            showDetailDrawer.value = true;
        } else {
            throw new Error(response.message || '获取报告详情失败');
        }
    } catch (error) {
        console.error('查看报告详情错误:', error);
        ElMessage.error(`获取报告详情失败: ${error.message}`);
    }
};

// 下载报告
const downloadReport = (report) => {
    const reportContent = report.report || '';
    if (!reportContent.trim()) {
        ElMessage.warning('报告内容为空，无法下载');
        return;
    }
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date(report.createTime).toISOString().split('T')[0];
    a.download = `健康报告_${report.id}_${dateStr}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ElMessage.success('报告下载成功');
};

// 删除报告
const deleteReport = async (reportId) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除报告 #${reportId} 吗？此操作不可撤销。`,
            '确认删除',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );
        const response = await apiDeleteHealthReport(reportId);
        if (response.code === 200) {
            ElMessage.success('报告删除成功');
            // 从本地列表移除
            reports.value = reports.value.filter(r => r.id !== reportId);
            // 如果删除的是当前查看的报告，关闭详情页
            if (selectedReport.value && selectedReport.value.id === reportId) {
                showDetailDrawer.value = false;
            }
        } else {
            throw new Error(response.message || '删除失败');
        }
    } catch (error) {
        if (error !== 'cancel') { // 用户取消操作
            console.error('删除报告错误:', error);
            ElMessage.error(`删除报告失败: ${error.message}`);
        }
    }
};

onMounted(() => {
    fetchReports();
});
</script>

<style scoped>
.health-report-list-container {
    width: 300px; /* 设置固定宽度 */
    height: calc(100vh - 24px); /* 高度占满视口，减去顶部margin */
    margin-left: 12px; /* 与主内容区有间距 */
    padding: 16px;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 18px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 防止内部元素撑开 */
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 12px;
}

.header-title {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: #64748b;
}

.loading-icon {
    font-size: 24px;
    margin-bottom: 8px;
    animation: rotating 2s linear infinite;
}

@keyframes rotating {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: #64748b;
    text-align: center;
}

.empty-icon {
    font-size: 40px;
    margin-bottom: 8px;
}

.report-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px; /* 为滚动条留出空间 */
}

.report-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.2s ease;
}

.report-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.report-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.report-card-title {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
}

.report-card-date {
    font-size: 12px;
    color: #64748b;
}

.report-card-content {
    margin-bottom: 12px;
}

.report-card-content p {
    font-size: 13px;
    color: #475569;
    line-height: 1.5;
    margin: 0;
}

.report-card-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.detail-content {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.detail-header {
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 16px;
}

.detail-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
}

.detail-date {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #64748b;
}

.detail-body {
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;
}

.report-content {
    font-size: 14px;
    color: #1e293b;
    line-height: 1.7;
}

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

.detail-footer {
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
}
</style>