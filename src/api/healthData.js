import { httpService } from "../utils/apiService"
import { WebSocketService } from "../utils/apiService"

const getDataBox = async (user_id) => {
    return (await httpService.post('/api/data', { user_id: user_id })).data
}

const getBloodData = async (user_id) => {
    const ws = WebSocketService("")
}

const getHeartData = async (user_id) => {
    const ws = WebSocketService("")
}

const getOxygenData = async (user_id) => {
    const ws = WebSocketService("")
}

const getPiData = async (user_id) => {
    const ws = WebSocketService("")
}

const getPreData = async (user_id) => {
    const ws = WebSocketService("")
}

const getSlpData = async (user_id) => {
    const ws = WebSocketService("")
}

class DataWebSocketService extends WebSocketService {
    constructor() {
        super("/ws/data", {
            reconnectInterval: 1000,
            maxReconnectAttempts: 5
        });
        this.pendingRequests = new Map();
        this.requestId = 0;

        // 监听消息事件
        this.on('message', this.handleMessage.bind(this));
        this.on('open', this.handleOpen.bind(this));
        this.on('close', this.handleClose.bind(this));
        this.on('error', this.handleError.bind(this));
    }

    connectIfNeeded() {
        return new Promise((resolve, reject) => {
            if (this.isConnected) {
                resolve();
                return;
            }

            if (!this.ws) {
                this.connect();
            }

            const checkConnection = () => {
                if (this.isConnected) {
                    resolve();
                } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    reject(new Error('连接失败'));
                } else {
                    setTimeout(checkConnection, 100);
                }
            };
            checkConnection();
        });
    }

    requestData(type, userId) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected || !this.ws) {
                reject(new Error('WebSocket未连接'));
                return;
            }

            const requestData = {
                type: type,
                user_id: userId
            };

            // 发送请求
            if (!this.send(requestData)) {
                reject(new Error('发送失败'));
                return;
            }

            // 设置超时
            const timeoutId = setTimeout(() => {
                this.off('message', messageHandler);
                reject(new Error('请求超时'));
            }, 10000);

            // 监听响应
            const messageHandler = (data) => {
                try {
                    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
                    // 根据你的业务逻辑判断是否是期望的响应
                    if (parsedData && (parsedData.type === type || Array.isArray(parsedData))) {
                        clearTimeout(timeoutId);
                        this.off('message', messageHandler);
                        resolve(parsedData);
                    }
                } catch (error) {
                    console.error('解析数据失败:', error);
                }
            };

            this.on('message', messageHandler);
        });
    }

    handleMessage(data) {
        console.log('收到WebSocket消息:', data);
        // 这里可以处理广播消息等
    }

    handleOpen(event) {
        console.log('WebSocket连接成功');
        this.isConnected = true;
        this.reconnectAttempts = 0;
    }

    handleClose(event) {
        console.log('WebSocket连接关闭');
        this.isConnected = false;
    }

    handleError(error) {
        console.error('WebSocket错误:', error);
    }
}

// 创建单例实例
const dataWebSocketService = new DataWebSocketService();

export {
    getDataBox,
    getBloodData,
    getHeartData,
    getOxygenData,
    getPiData,
    getPreData,
    getSlpData,
    DataWebSocketService,
    dataWebSocketService
}