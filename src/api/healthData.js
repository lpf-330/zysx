import { wsService } from "../utils/apiService"

// 确保WebSocket连接的工具函数
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
        
        // 发送请求消息（如果后端需要的话）
        // 这里根据实际需求决定是否需要发送请求
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

export {
    getBloodData,
    getHeartData,
    getOxygenData,
    getPiData,
    getPreData,
    getSlpData,
    wsService
}