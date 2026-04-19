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

// 5. 生成健康报告
const generateHealthReport = async (userId) => {
    const GENERATE_URL = `${BASE_URL}/api/healthReport/generate`;
    
    try {
        console.log('发送生成报告请求，用户ID:', userId);
        
        const response = await fetch(`${GENERATE_URL}?userId=${userId}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream'
            }
        });

        console.log('生成报告响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            let errorMessage = `HTTP错误 ${response.status}`;
            try {
                const errorText = await response.text();
                if (errorText) {
                    errorMessage += `: ${errorText}`;
                }
            } catch (e) {
                console.error('无法读取错误响应:', e);
            }
            throw new Error(errorMessage);
        }

        if (!response.body) {
            throw new Error('响应体为空');
        }

        // 检查响应类型
        const contentType = response.headers.get('content-type') || '';
        console.log('响应类型:', contentType);
        
        return {
            response,
            reader: response.body.getReader()
        };
    } catch (error) {
        console.error('生成报告请求失败:', error);
        throw error;
    }
};

export {
    saveHealthReport,
    getHealthReportList,
    getHealthReport,
    deleteHealthReport,
    generateHealthReport
};