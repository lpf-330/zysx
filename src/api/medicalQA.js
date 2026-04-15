import { httpService } from "../utils/apiService"

const userQuery = async (question) => {
    return (await httpService.post('/query', { question })).data
}

const streamQuery = async (userId, sessionId, question) => {
    const response = await httpService.post('/streamQuery', {
        userId,
        sessionId,
        question
    }, {
        responseType: 'stream'
    });

    const reader = response.data.getReader();
    return {
        reader,
        response
    };
};

const updateHistory = async (sessionId, question, answer) => {
    return (await httpService.post('/updateHistory', {
        sessionId,
        question,
        answer
    })).data;
};

const cleanHistory = async (sessionId) => {
    return (await httpService.post('/cleanHistory', {
        sessionId
    })).data;
};

const generateHealthReport = async (userId) => {
    const response = await httpService.post('/generateHealthReport', {
        userId
    }, {
        responseType: 'stream'
    });

    const reader = response.data.getReader();
    return {
        reader,
        response
    };
};

const saveHealthReport = async (userId, reportContent) => {
    return (await httpService.post('/saveHealthReport', {
        userId,
        reportContent
    })).data;
};

export {
    userQuery,
    streamQuery,
    updateHistory,
    cleanHistory,
    generateHealthReport,
    saveHealthReport
}