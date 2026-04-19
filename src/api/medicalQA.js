import { httpService } from "../utils/apiService"

const BASE_URL = 'http://localhost:8081'; // 后端基础地址

// 原有的查询接口
const userQuery = async (question) => {
    return (await httpService.post('/api/query', { question: question })).data
}

// 流式问答接口
const streamQuery = async (userId, sessionId, question) => {
    const QUERY_STREAM_ENDPOINT = `${BASE_URL}/api/query/stream`;
    
    const requestBody = JSON.stringify({
        userId: userId || 12345,
        sessionId: sessionId || '',
        question: question
    });

    const response = await fetch(QUERY_STREAM_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
        },
        body: requestBody,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
        throw new Error('Response body is empty');
    }

    return {
        response,
        reader: response.body.getReader()
    };
};

// 更新历史记录
const updateHistory = async (sessionId, question, answer) => {
    const UPDATE_HISTORY_ENDPOINT = `${BASE_URL}/api/query/history/update`;
    
    const response = await fetch(UPDATE_HISTORY_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sessionId: sessionId,
            question: question,
            answer: answer
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error during update-history! status: ${response.status}`);
    }

    return await response.text();
};

// 清空历史记录
const cleanHistory = async (sessionId) => {
    const CLEAN_HISTORY_ENDPOINT = `${BASE_URL}/api/query/history/clean`;
    
    const response = await fetch(CLEAN_HISTORY_ENDPOINT, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: sessionId
    });

    if (!response.ok) {
        throw new Error(`HTTP error during clean history! status: ${response.status}`);
    }

    return true;
};

export {
    userQuery,
    streamQuery,
    updateHistory,
    cleanHistory
}