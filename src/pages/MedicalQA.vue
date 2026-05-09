<script setup>
import { ref, onBeforeUnmount, nextTick, computed } from 'vue';
import { streamQuery, updateHistory, cleanHistory } from '../api/medicalQA';
import { generateHealthReport as apiGenerateHealthReport, saveHealthReport } from '../api/healthReport';
import QueryItem from '../components/QueryItem.vue';
import AnswerItem from '../components/AnswerItem.vue';
import HealthReportItem from '../components/HealthReportItem.vue';
import HealthReportList from '../components/HealthReportList.vue'; // 导入新组件
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';

const userInfoStore = storeToRefs(useUserInfoStore());
const user_id = computed(() => userInfoStore.user_id.value);

const query = ref('');
const QAList = ref([]);
const sessionId = ref('');
const isStreaming = ref(false);
const chatScrollRef = ref();

const isGeneratingReport = ref(false);
const healthReportListRef = ref();
const isBusy = computed(() => isStreaming.value || isGeneratingReport.value);

const scrollToBottom = async () => {
    await nextTick();
    if (chatScrollRef.value) {
        chatScrollRef.value.$el.querySelector('.el-scrollbar__wrap').scrollTo({
            top: chatScrollRef.value.$el.querySelector('.el-scrollbar__wrap').scrollHeight,
            behavior: 'smooth'
        });
    }
};

// 修改：只要有用户ID且不在生成过程中就可以生成报告
const canGenerateReport = computed(() => {
    return user_id.value && !isBusy.value;
});

const postQuery = async () => {
    if (!query.value.trim() || isBusy.value) {
        if (isBusy.value) {
            ElMessage.warning('请等待当前请求完成后再发送');
        } else if (query.value.trim() === '') {
            ElMessage.warning('请输入问题');
        }
        return;
    }
    const question = query.value.trim();
    query.value = '';

    QAList.value.push({
        role: 'user',
        query: question,
        answer: '',
        isStreaming: false
    });

    QAList.value.push({
        role: 'assistant',
        query: '',
        answer: '',
        isStreaming: true
    });

    isStreaming.value = true;
    scrollToBottom();

    try {
        const { reader } = await streamQuery(user_id.value, sessionId.value, question);
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulatedAnswer = '';
        const assistantIndex = QAList.value.length - 1;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            let lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const rawLine of lines) {
                if (rawLine.startsWith('data:')) {
                    const dataContentStr = rawLine.substring('data:'.length).trim();
                    if (dataContentStr && dataContentStr !== '[DONE]') {
                        try {
                            const sseData = JSON.parse(dataContentStr);
                            if (sessionId.value === '' && sseData.sessionId) {
                                sessionId.value = sseData.sessionId;
                            }
                            if (sseData.answer) {
                                const content = sseData.answer;
                                accumulatedAnswer += content;
                                if (QAList.value[assistantIndex]) {
                                    QAList.value[assistantIndex].answer = accumulatedAnswer;
                                    scrollToBottom();
                                }
                            }
                            if (sseData.done === "true") {
                                if (QAList.value[assistantIndex]) {
                                    QAList.value[assistantIndex].isStreaming = false;
                                }
                            }
                        } catch (e) {
                            console.error('Error parsing SSE JSON: ', e, 'Data:', dataContentStr);
                        }
                    } else if (dataContentStr === '[DONE]') {
                        if (QAList.value[assistantIndex]) {
                            QAList.value[assistantIndex].isStreaming = false;
                        }
                    }
                }
            }
        }

        if (buffer.trim() !== '') {
            console.warn("Unexpected remaining buffer:", buffer);
        }

        if (accumulatedAnswer) {
            await updateHistory(sessionId.value, question, accumulatedAnswer);
            if (QAList.value[assistantIndex]) {
                QAList.value[assistantIndex].isStreaming = false;
            }
        } else {
            if (QAList.value[assistantIndex]) {
                QAList.value[assistantIndex].answer = '很抱歉没能听懂您的问题，请尝试更具体地描述症状或问题。';
                QAList.value[assistantIndex].isStreaming = false;
            }
        }
    } catch (error) {
        console.error('Error during streaming:', error);
        const errorIndex = QAList.value.length - 1;
        if (QAList.value[errorIndex]) {
            QAList.value[errorIndex].answer = `出现错误，请稍后重试：${error.message}`;
            QAList.value[errorIndex].isStreaming = false;
        }
        ElMessage.error(`请求失败: ${error.message}`);
    } finally {
        isStreaming.value = false;
        scrollToBottom();
    }
};

