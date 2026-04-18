<!-- src/components/HealthReportList.vue -->
<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
    Document,
    Clock,
    View,
    Download,
    Delete,
    Refresh,
    Loading,
    InfoFilled
} from '@element-plus/icons-vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
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

// 响应式数据
const reports = ref([]);
const isLoading = ref(false);
const deletingReportId = ref(null);
const showReportDetail = ref(false);
const activeReport = ref(null);
const isSaving = ref(false);

// 计算报告总数
const totalReports = computed(() => reports.value.length);

// 获取报告列表
const fetchReports = async () => {
    if (!props.userId) {
        reports.value = [];
        return;
    }
    
    console.log('获取报告列表，用户ID:', props.userId);
    isLoading.value = true;
    try {
        const response = await getHealthReportList(props.userId);
        console.log('获取报告列表API响应:', response);
        
        // 根据API响应结构处理数据
        let reportData = [];
        
        if (response && response.code === 200) {
            // 成功响应，检查是否有data字段
            if (Array.isArray(response.data)) {
                reportData = response.data;
                console.log('从response.data获取报告数据:', reportData);
            } else if (Array.isArray(response.reports)) {
                // 如果有reports字段
                reportData = response.reports;
            } else {
                console.warn('响应格式异常，没有找到报告数据:', response);
                reportData = [];
            }
        } else if (Array.isArray(response)) {
            // 如果API直接返回数组
            reportData = response;
        } else {
            console.warn('未识别的响应格式:', response);
            reportData = [];
        }
        
        // 处理报告数据，添加必要的字段
        reports.value = reportData.map((report, index) => {
            // 生成一个唯一的ID（如果API没有返回id）
            const reportId = report.id || report.report_id || `report_${Date.now()}_${index}`;
            
            // 生成标题
            const title = report.title || report.report_title || `健康报告 #${reportId.toString().substring(0, 8)}`;
            
            // 获取创建时间
            const createTime = report.createdAt || report.createTime || report.created_time || new Date().toISOString();
            
            // 获取内容（如果有的话）
            const content = report.content || report.report || report.report_content || '';
            
            // 计算字数
            const wordCount = calculateWordCount(content);
            
            // 生成摘要
            const summary = report.summary || 
                          (content ? content.substring(0, 100).replace(/\n/g, ' ').trim() + '...' : '暂无摘要');
            
            const processedReport = {
                id: reportId,
                title: title,
                content: content,
                summary: summary,
                createTime: createTime,
                createdAt: createTime,
                wordCount: wordCount,
                // 保留原始数据中的所有字段
                ...report
            };
            
            console.log(`处理报告 ${index + 1}:`, processedReport);
            return processedReport;
        });
        
        console.log('处理后的报告列表:', reports.value);
        
        // 按创建时间降序排序
        reports.value.sort((a, b) => {
            try {
                const timeA = new Date(a.createdAt || a.createTime).getTime();
                const timeB = new Date(b.createdAt || b.createTime).getTime();
                return timeB - timeA;
            } catch (e) {
                console.error('排序错误:', e);
                return 0;
            }
        });
        
        console.log('排序后的报告列表:', reports.value);
        
        // 如果没有报告数据，显示信息
        if (reports.value.length === 0) {
            console.log('用户没有历史报告');
        }
        
    } catch (error) {
        console.error('获取健康报告列表失败:', error);
        ElMessage.error('获取报告列表失败');
        reports.value = [];
    } finally {
        isLoading.value = false;
    }
};

// 计算字数的辅助函数
const calculateWordCount = (text) => {
    if (!text) return 0;
    // 去除HTML标签和空白字符，然后计算字符数
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return cleanText.length;
};

// 清理内容中的多余空行
const cleanContent = (content) => {
    if (!content) return '';
    
    // 1. 将不同格式的换行符统一为\n
    let cleaned = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // 2. 移除行首尾的空白字符
    cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');
    
    // 3. 将连续3个以上的换行符替换为2个换行符
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // 4. 移除Markdown表格前后的多余空行
    cleaned = cleaned.replace(/\n+(\|.*\|.*\n)+\n+/g, '\n$1\n');
    
    return cleaned;
};

