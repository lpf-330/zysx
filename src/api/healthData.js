import { wsService } from "../utils/apiService"
import { httpService } from "../utils/apiService"

const ensureWsConnected = (dataType, userId, timeout = 5000) => {
    return new Promise((resolve, reject) => {
        if (wsService.getStatus(dataType)) {
            resolve();
            return;
        }

        const timer = setTimeout(() => {
            reject(new Error(`${dataType} WebSocket连接超时`));
        }, timeout);

        const onOpen = (data) => {
            if (data.dataType === dataType) {
                clearTimeout(timer);
                resolve();
                wsService.off('open', onOpen);
                wsService.off('error', onError);
            }
        };

        const onError = (data) => {
            if (data.dataType === dataType) {
                clearTimeout(timer);
                reject(data.error);
                wsService.off('open', onOpen);
                wsService.off('error', onError);
            }
        };

        wsService.on('open', onOpen);
        wsService.on('error', onError);
        wsService.connect(dataType, userId);
    });
};

const getBloodData = async (user_id) => {
    await ensureWsConnected('blood', user_id);
    
    return new Promise((resolve, reject) => {
        const handleMessage = (data) => {
            if (data.dataType === 'blood') {
                wsService.off('message', handleMessage);
                resolve(data.data);
            }
        };
        
        const onError = (errorData) => {
            if (errorData.dataType === 'blood') {
                wsService.off('error', onError);
                reject(errorData.error);
            }
        };

        wsService.on('message', handleMessage);
        wsService.on('error', onError);
    });
}

const getHeartData = async (user_id) => {
    await ensureWsConnected('heart', user_id);
    
    return new Promise((resolve, reject) => {
        const handleMessage = (data) => {
            if (data.dataType === 'heart') {
                wsService.off('message', handleMessage);
                resolve(data.data);
            }
        };
        
        const onError = (errorData) => {
            if (errorData.dataType === 'heart') {
                wsService.off('error', onError);
                reject(errorData.error);
            }
        };

        wsService.on('message', handleMessage);
        wsService.on('error', onError);
    });
}

const getOxygenData = async (user_id) => {
    await ensureWsConnected('oxygen', user_id);
    
    return new Promise((resolve, reject) => {
        const handleMessage = (data) => {
            if (data.dataType === 'oxygen') {
                wsService.off('message', handleMessage);
                resolve(data.data);
            }
        };
        
        const onError = (errorData) => {
            if (errorData.dataType === 'oxygen') {
                wsService.off('error', onError);
                reject(errorData.error);
            }
        };

        wsService.on('message', handleMessage);
        wsService.on('error', onError);
    });
}

const getPiData = async (user_id) => {
    await ensureWsConnected('pi', user_id);
    
    return new Promise((resolve, reject) => {
        const handleMessage = (data) => {
            if (data.dataType === 'pi') {
                wsService.off('message', handleMessage);
                resolve(data.data);
            }
        };
        
        const onError = (errorData) => {
            if (errorData.dataType === 'pi') {
                wsService.off('error', onError);
                reject(errorData.error);
            }
        };

        wsService.on('message', handleMessage);
        wsService.on('error', onError);
    });
}

const getPreData = async (user_id) => {
    await ensureWsConnected('pre', user_id);
    
    return new Promise((resolve, reject) => {
        const handleMessage = (data) => {
            if (data.dataType === 'pre') {
                wsService.off('message', handleMessage);
                resolve(data.data);
            }
        };
        
        const onError = (errorData) => {
            if (errorData.dataType === 'pre') {
                wsService.off('error', onError);
                reject(errorData.error);
            }
        };

        wsService.on('message', handleMessage);
        wsService.on('error', onError);
    });
}

const getSlpData = async (user_id) => {
    await ensureWsConnected('slp', user_id);
    
    return new Promise((resolve, reject) => {
        const handleMessage = (data) => {
            if (data.dataType === 'slp') {
                wsService.off('message', handleMessage);
                resolve(data.data);
            }
        };
        
        const onError = (errorData) => {
            if (errorData.dataType === 'slp') {
                wsService.off('error', onError);
                reject(errorData.error);
            }
        };

        wsService.on('message', handleMessage);
        wsService.on('error', onError);
    });
}

// --- 新增：用于图表展示的聚合数据获取 (通过 HTTP POST) ---