const generateReport = async () => {
    if (!canGenerateReport.value) {
        if (!user_id.value) {
            ElMessage.warning('请先登录后再生成健康报告');
        }
        return;
    }

    isGeneratingReport.value = true;

    // 在对话区域显示健康报告
    QAList.value.push({
        role: 'report',
        query: '',
        answer: '',
        isGenerating: true
    });

    scrollToBottom();

    try {
        const { reader } = await apiGenerateHealthReport(user_id.value);
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let accumulatedReport = '';
        const reportIndex = QAList.value.length - 1;

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
                            if (parsedData.answer || parsedData.report) {
                                const content = parsedData.answer || parsedData.report;
                                accumulatedReport += content;
                                if (QAList.value[reportIndex]) {
                                    QAList.value[reportIndex].answer = accumulatedReport;
                                    scrollToBottom();
                                }
                            }
                        } catch (e) {
                            if (dataContent !== '[DONE]') {
                                accumulatedReport += dataContent + '\n';
                                if (QAList.value[reportIndex]) {
                                    QAList.value[reportIndex].answer = accumulatedReport;
                                    scrollToBottom();
                                }
                            }
                        }
                    } else if (dataContent === '[DONE]') {
                        if (QAList.value[reportIndex]) {
                            QAList.value[reportIndex].isGenerating = false;
                        }
                    }
                }
            }
        }

        if (buffer.trim() && buffer.trim() !== '[DONE]') {
            accumulatedReport += buffer;
            if (QAList.value[reportIndex]) {
                QAList.value[reportIndex].answer = accumulatedReport;
            }
        }

        if (!accumulatedReport.trim()) {
            throw new Error('生成的报告内容为空');
        }

        if (QAList.value[reportIndex]) {
            QAList.value[reportIndex].isGenerating = false;
        }

        // 自动保存报告到数据库
        try {
            await saveHealthReport(user_id.value, accumulatedReport);
            ElMessage.success('健康报告生成并保存成功');
        } catch (saveError) {
            console.error('保存健康报告失败:', saveError);
            ElMessage.warning('健康报告生成成功，但保存到数据库失败');
        }

        // 生成报告后自动刷新右侧的报告列表
        if (healthReportListRef.value && healthReportListRef.value.fetchReports) {
            setTimeout(() => {
                healthReportListRef.value.fetchReports();
            }, 500);
        }

    } catch (error) {
        console.error('Error generating health report:', error);
        const errorIndex = QAList.value.length - 1;
        if (QAList.value[errorIndex]) {
            QAList.value[errorIndex].answer = `生成报告时出现错误：${error.message || '未知错误'}`;
            QAList.value[errorIndex].isGenerating = false;
        }
        ElMessage.error(`生成报告失败: ${error.message || '未知错误'}`);
    } finally {
        isGeneratingReport.value = false;
        scrollToBottom();
    }
};

const handleCleanHistory = async () => {
    try {
        if (!sessionId.value && QAList.value.length === 0) return;
        await cleanHistory(sessionId.value);
        QAList.value = [];
        sessionId.value = '';
        ElMessage.success('对话已清空');
    } catch (error) {
        console.error('Error cleaning history:', error);
        ElMessage.error('清空对话失败');
    }
};

onBeforeUnmount(() => {
    handleCleanHistory();
});
</script>

