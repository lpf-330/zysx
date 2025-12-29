<script setup>
import { ref, onBeforeUnmount, nextTick } from 'vue';
import { streamQuery, updateHistory, cleanHistory } from '../api/medicalQA';
import { generateHealthReport as apiGenerateHealthReport } from '../api/healthReport'; // 1. 引入健康报告API
import QueryItem from '../components/QueryItem.vue';
import AnswerItem from '../components/AnswerItem.vue';
import HealthReportItem from '../components/HealthReportItem.vue'; // 2. 引入健康报告组件
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';

const userInfoStore = storeToRefs(useUserInfoStore());
const user_id = userInfoStore.user_id.value;

const query = ref('');
const QAList = ref([]);
const sessionId = ref('');
const isStreaming = ref(false);
const chatScrollRef = ref();

// 3. 新增：存储当前生成的报告和加载状态
const currentReport = ref('');
const isGeneratingReport = ref(false);
const healthReportRef = ref(); // 用于滚动到健康报告区域

const scrollToBottom = async (targetRef = null) => {
    await nextTick();
    const scrollTarget = targetRef || chatScrollRef.value;
    if (scrollTarget) {
        const scrollElement = scrollTarget.$el ? scrollTarget.$el.querySelector('.el-scrollbar__wrap') : scrollTarget.querySelector('.el-scrollbar__wrap');
        if (scrollElement) {
            scrollElement.scrollTo({
                top: scrollElement.scrollHeight,
                behavior: 'smooth'
            });
        }
    }
};