// 血糖
const getBloodDataByDate = (userId, date) => httpService.post('/api/api/health-data-aggregated/blood-data-by-date', { userId, date });
const getBloodDataByWeek = (userId, dateInWeek) => httpService.post('/api/api/health-data-aggregated/blood-data-by-week', { userId, dateInWeek });
const getBloodDataByMonth = (userId, year, month) => httpService.post('/api/api/health-data-aggregated/blood-data-by-month', { userId, year, month });
const getBloodDataByYear = (userId, year) => httpService.post('/api/api/health-data-aggregated/blood-data-by-year', { userId, year });

// 心率
const getHeartDataByDate = (userId, date) => httpService.post('/api/api/health-data-aggregated/heart-data-by-date', { userId, date });
const getHeartDataByWeek = (userId, dateInWeek) => httpService.post('/api/api/health-data-aggregated/heart-data-by-week', { userId, dateInWeek });
const getHeartDataByMonth = (userId, year, month) => httpService.post('/api/api/health-data-aggregated/heart-data-by-month', { userId, year, month });
const getHeartDataByYear = (userId, year) => httpService.post('/api/api/health-data-aggregated/heart-data-by-year', { userId, year });

// 血氧
const getOxygenDataByDate = (userId, date) => httpService.post('/api/api/health-data-aggregated/oxygen-data-by-date', { userId, date });
const getOxygenDataByWeek = (userId, dateInWeek) => httpService.post('/api/api/health-data-aggregated/oxygen-data-by-week', { userId, dateInWeek });
const getOxygenDataByMonth = (userId, year, month) => httpService.post('/api/api/health-data-aggregated/oxygen-data-by-month', { userId, year, month });
const getOxygenDataByYear = (userId, year) => httpService.post('/api/api/health-data-aggregated/oxygen-data-by-year', { userId, year });

// 睡眠
const getSlpDataByDate = (userId, date) => httpService.post('/api/api/health-data-aggregated/slp-data-by-date', { userId, date });
const getSlpDataByWeek = (userId, dateInWeek) => httpService.post('/api/api/health-data-aggregated/slp-data-by-week', { userId, dateInWeek });
const getSlpDataByMonth = (userId, year, month) => httpService.post('/api/api/health-data-aggregated/slp-data-by-month', { userId, year, month });
const getSlpDataByYear = (userId, year) => httpService.post('/api/api/health-data-aggregated/slp-data-by-year', { userId, year });

// 血压
const getPreDataByDate = (userId, date) => httpService.post('/api/api/health-data-aggregated/pressure-data-by-date', { userId, date });
const getPreDataByWeek = (userId, dateInWeek) => httpService.post('/api/api/health-data-aggregated/pressure-data-by-week', { userId, dateInWeek });
const getPreDataByMonth = (userId, year, month) => httpService.post('/api/api/health-data-aggregated/pressure-data-by-month', { userId, year, month });
const getPreDataByYear = (userId, year) => httpService.post('/api/api/health-data-aggregated/pressure-data-by-year', { userId, year });

// 灌注指数
const getPiDataByDate = (userId, date) => httpService.post('/api/api/health-data-aggregated/pi-data-by-date', { userId, date });
const getPiDataByWeek = (userId, dateInWeek) => httpService.post('/api/api/health-data-aggregated/pi-data-by-week', { userId, dateInWeek });
const getPiDataByMonth = (userId, year, month) => httpService.post('/api/api/health-data-aggregated/pi-data-by-month', { userId, year, month });
const getPiDataByYear = (userId, year) => httpService.post('/api/api/health-data-aggregated/pi-data-by-year', { userId, year });

export {
    // 原有导出
    getBloodData,
    getHeartData,
    getOxygenData,
    getPiData,
    getPreData,
    getSlpData,
    wsService,
    // 新增导出 (用于图表的聚合数据)
    getBloodDataByDate,
    getBloodDataByWeek,
    getBloodDataByMonth,
    getBloodDataByYear,
    getHeartDataByDate,
    getHeartDataByWeek,
    getHeartDataByMonth,
    getHeartDataByYear,
    getOxygenDataByDate,
    getOxygenDataByWeek,
    getOxygenDataByMonth,
    getOxygenDataByYear,
    getSlpDataByDate,
    getSlpDataByWeek,
    getSlpDataByMonth,
    getSlpDataByYear,
    getPreDataByDate,
    getPreDataByWeek,
    getPreDataByMonth,
    getPreDataByYear,
    getPiDataByDate,
    getPiDataByWeek,
    getPiDataByMonth,
    getPiDataByYear,
}