<template>
    <el-container class="container">
        <el-header class="header">
            <div class="header-left">
                <div class="logo-circle">
                    <span class="logo-cross">+</span>
                </div>
                <div class="title-area">
                    <span class="title">医疗咨询助手</span>
                    <span class="subtitle">基于 AI 的智能健咨询 · 仅作健康科普参考</span>
                </div>
            </div>
            <div class="header-right">
                <el-button type="primary" plain size="small" class="report-btn" :disabled="!canGenerateReport"
                    :loading="isGeneratingReport" @click="generateReport">
                    {{ isGeneratingReport ? '生成中...' : '生成健康报告' }}
                </el-button>
                <el-button type="danger" plain size="small" class="clear-btn" :disabled="QAList.length === 0"
                    @click="handleCleanHistory">
                    清空对话
                </el-button>
            </div>
        </el-header>

        <el-main class="main-container">
            <!-- 左侧对话区域 - 包含内容 + 底部输入框 -->
            <div class="chat-container">
                <div class="chat-wrapper">
                    <el-scrollbar ref="chatScrollRef" class="chat-scroll">
                        <div v-if="QAList.length === 0" class="empty-tip">
                            <div class="empty-icon">💬</div>
                            <div class="empty-title">开始一次新的咨询</div>
                            <div class="empty-desc">
                                请简要描述您的症状、既往病史或当前用药情况，我将为您提供专业的健康科普建议。
                                <div class="generate-report-hint">
                                    <el-icon>
                                        <InfoFilled />
                                    </el-icon>
                                    您也可以直接点击上方的"生成健康报告"按钮，获取个性化的健康评估。
                                </div>
                            </div>
                        </div>

                        <div v-else>
                            <div v-for="(data, index) in QAList" :key="`qa-${index}`">
                                <div v-if="data.role === 'user'">
                                    <query-item :query="data.query" />
                                </div>

                                <div v-if="data.role === 'assistant'">
                                    <answer-item :answer="data.answer || (data.isStreaming ? '正在为您分析，请稍候…' : '')" />
                                </div>

                                <div v-if="data.role === 'report'">
                                    <health-report-item :report="data.answer" :loading="data.isGenerating" />
                                </div>
                            </div>
                        </div>
                    </el-scrollbar>

                    <!-- 输入框在咨询框内部底部 -->
                    <div class="input-wrapper">
                        <div class="footer-top">
                            <span class="input-tip">
                                温馨提示：本助手不替代线下就医，如有严重不适请及时前往正规医疗机构。
                            </span>
                            <span class="status-text" v-if="isBusy">{{ isStreaming ? '正在生成回答…' : '正在生成健康报告…' }}</span>
                        </div>
                        <div class="footer-main">
                            <el-scrollbar class="inputBoxMain" max-height="3.2rem">
                                <el-input class="inputArea" v-model="query" type="textarea"
                                    placeholder="请描述您的症状、持续时间、年龄、既往疾病或用药情况…" :rows="1" autosize
                                    @keyup.enter.exact.prevent="postQuery" :disabled="isBusy" />
                            </el-scrollbar>
                            <div class="inputBoxFooter">
                                <el-button class="send-btn" type="primary" circle :disabled="query === '' || isBusy"
                                    @click="postQuery">
                                    <span class="iconfont icon-tijiaoxinxi"></span>
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧健康报告列表区域 -->
            <div class="report-sidebar">
                <health-report-list ref="healthReportListRef" :user-id="user_id" />
            </div>
        </el-main>
    </el-container>
</template>

<style scoped>
/* 整体容器：居中 + 渐变背景 */
.container {
    height: 100%;
    width: 80%;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #f0f7f0 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    padding: 0 1%;
}

/* 头部区域 */
.header {
    width: 100%;
    max-width: 1400px;
    height: 72px;
    padding: 0 24px;
    margin-top: 12px;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 18px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.header-left {
    display: flex;
    align-items: center;
}

.logo-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2D572D, #81C784);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #eff6ff;
    margin-right: 12px;
    box-shadow: 0 6px 16px rgba(45, 87, 45, 0.4);
}

.logo-cross {
    margin-bottom: 0.025rem;
    font-size: 22px;
    font-weight: 700;
}

.title-area {
    display: flex;
    flex-direction: column;
}

.title {
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
    letter-spacing: 0.02em;
}

.subtitle {
    font-size: 12px;
    color: #64748b;
    margin-top: 2px;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 8px;
}

.report-btn,
.clear-btn {
    border-radius: 16px;
    font-size: 12px;
    min-width: 100px;
}

/* 主体容器：左右布局 */
.main-container {
    width: 100%;
    max-width: 1400px;
    flex: 1;
    margin-top: 12px;
    margin-bottom: 12px;
    padding: 0;
    box-sizing: border-box;
    display: flex;
    gap: 16px;
    min-height: 0;
}

/* 左侧对话容器 */
.chat-container {
    flex: 3;
    min-width: 0;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 18px;
    box-shadow: 0 8px 25px rgba(15, 23, 42, 0.08);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    padding-bottom: 8px;
}

/* 对话包装器 - 滚动内容 + 底部输入 */
.chat-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1;
}

.chat-scroll {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 16px 8px 24px 8px;
    min-height: 0;
    padding-bottom: 24px;
}

