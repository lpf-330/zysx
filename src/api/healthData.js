import { wsService } from "../utils/apiService"
import { httpService } from "../utils/apiService"

// 存储当前活动连接的用户ID
let currentConnections = new Map(); // key: dataType, value: userId

const ensureWsConnected = (dataType, userId, timeout = 5000) => {
    return new Promise((resolve, reject) => {
        // 如果已经为该数据类型连接了不同的用户，先断开旧连接
        if (currentConnections.get(dataType) && currentConnections.get(dataType) !== userId) {
            wsService.disconnect(dataType, currentConnections.get(dataType));
            currentConnections.delete(dataType);
        }

        // 检查是否已连接相同用户
        if (wsService.getStatus(dataType, userId)) {
            currentConnections.set(dataType, userId);
            resolve();
            return;
        }

        const timer = setTimeout(() => {
            reject(new Error(`${dataType} WebSocket连接 for userId ${userId} 超时`));
        }, timeout);

        const onOpen = (data) => {
            if (data.dataType === dataType && data.userId === userId) {
                clearTimeout(timer);
                currentConnections.set(dataType, userId);
                resolve();
                wsService.off('open', onOpen);
                wsService.off('error', onError);
            }
        };

        const onError = (data) => {
            if (data.dataType === dataType && data.userId === userId) {
                clearTimeout(timer);
                currentConnections.delete(dataType);
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

// 断开指定用户的所有连接
export const disconnectUserConnections = (userId) => {
    if (!userId) return;
    
    const dataTypes = ['blood', 'heart', 'oxygen', 'pi', 'pre', 'slp'];
    dataTypes.forEach(dataType => {
        if (currentConnections.get(dataType) === userId) {
            wsService.disconnect(dataType, userId);
            currentConnections.delete(dataType);
        }
    });
    
    // 清理所有与该用户相关的事件监听器
    wsService.off('message');
    wsService.off('error');
    wsService.off('open');
    wsService.off('close');
};

// 为每个数据获取函数添加清理机制
const createDataFetcher = (dataType) => {
    return async (userId) => {
        await ensureWsConnected(dataType, userId);
        
        return new Promise((resolve, reject) => {
            let messageHandler;
            let errorHandler;
            let timeoutId;
            
            const cleanup = () => {
                if (messageHandler) wsService.off('message', messageHandler);
                if (errorHandler) wsService.off('error', errorHandler);
                if (timeoutId) clearTimeout(timeoutId);
            };
            
            timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error(`${dataType} 数据获取超时`));
            }, 10000);
            
            messageHandler = (data) => {
                if (data.dataType === dataType && data.userId === userId) {
                    cleanup();
                    resolve(data.data);
                }
            };
            
            errorHandler = (errorData) => {
                if (errorData.dataType === dataType && errorData.userId === userId) {
                    cleanup();
                    reject(errorData.error);
                }
            };
            
            wsService.on('message', messageHandler);
            wsService.on('error', errorHandler);
        });
    };
};

// 使用工厂函数创建数据获取函数
const getBloodData = createDataFetcher('blood');
const getHeartData = createDataFetcher('heart');
const getOxygenData = createDataFetcher('oxygen');
const getPiData = createDataFetcher('pi');
const getPreData = createDataFetcher('pre');
const getSlpData = createDataFetcher('slp');

// 存储实时数据监听器
const realTimeListeners = new Map();

// 创建实时数据订阅函数
const createRealTimeDataSubscriber = (dataType) => {
  return (userId, callback) => {
    const listenerKey = `${dataType}_${userId}`;
    
    // 清理旧监听器
    const oldListener = realTimeListeners.get(listenerKey);
    if (oldListener) {
      wsService.off('message', oldListener.handler);
      realTimeListeners.delete(listenerKey);
    }
    
    // 确保连接已建立
    ensureWsConnected(dataType, userId).then(() => {
      // 创建新的消息处理器
      const messageHandler = (data) => {
        if (data.dataType === dataType && data.userId === userId) {
          callback(data.data);
        }
      };
      
      // 保存监听器
      realTimeListeners.set(listenerKey, {
        userId,
        dataType,
        handler: messageHandler,
        callback
      });
      
      // 注册消息监听
      wsService.on('message', messageHandler);
      
      console.log(`已订阅 ${dataType} 数据的实时更新 for userId ${userId}`);
    }).catch(error => {
      console.error(`订阅 ${dataType} 数据实时更新失败:`, error);
    });
  };
};

// 取消实时数据订阅
const unsubscribeRealTimeData = (dataType, userId) => {
  const listenerKey = `${dataType}_${userId}`;
  const listener = realTimeListeners.get(listenerKey);
  
  if (listener) {
    wsService.off('message', listener.handler);
    realTimeListeners.delete(listenerKey);
    console.log(`已取消订阅 ${dataType} 数据的实时更新 for userId ${userId}`);
  }
};

// 取消用户所有实时数据订阅
const unsubscribeUserAllRealTimeData = (userId) => {
  for (const [key, listener] of realTimeListeners.entries()) {
    if (listener.userId === userId) {
      wsService.off('message', listener.handler);
      realTimeListeners.delete(key);
    }
  }
};

// 创建各个数据类型的实时订阅函数
const subscribeHeartData = createRealTimeDataSubscriber('heart');
const subscribeBloodData = createRealTimeDataSubscriber('blood');
const subscribeOxygenData = createRealTimeDataSubscriber('oxygen');
const subscribePiData = createRealTimeDataSubscriber('pi');
const subscribePreData = createRealTimeDataSubscriber('pre');
const subscribeSlpData = createRealTimeDataSubscriber('slp');

// --- 用于图表展示的历史聚合数据获取 (通过 HTTP POST) ---

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

// 基础数据接口（用于获取所有数据，前端聚合）
const getAllSleepData = (userId) => httpService.post('/api/sleepData', { user_id: userId });
const getAllPiData = (userId) => httpService.post('/api/piData', { user_id: userId });
const getAllOxygenData = (userId) => httpService.post('/api/oxygenData', { user_id: userId });
const getAllHeartData = (userId) => httpService.post('/api/heartData', { user_id: userId });

export {
    // 原有导出
    getBloodData,
    getHeartData,
    getOxygenData,
    getPiData,
    getPreData,
    getSlpData,
    wsService,
    // 用于图表的聚合数据
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
    // 基础数据接口（前端聚合用）
    getAllSleepData,
    getAllPiData,
    getAllOxygenData,
    getAllHeartData,
    // 用于实时数据订阅
    subscribeHeartData,
    subscribeBloodData,
    subscribeOxygenData,
    subscribePiData,
    subscribePreData,
    subscribeSlpData,
    // 用于取消用户所有实时数据订阅
    unsubscribeUserAllRealTimeData
}