const postQuery = async () => {
    if (!query.value.trim() || isStreaming.value) {
        if (query.value.trim() === '') {
            alert('请输入问题');
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
        const { reader } = await streamQuery(user_id, sessionId.value, question);
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
                    const dataContentStr = rawLine.substring(5).trim();
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
    } finally {
        isStreaming.value = false;
        scrollToBottom();
    }
};

const handleCleanHistory = async () => {
    try {
        if (!sessionId.value && QAList.value.length === 0 && !currentReport.value) return;
        await cleanHistory(sessionId.value);
        QAList.value = [];
        sessionId.value = '';
        currentReport.value = ''; // 清空健康报告
        console.log('History cleaned successfully');
    } catch (error) {
        console.error('Error cleaning history:', error);
    }
};

// 4. 新增：生成健康报告的函数
const generateReport = async () => {
    if (isGeneratingReport.value || !user_id) return;
    isGeneratingReport.value = true;
    currentReport.value = '正在生成健康报告...'; // 5. 先显示加载提示

    try {
        console.log('Sending request to generate health report for user:', user_id);
        const { reader } = await apiGenerateHealthReport(user_id);

        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let accumulatedReport = '正在生成健康报告...\n'; // 初始化内容包含加载提示

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
                                currentReport.value = accumulatedReport; // 6. 实时更新显示
                            }
                        } catch (e) {
                            // 如果不是JSON，可能是直接内容
                            accumulatedReport += dataContent + '\n';
                            currentReport.value = accumulatedReport;
                        }
                    }
                }
            }
        }

        // 处理剩余buffer
        if (buffer.trim()) {
            accumulatedReport += buffer;
            currentReport.value = accumulatedReport;
        }

        if (!accumulatedReport.trim() || accumulatedReport.trim() === '正在生成健康报告...') {
            throw new Error('生成的报告内容为空');
        }

        console.log('Health report generated successfully');

    } catch (error) {
        console.error('Error generating health report:', error);
        currentReport.value = `生成报告时发生错误: ${error.message || '未知错误'}\n\n请稍后重试。`;
    } finally {
        isGeneratingReport.value = false;
        await nextTick(); // 确保DOM更新
        scrollToBottom(healthReportRef.value); // 滚动到健康报告区域
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
                    <span class="subtitle">基于 AI 的智能健康问答 · 仅作健康科普参考</span>
                </div>
            </div>
            <div class="header-right">
                <!-- 7. 添加生成健康报告按钮 -->
                <el-button
                    type="primary"
                    plain
                    size="small"
                    class="report-btn"
                    :disabled="isGeneratingReport"
                    @click="generateReport"
                >
                    {{ isGeneratingReport ? '生成中...' : '生成健康报告' }}
                </el-button>
                <el-button
                    type="danger"
                    plain
                    size="small"
                    class="clear-btn"
                    :disabled="QAList.length === 0 && !currentReport"
                    @click="handleCleanHistory"
                >
                    清空对话
                </el-button>
            </div>
        </el-header>

        <el-main class="main">
            <el-scrollbar ref="chatScrollRef" height="100%" class="chat-scroll">
                <div v-if="QAList.length === 0 && !currentReport" class="empty-tip">
                    <div class="empty-icon">💬</div>
                    <div class="empty-title">开始一次新的咨询</div>
                    <div class="empty-desc">
                        请简要描述您的症状、既往病史或当前用药情况，我将为您提供专业的健康科普建议。
                    </div>
                </div>
                <div v-else>
                    <!-- 8. 显示健康报告 -->
                    <div v-if="currentReport" ref="healthReportRef" class="report-wrapper">
                        <HealthReportItem :report="currentReport" />
                    </div>
                    <div v-for="(data, index) in QAList" :key="`qa-${index}`">
                        <div v-if="data.role === 'user'">
                            <QueryItem :query="data.query" />
                        </div>
                        <div v-if="data.role === 'assistant'">
                            <AnswerItem
                                :answer="data.answer || (data.isStreaming ? '正在为您分析，请稍候…' : '')"
                            />
                        </div>
                    </div>
                </div>
            </el-scrollbar>
        </el-main>

        <el-footer class="footer">
            <div class="footer-top">
                <span class="input-tip">
                    温馨提示：本助手不替代线下就医，如有严重不适请及时前往正规医疗机构。
                </span>
                <span class="status-text" v-if="isStreaming">正在生成回答…</span>
                <span class="status-text" v-else-if="isGeneratingReport">正在生成健康报告…</span>
            </div>
            <div class="footer-main">
                <el-scrollbar class="inputBoxMain" max-height="3.2rem">
                    <el-input
                        class="inputArea"
                        v-model="query"
                        type="textarea"
                        placeholder="请描述您的症状、持续时间、年龄、既往疾病或用药情况…"
                        :rows="1"
                        autosize
                        @keyup.enter.exact.prevent="postQuery"
                        :disabled="isStreaming || isGeneratingReport"
                    />
                </el-scrollbar>
                <div class="inputBoxFooter">
                    <el-button
                        class="send-btn"
                        type="primary"
                        circle
                        :disabled="query === '' || isStreaming || isGeneratingReport"
                        @click="postQuery"
                    >
                        <span class="iconfont icon-tijiaoxinxi"></span>
                    </el-button>
                </div>
            </div>
        </el-footer>
    </el-container>
</template>

<style scoped>
.container {
    height: 100vh;
    width: 87%;
    background: radial-gradient(circle at top left, #e0f2ff 0%, #f5f7fb 40%, #f9fbff 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
}

.header {
    width: 100%;
    max-width: 7.5rem;
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
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #eff6ff;
    margin-right: 12px;
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
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
    gap: 8px; /* 添加按钮间距 */
}

.clear-btn, .report-btn { /* 统一按钮样式 */
    border-radius: 16px;
    font-size: 12px;
}

/* 保持 report-btn 为 primary 蓝色风格 */
.report-btn {
    --el-button-bg-color: var(--el-color-primary-light-9);
    --el-button-border-color: var(--el-color-primary-light-5);
    --el-button-text-color: var(--el-color-primary);
    --el-button-hover-bg-color: var(--el-color-primary-light-8);
    --el-button-hover-border-color: var(--el-color-primary);
    --el-button-hover-text-color: var(--el-color-primary);
    --el-button-active-bg-color: var(--el-color-primary-light-9);
    --el-button-active-border-color: var(--el-color-primary);
    --el-button-active-text-color: var(--el-color-primary);
}

.main {
    width: 92.5%;
    max-width: 7.5rem;
    flex: 1;
    margin-top: 12px;
    margin-bottom: 100px;
    padding: 0;
    box-sizing: border-box;
}

.chat-scroll {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 18px;
    padding: 16px 8px 24px 8px;
}

/* 9. 添加健康报告容器的样式 */
.report-wrapper {
    margin-bottom: 16px;
}

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

.footer {
    width: 100%;
    max-width: 7.7rem;
    position: fixed;
    bottom: 0.22rem;
    margin-left: 7.7rem;
    transform: translateX(-50%);
    padding: 0 16px;
    box-sizing: border-box;
    background: transparent;
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
    color: #3b82f6;
}

.footer-main {
    background: rgba(255, 255, 255, 0.98);
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
    padding: 10px 12px 10px 14px;
    display: flex;
    align-items: flex-end;
}

.inputBoxMain {
    flex: 1;
    margin-right: 10px;
}

.inputBoxFooter {
    display: flex;
    align-items: flex-end;
}

.send-btn {
    width: 36px;
    height: 36px;
    box-shadow: 0 6px 14px rgba(37, 99, 235, 0.35);
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

@media (max-width: 768px) {
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

    .clear-btn, .report-btn {
        font-size: 11px;
        padding: 5px 10px;
    }

    .chat-scroll {
        border-radius: 14px;
        padding: 10px 6px 20px 6px;
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