/* 右侧报告列表容器 */
.report-sidebar {
    flex: 1;
    min-width: 320px;
    max-width: 380px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 18px;
    box-shadow: 0 8px 25px rgba(15, 23, 42, 0.08);
    overflow: hidden;
}

/* 隐藏所有元素滚动条 */
:deep(.el-scrollbar__bar.is-vertical) {
    display: none !important;
}

/* 隐藏右侧容器外滚动条 */
:deep(.el-main) {
    overflow-y: hidden;
}

.chat-scroll {
    padding: 16px 8px 24px 8px;
    height: 100%;
}

/* 空状态提示 */
.empty-tip {
    width: 100%;
    min-height: 240px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #64748b;
    text-align: center;
}

.empty-icon {
    font-size: 32px;
    margin-bottom: 12px;
}

.empty-title {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 6px;
}

.empty-desc {
    font-size: 13px;
    max-width: 80%;
    line-height: 1.6;
}

.generate-report-hint {
    margin-top: 16px;
    padding: 10px 16px;
    background: linear-gradient(135deg, rgba(45, 87, 45, 0.1), rgba(45, 87, 45, 0.05));
    border-radius: 12px;
    border: 1px solid rgba(45, 87, 45, 0.2);
    font-size: 12px;
    color: #2D572D;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 432px;
}

.generate-report-hint .el-icon {
    font-size: 14px;
    flex-shrink: 0;
}

/* 输入区域 - 在聊天框内部底部 */
.input-wrapper {
    flex: 0 0 auto;
    padding: 8px 12px 10px 12px;
    border-top: 1px solid #f0f0f0;
    background: rgba(248, 250, 248, 0.95);
}

.footer-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    padding: 0 4px;
}

.input-tip {
    font-size: 11px;
    color: #94a3b8;
}

.status-text {
    font-size: 11px;
    color: #2D572D;
}

.footer-main {
    background: rgba(255, 255, 255, 0.98);
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
    padding: 10px 12px 10px 18px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
}

.inputBoxMain {
    flex: 1;
    margin-right: 10px;
    max-width: 85%;
}

.inputBoxFooter {
    display: flex;
    align-items: flex-end;
}

.send-btn {
    width: 36px;
    height: 36px;
    box-shadow: 0 6px 14px rgba(45, 87, 45, 0.35);
    border: none;
}

:deep(.inputArea .el-textarea__inner) {
    background-color: transparent;
    border: none;
    padding: 4px 0;
    box-shadow: none !important;
    font-size: 13px;
    font-family: 'Microsoft YaHei', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    resize: none;
    border-radius: 0;
    line-height: 1.6;
}

:deep(.inputArea .el-textarea__inner:focus) {
    outline: none !important;
    box-shadow: none !important;
}

:deep(.el-scrollbar__bar.is-vertical) {
    width: 6px !important;
}

:deep(.el-scrollbar__bar.is-vertical > div) {
    background-color: rgba(148, 163, 184, 0.5) !important;
    border-radius: 3px !important;
}

:deep(.el-scrollbar__bar.is-horizontal) {
    height: 6px !important;
}

:deep(.el-scrollbar__bar.is-horizontal > div) {
    background-color: rgba(148, 163, 184, 0.5) !important;
    border-radius: 3px !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .container {
        width: 95%;
    }

    .main-container {
        flex-direction: column;
    }

    .report-sidebar {
        min-width: 100%;
        max-width: 100%;
        order: 1;
        margin-bottom: 16px;
    }

    .chat-container {
        order: 2;
    }
}

@media (max-width: 768px) {
    .container {
        width: 100%;
        padding: 0 8px;
    }

    .header {
        margin-top: 8px;
        padding: 0 14px;
        border-radius: 14px;
        height: 64px;
    }

    .title {
        font-size: 16px;
    }

    .subtitle {
        display: none;
    }

    .header-right {
        gap: 8px;
    }

    .report-btn,
    .clear-btn {
        min-width: auto;
        font-size: 11px;
        padding: 5px 10px;
    }

    .chat-container,
    .report-sidebar {
        border-radius: 14px;
    }

    .footer {
        padding: 0 12px;
        bottom: 10px;
    }

    .footer-main {
        border-radius: 14px;
        padding: 8px 10px;
    }

    .send-btn {
        width: 32px;
        height: 32px;
    }

    .empty-title {
        font-size: 15px;
    }

    .empty-desc {
        font-size: 12px;
        max-width: 90%;
    }
}
</style>