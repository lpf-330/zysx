import { httpService } from "../utils/apiService"

const BASE_URL = 'http://localhost:8081'; // 后端基础地址

const HEALTH_REPORT_BASE_URL = `${BASE_URL}/api/healthReport`;

// 1. 保存健康报告
const saveHealthReport = async (userId, report) => {
    const response = await httpService.post(`${HEALTH_REPORT_BASE_URL}/save`, {
        userId,
        report
    });
    return response.data; 
};

// 2. 获取健康报告列表
const getHealthReportList = async (userId) => {
    const response = await httpService.get(`${HEALTH_REPORT_BASE_URL}/list?userId=${userId}`);
    return response.data; 
};

// 3. 获取单个健康报告
const getHealthReport = async (healthReportId) => {
    const response = await httpService.get(`${HEALTH_REPORT_BASE_URL}?healthReportId=${healthReportId}`);
    return response.data; 
};

// 4. 删除健康报告
const deleteHealthReport = async (healthReportId) => {
    const response = await httpService.delete(`${HEALTH_REPORT_BASE_URL}?healthReportId=${healthReportId}`);
    return response.data;
};

// 5. 生成健康报告 (流式)
const generateHealthReport = async (userId) => {
    const GENERATE_URL = `${BASE_URL}/api/healthReport/generate`;
    const response = await fetch(`${GENERATE_URL}?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        throw new Error(`HTTP error during report generation! status: ${response.status}`);
    }

    if (!response.body) {
        throw new Error('Response body is empty during report generation');
    }

    return {
        response,
        reader: response.body.getReader()
    };
};

export{
    saveHealthReport,
    getHealthReportList,
    getHealthReport,
    deleteHealthReport,
    generateHealthReport
};