// 后处理HTML：移除多余的空元素和空白
const postProcessHtml = (html) => {
    if (!html) return '';
    
    // 创建一个临时div来操作DOM
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // 移除空的段落
    const emptyParagraphs = tempDiv.querySelectorAll('p:empty, p:has(br:only-child)');
    emptyParagraphs.forEach(p => p.remove());
    
    // 移除只有空白字符的段落
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
        if (!p.textContent.trim()) {
            p.remove();
        }
    });
    
    // 移除连续的<br>标签（保留一个）
    const brElements = tempDiv.querySelectorAll('br');
    let lastBr = null;
    Array.from(brElements).forEach(br => {
        if (lastBr && br.previousElementSibling === lastBr) {
            br.remove();
        } else {
            lastBr = br;
        }
    });
    
    // 为表格添加样式类
    const tables = tempDiv.querySelectorAll('table');
    tables.forEach(table => {
        table.classList.add('report-table');
    });
    
    return tempDiv.innerHTML;
};

// 检测内容类型
const detectContentType = (content) => {
    if (!content) return 'plain';
    
    // 检查是否包含Markdown特征
    const hasMarkdownHeaders = /^#+\s+/m.test(content);
    const hasMarkdownLists = /^\s*[\-\*\+]\s+/m.test(content);
    const hasMarkdownTables = /\|.*\|.*\n\|/.test(content);
    const hasMarkdownCodeBlocks = /```[\s\S]*?```/.test(content);
    
    if (hasMarkdownHeaders || hasMarkdownLists || hasMarkdownTables || hasMarkdownCodeBlocks) {
        return 'markdown';
    }
    
    // 检查是否包含HTML标签
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);
    if (hasHtmlTags) {
        return 'html';
    }
    
    return 'plain';
};

// 格式化Markdown内容
const formatMarkdownContent = (content) => {
    // 配置marked选项
    marked.setOptions({
        breaks: true, // 将换行符转换为<br>
        gfm: true,    // 使用GitHub风格的Markdown
        headerIds: false, // 不生成标题ID
        mangle: false,    // 不转义标题
        silent: false,    // 不静默失败
        
        // 自定义渲染器，减少空行
        renderer: new marked.Renderer({
            // 重写段落渲染，减少空行
            paragraph(text) {
                // 去除段落文本前后的空白
                const trimmedText = text.trim();
                if (!trimmedText) return ''; // 空段落不渲染
                return `<p>${trimmedText}</p>`;
            },
            
            // 重写列表项渲染
            listitem(text) {
                const trimmedText = text.trim();
                if (!trimmedText) return '';
                return `<li>${trimmedText}</li>`;
            },
            
            // 重写代码块渲染
            code(code, language) {
                if (!code.trim()) return '';
                const langClass = language ? ` class="language-${language}"` : '';
                return `<pre><code${langClass}>${code}</code></pre>`;
            },
            
            // 重写表格渲染
            table(header, body) {
                if (!body) return '';
                return `<table class="report-table"><thead>${header}</thead><tbody>${body}</tbody></table>`;
            }
        })
    });
    
    // 预处理内容：减少连续空行
    const cleanedContent = cleanContent(content);
    
    // 使用marked解析markdown
    const rawHtml = marked.parse(cleanedContent);
    
    // 使用DOMPurify清理HTML以防止XSS攻击
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    
    // 后处理HTML：移除多余的空段落和空白
    return postProcessHtml(cleanHtml);
};

