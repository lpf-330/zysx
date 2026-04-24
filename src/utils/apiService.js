import axios from 'axios'

const httpService = axios.create({
    timeout: 30000
})

// 请求拦截器
httpService.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    const isLoginRequest = config.url && (config.url.includes('/login') || config.url.includes('/userInfo'));
    if (token && !isLoginRequest) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config
},
    (error) => {
        return Promise.reject(error);
    }
)

// 响应拦截器
httpService.interceptors.response.use(
    response => {
        return response
    },
    error => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

class WebSocketService {
    constructor(baseUrl, options = {}) {
        if (!baseUrl) {
            throw new Error('WebSocket 基础URL 不能为空');
        }

        this.baseUrl = baseUrl;
        // 使用 Map 存储 dataType + userId 的组合
        this.wsMap = new Map(); 
        this.isConnectedMap = new Map();
        this.manuallyClosedMap = new Map();

        // 配置默认值
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;

        this.events = {
            open: [],
            message: [],
            error: [],
            close: []
        };

        this.requestId = 0;
        this.pendingRequests = new Map();
    }

    // 添加一个辅助函数来生成唯一的连接键
    _getConnectionKey(dataType, userId) {
        return `${dataType}_${userId}`;
    }

    connect(dataType, userId) {
        const connectionKey = this._getConnectionKey(dataType, userId);

        // 据数据类型构建URL
        let endpoint;
        switch (dataType) {
            case 'blood':
                endpoint = `/websocket/bloodSugar?userId=${userId}`;
                break;
            case 'heart':
                endpoint = `/websocket/heartRate?userId=${userId}`;
                break;
            case 'oxygen':
                endpoint = `/websocket/bloodOxygen?userId=${userId}`;
                break;
            case 'pi':
                endpoint = `/websocket/perfusionIndex?userId=${userId}`;
                break;
            case 'pre':
                endpoint = `/websocket/bloodPressure?userId=${userId}`;
                break;
            case 'slp':
                endpoint = `/websocket/sleepData?userId=${userId}`;
                break;
            default:
                throw new Error(`不支持的数据类型: ${dataType}`);
        }

        const wsUrl = this.baseUrl.startsWith('http')
            ? this.baseUrl.replace('http://', 'ws://').replace('https://', 'wss://') + endpoint
            : `ws://${this.baseUrl}${endpoint}`;

        // console.log(`尝试连接到 WebSocket: ${wsUrl}`); 

        // 标记为非手动关闭
        this.manuallyClosedMap.set(connectionKey, false);

        try {
            const ws = new WebSocket(wsUrl);
            this.wsMap.set(connectionKey, ws);
            this.isConnectedMap.set(connectionKey, false);

            ws.onopen = (event) => {
                // console.log(`${dataType} WebSocket 连接成功 for userId ${userId}`);
                this.isConnectedMap.set(connectionKey, true);
                this.trigger('open', { dataType, userId, event });
            };

            ws.onmessage = (event) => {
                // console.log(`${dataType} 收到消息:`, event.data); 
                let data;
                try {
                    data = JSON.parse(event.data);
                    // console.log(`${dataType} 解析消息:`, data); 

                    if (data && data.data && Array.isArray(data.data)) {
                        // 传递 userId 信息，方便调用方区分数据来源
                        this.trigger('message', { dataType, userId, data: data.data });
                    } else {
                        // console.warn(`${dataType} 消息格式不符合HealthDataMessage格式:`, data); 
                    }
                } catch (e) {
                    console.error(`${dataType} 解析消息失败:`, e);
                    this.trigger('error', { dataType, userId, error: e });
                }
            };

            ws.onerror = (error) => {
                console.error(`${dataType} WebSocket 错误 for userId ${userId}:`, error);
                this.trigger('error', { dataType, userId, error });
            };

            ws.onclose = (event) => {
                // console.log(`${dataType} WebSocket 连接关闭 for userId ${userId}:`, event.code, event.reason); 
                this.isConnectedMap.set(connectionKey, false);
                this.wsMap.delete(connectionKey);
                this.trigger('close', { dataType, userId, event });
            };

        } catch (error) {
            console.error(`创建 ${dataType} WebSocket 连接 for userId ${userId} 失败:`, error);
            this.trigger('error', { dataType, userId, error });
        }
    }

    // disconnect 也需要使用连接键
    disconnect(dataType, userId) {
        const connectionKey = this._getConnectionKey(dataType, userId);
        this.manuallyClosedMap.set(connectionKey, true);

        const ws = this.wsMap.get(connectionKey);
        if (ws) {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
            this.wsMap.delete(connectionKey);
            this.isConnectedMap.set(connectionKey, false);
        }
    }

    // disconnectAll 需要遍历所有连接键
    disconnectAll() {
        for (const [key, ws] of this.wsMap.entries()) {
            if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
                ws.close();
            }
        }
        this.wsMap.clear();
        this.isConnectedMap.clear();
        this.manuallyClosedMap.clear();
    }

    // getStatus 也需要使用连接键
    getStatus(dataType, userId) {
        const connectionKey = this._getConnectionKey(dataType, userId);
        return this.isConnectedMap.get(connectionKey) || false;
    }

    /**
     * 注册事件监听
     * @param {string} event - 事件名称(open, message, error, close)
     * @param {Function} callback - 事件回调函数
     */
    on(event, callback) {
        if (this.events[event] && typeof callback === 'function') {
            this.events[event].push(callback);
        }
    }

    /**
     * 除事件监听
     * @param {string} event - 事件名称
     * @param {Function} callback - 要移除的回调函数
     */
    off(event, callback) {
        if (this.events[event]) {
            if (callback) {
                this.events[event] = this.events[event].filter(cb => cb !== callback);
            } else {
                this.events[event] = [];
            }
        }
    }

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {*} data - 事件数据
     */
    trigger(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`WebSocket 事件 ${event} 回调执行错误:`, error);
                }
            });
        }
    }
}

// 创建实例
const wsService = new WebSocketService("localhost:8081", {
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
});

export { httpService, wsService }