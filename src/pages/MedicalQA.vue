<script setup>
import { ref, onBeforeUnmount, nextTick } from 'vue'; // 1. 引入 nextTick
import { streamQuery, updateHistory, cleanHistory } from '../api/medicalQA';
import QueryItem from '../components/QueryItem.vue';
import AnswerItem from '../components/AnswerItem.vue';
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';

const userInfoStore = storeToRefs(useUserInfoStore());
const user_id = userInfoStore.user_id.value;
const query = ref('');
const QAList = ref([]);
const sessionId = ref('');
const isStreaming = ref(false);

// 2. 创建一个 ref 来引用滚动容器
const chatScrollRef = ref();

// 3. 创建一个滚动到底部的函数
const scrollToBottom = async () => {
    // nextTick 确保 DOM 更新完成后再执行滚动逻辑
    await nextTick();
    if (chatScrollRef.value) {
        chatScrollRef.value.$el.querySelector('.el-scrollbar__wrap').scrollTo({
            top: chatScrollRef.value.$el.querySelector('.el-scrollbar__wrap').scrollHeight,
            behavior: 'smooth' 
        });
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

    // 添加用户问题
    QAList.value.push({ 
        role: 'user', 
        query: question, 
        answer: '',
        isStreaming: false 
    });

    // 添加占位的 AI 回答项
    QAList.value.push({ 
        role: 'assistant', 
        query: '', 
        answer: '',
        isStreaming: true 
    });

    isStreaming.value = true;

    // 4. 在添加完新消息后，触发滚动
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
        // 5. 在 AI 回复完成后，再次确保滚动到底部
        scrollToBottom();
    }
};

const handleCleanHistory = async () => {
    try {
        if (!sessionId.value && QAList.value.length === 0) return;
        await cleanHistory(sessionId.value);
        QAList.value = [];
        sessionId.value = '';
        console.log('History cleaned successfully');
    } catch (error) {
        console.error('Error cleaning history:', error);
    }
};

onBeforeUnmount(() => {
    handleCleanHistory();
});
</script>

<template>
    <el-container class="container">
        <!-- 顶部：标题 + 清空按钮 -->
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
                <el-button 
                    type="danger" 
                    plain 
                    size="small" 
                    class="clear-btn"
                    :disabled="QAList.length === 0"
                    @click="handleCleanHistory"
                >
                    清空对话
                </el-button>
            </div>
        </el-header>

        <!-- 主体对话区域 -->
        <el-main class="main">
            <!-- 6. 为 el-scrollbar 添加 ref -->
            <el-scrollbar ref="chatScrollRef" height="100%" class="chat-scroll">
                <!-- 如果没有消息，显示一个空状态提示 -->
                <div v-if="QAList.length === 0" class="empty-tip">
                    <div class="empty-icon">💬</div>
                    <div class="empty-title">开始一次新的咨询</div>
                    <div class="empty-desc">
                        请简要描述您的症状、既往病史或当前用药情况，我将为您提供专业的健康科普建议。
                    </div>
                </div>

                <div v-else>
                    <div 
                        v-for="(data, index) in QAList" 
                        :key="index"
                    >
                        <!-- 用户问题 -->
                        <div v-if="data.role === 'user'">
                            <query-item :query="data.query" />
                        </div>
                        
                        <!-- AI回答 -->
                        <div v-if="data.role === 'assistant'">
                            <answer-item 
                                :answer="data.answer || (data.isStreaming ? '正在为您分析，请稍候…' : '')"
                            />
                        </div>
                    </div>
                </div>
            </el-scrollbar>
        </el-main>

        <!-- 底部输入区 -->
        <el-footer class="footer">
            <div class="footer-top">
                <span class="input-tip">
                    温馨提示：本助手不替代线下就医，如有严重不适请及时前往正规医疗机构。
                </span>
                <span class="status-text" v-if="isStreaming">正在生成回答…</span>
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
                        :disabled="isStreaming"
                    />
                </el-scrollbar>

                <div class="inputBoxFooter">
                    <el-button
                        class="send-btn"
                        type="primary"
                        circle
                        :disabled="query === '' || isStreaming"
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
/* 整体容器：居中 + 渐变背景 */
.container {
    height: 100vh;
    width: 87%;
    background: radial-gradient(circle at top left, #e0f2ff 0%, #f5f7fb 40%, #f9fbff 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
}

/* 头部区域 */
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
}

.clear-btn {
    border-radius: 16px;
    font-size: 12px;
}

/* 主体对话区域 */
.main {
    width: 92.5%;
    max-width: 7.5rem;
    flex: 1;
    margin-top: 12px;
    margin-bottom: 100px; /* 为底部输入区留出空间 */
    padding: 0;
    box-sizing: border-box;
}

.chat-scroll {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 18px;
    padding: 16px 8px 24px 8px;
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

/* 底部输入区域 */
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

/* 输入区滚动容器 */
.inputBoxMain {
    flex: 1;
    margin-right: 10px;
}

/* 发送按钮区域 */
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

/* 文本域样式重写 */
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

/* Element 滚动条美化 */
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

/* 响应式 */
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

    .clear-btn {
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