// 格式化报告内容（用于显示）
const formatReportContent = (content) => {
    if (!content) return '<p>暂无报告内容</p>';
    
    const contentType = detectContentType(content);
    
    try {
        switch (contentType) {
            case 'markdown':
                // 使用优化后的Markdown解析
                return formatMarkdownContent(content);
            case 'html':
                // 直接清理HTML
                return DOMPurify.sanitize(content);
            default:
                // 纯文本处理
                const cleanedText = cleanContent(content);
                return `<pre class="report-plain-text">${cleanedText}</pre>`;
        }
    } catch (error) {
        console.error('格式化报告内容错误:', error);
        // 如果解析失败，直接显示纯文本（清理多余空行）
        const cleanedText = cleanContent(content);
        return `<pre class="report-plain-text">${cleanedText}</pre>`;
    }
};

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return '未知时间';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMinutes < 1) {
            return '刚刚';
        }
        if (diffMinutes < 60) {
            return `${diffMinutes}分钟前`;
        }
        if (diffHours < 24) {
            return `${diffHours}小时前`;
        }
        if (diffDays < 7) {
            return `${diffDays}天前`;
        }
        
        // 超过一周显示具体日期
        return date.toLocaleDateString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        console.error('日期格式化错误:', e);
        return dateString;
    }
};

// 格式化详细日期
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

// 获取报告状态标签类型
const getReportStatusType = (report) => {
    try {
        const createTime = new Date(report.createdAt || report.createTime);
        const now = new Date();
        const diffMs = now - createTime;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays < 1) return 'success'; // 今天
        if (diffDays < 3) return 'warning'; // 3天内
        return 'info'; // 更早
    } catch (e) {
        return 'info';
    }
};

// 获取报告状态文本
const getReportStatusText = (report) => {
    try {
        const createTime = new Date(report.createdAt || report.createTime);
        const now = new Date();
        const diffMs = now - createTime;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMinutes < 1) return '刚刚';
        if (diffMinutes < 60) return `${diffMinutes}分钟前`;
        if (diffHours < 24) return `${diffHours}小时前`;
        return `${diffDays}天前`;
    } catch (e) {
        return '未知时间';
    }
};

// 查看报告详情
const viewReport = async (report) => {
    try {
        console.log('查看报告详情:', report);
        
        // 先显示已有的报告内容
        activeReport.value = {
            ...report,
            formattedDate: formatDetailedDate(report.createdAt || report.createTime),
            contentLength: report.wordCount || calculateWordCount(report.content || report.report || '')
        };
        showReportDetail.value = true;
        
        // 如果没有内容，尝试从API获取详细内容
        if (!report.content && !report.report && report.id) {
            try {
                console.log('从API获取报告详情，报告ID:', report.id);
                const response = await getHealthReport(report.id);
                console.log('获取报告详情API响应:', response);
                
                // 修改这里：正确处理API响应结构
                if (response && response.code === 200) {
                    // API返回的是 {code, message, data}
                    const reportData = response.data || {};
                    
                    // 计算字数
                    const content = reportData.report || reportData.content || '';
                    const wordCount = calculateWordCount(content);
                    
                    // 更新弹窗中的报告内容
                    activeReport.value = {
                        ...activeReport.value,
                        content: content,
                        report: content,
                        contentLength: wordCount
                    };
                } else if (response.report || response.content) {
                    // 如果API直接返回报告数据（兼容其他格式）
                    const content = response.report || response.content || '';
                    const wordCount = calculateWordCount(content);
                    
                    activeReport.value = {
                        ...activeReport.value,
                        content: content,
                        report: content,
                        contentLength: wordCount
                    };
                }
            } catch (apiError) {
                console.error('从API获取报告详情失败:', apiError);
                // 不显示错误信息，保留已有的基本信息
            }
        }
    } catch (error) {
        console.error('查看报告错误:', error);
        ElMessage.error('获取报告详情失败');
    }
};

// 关闭报告详情
const closeReportDetail = () => {
    showReportDetail.value = false;
    activeReport.value = null;
};

// 下载报告
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

// 删除报告
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
                customClass: 'delete-confirm-dialog'
            }
        );
        
        deletingReportId.value = reportId;
        await deleteHealthReport(reportId);
        
        // 从本地列表中移除
        reports.value = reports.value.filter(r => r.id !== reportId);
        
        // 如果删除的是当前查看的报告，关闭详情
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

// 监听userId变化
watch(() => props.userId, (newUserId) => {
    console.log('用户ID变化:', newUserId);
    if (newUserId) {
        fetchReports();
    } else {
        reports.value = [];
    }
}, { immediate: true });

// 组件挂载时也获取一次
onMounted(() => {
    console.log('HealthReportList组件挂载，用户ID:', props.userId);
    if (props.userId) {
        fetchReports();
    }
});

// 暴露方法给父组件
defineExpose({
    fetchReports
});
</script>

<template>
    <div class="health-report-list">
        <!-- 头部 -->
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

        <!-- 未登录提示 -->
        <div v-if="!userId" class="no-user-prompt">
            <div class="prompt-icon">
                <el-icon><InfoFilled /></el-icon>
            </div>
            <p>请先登录以查看健康报告档案</p>
        </div>

        <!-- 报告列表 -->
        <div v-else class="report-content">
            <div class="list-header">
                <div class="list-title">
                    <el-icon><Document /></el-icon>
                    <span>历史报告 ({{ totalReports }})</span>
                </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="isLoading" class="loading-state">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>加载报告中...</p>
            </div>

            <!-- 空状态 -->
            <div v-else-if="reports.length === 0" class="empty-state">
                <div class="empty-icon">
                    <el-icon><Document /></el-icon>
                </div>
                <h4>暂无健康报告</h4>
                <p>在上方点击"生成健康报告"按钮创建第一份报告</p>
                <p class="debug-info" v-if="process.env.NODE_ENV === 'development'">
                    用户ID: {{ userId }}
                </p>
            </div>

            <!-- 报告列表 -->
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
                                        {{ getReportStatusText(report) }}
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

        <!-- 报告详情弹窗 -->
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
                        <span>
                            <el-icon><Document /></el-icon>
                            字数统计: {{ activeReport?.contentLength || 0 }}字
                        </span>
                    </div>
                </div>
                
                <el-scrollbar height="400px" class="detail-scroll">
                    <div 
                        class="detail-body" 
                        v-html="formatReportContent(activeReport?.content || activeReport?.report)" 
                    ></div>
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

/* 头部区域 */
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
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
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

/* 未登录提示 */
.no-user-prompt {
    text-align: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 247, 255, 0.9));
    border-radius: 12px;
    border: 1px dashed rgba(59, 130, 246, 0.3);
    margin-top: 20px;
}

.prompt-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 16px;
    color: rgba(59, 130, 246, 0.4);
}

.prompt-icon .el-icon {
    font-size: 32px;
}

.no-user-prompt p {
    color: #64748b;
    font-size: 13px;
    margin: 0;
}

/* 报告内容区域 */
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
    color: #3b82f6;
}

/* 加载状态 */
.loading-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #3b82f6;
}

.loading-icon {
    font-size: 24px;
    margin-bottom: 8px;
    animation: spin 1s linear infinite;
}

.loading-state p {
    color: #64748b;
    font-size: 13px;
    margin: 0;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* 空状态 */
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
    color: rgba(59, 130, 246, 0.3);
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

.debug-info {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 8px;
    font-family: monospace;
}

/* 报告滚动区域 */
.report-scroll {
    flex: 1;
}

.report-items {
    padding: 4px 2px 4px 0;
}

/* 报告项 */
.report-item {
    background: white;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
    margin-bottom: 10px;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
}

.report-item:hover {
    border-color: #bfdbfe;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
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
    background: linear-gradient(135deg, #e0f2ff, #dbeafe);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(59, 130, 246, 0.1);
    flex-shrink: 0;
}

.report-icon .el-icon {
    font-size: 18px;
    color: #3b82f6;
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

/* 报告操作按钮 */
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

/* 响应式设计 */
@media (max-width: 768px) {
    .health-report-list {
        padding: 12px;
    }
    
    .header-section {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }
    
    .title-container {
        justify-content: center;
    }
    
    .report-item {
        padding: 12px;
    }
    
    .report-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
    
    .report-status {
        align-self: flex-start;
    }
    
    .report-actions {
        flex-wrap: wrap;
    }
}
</style>

<style>
/* 报告详情弹窗样式 */
.report-detail-dialog .el-dialog__header {
    background: linear-gradient(135deg, #eff6ff, #f0f9ff);
    border-radius: 12px 12px 0 0;
    padding: 16px 20px;
    margin-right: 0;
}

.report-detail-dialog .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    color: #1e3a8a;
}

.report-detail-dialog .el-dialog__body {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
}

/* 报告内容样式优化 */
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

.detail-meta .el-icon {
    font-size: 12px;
}

.detail-scroll {
    margin: 16px 0;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
}

.detail-body {
    padding: 20px;
    font-size: 13px;
    line-height: 1.7;
    color: #1f2937;
    max-height: 50vh;
    overflow-y: auto;
}

/* 段落间距优化 */
.detail-body p {
    margin: 0.8em 0;
    min-height: 1em; /* 确保段落有最小高度 */
}

.detail-body p:empty {
    display: none; /* 隐藏空段落 */
}

/* 标题间距优化 */
.detail-body h1,
.detail-body h2,
.detail-body h3,
.detail-body h4,
.detail-body h5,
.detail-body h6 {
    margin-top: 1.2em;
    margin-bottom: 0.6em;
    font-weight: 600;
    color: #1e3a8a;
}

/* 列表样式优化 */
.detail-body ul,
.detail-body ol {
    margin: 0.6em 0;
    padding-left: 1.8em;
}

.detail-body li {
    margin: 0.4em 0;
    line-height: 1.6;
}

/* 代码块样式 */
.detail-body pre {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
    overflow-x: auto;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.9em;
    margin: 0.8em 0;
}

.detail-body code:not(pre code) {
    background-color: #e2e8f0;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.9em;
}

/* 表格样式优化 */
.detail-body .report-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    font-size: 0.95em;
}

.detail-body .report-table th,
.detail-body .report-table td {
    border: 1px solid #e2e8f0;
    padding: 8px 12px;
    text-align: left;
    vertical-align: top;
}

.detail-body .report-table th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #334155;
}

.detail-body .report-table tr:nth-child(even) {
    background-color: #f8fafc;
}

/* 引用块样式 */
.detail-body blockquote {
    border-left: 4px solid #3b82f6;
    padding: 0.8em 1.2em;
    margin: 1em 0;
    color: #475569;
    font-style: italic;
    background-color: rgba(59, 130, 246, 0.05);
    border-radius: 0 6px 6px 0;
}

/* 水平线样式 */
.detail-body hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 1.5em 0;
}

/* 图片样式 */
.detail-body img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 1em 0;
}

/* 纯文本模式（当markdown解析失败时） */
.report-plain-text {
    white-space: pre-wrap;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
    line-height: 1.6;
    font-size: 12px;
    color: #334155;
    background: #f8fafc;
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    max-height: 400px;
    overflow-y: auto;
}

.detail-footer {
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

/* 删除确认对话框 */
.delete-confirm-dialog .el-message-box__title {
    color: #dc2626;
}

.delete-confirm-dialog .el-message-box__message {
    color: #475569;
    line-height: 1.5;
}

.delete-confirm-dialog .el-button--primary {
    background-color: #dc2626;
    border-color: #dc2626;
}

.delete-confirm-dialog .el-button--primary:hover {
    background-color: #b91c1c;
    border-color: #b91c1c;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .report-detail-dialog {
        width: 90% !important;
        margin-top: 10vh !important;
    }
    
    .report-detail-dialog .el-dialog__header {
        padding: 12px 16px;
    }
    
    .report-detail-dialog .el-dialog__body {
        padding: 16px;
    }
    
    .detail-meta {
        flex-direction: column;
        gap: 8px;
    }
    
    .detail-body {
        font-size: 12px;
        line-height: 1.6;
        padding: 12px;
    }
    
    .detail-body .report-table {
        font-size: 0.9em;
    }
    
    .detail-body .report-table th,
    .detail-body .report-table td {
        padding: 6px 8px;
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