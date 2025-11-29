import axios from 'axios'

const httpService = axios.create({
    //baseURL: 'http://localhost:8081/admin/common', 
    timeout: 5000
})

// 请求拦截器
httpService.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
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
    /**
     * 构造函数
     * @param {string} baseUrl - WebSocket服务器基础地址 (例如: localhost:8081)
     * @param {Object} options - 配置选项
     */
    constructor(baseUrl, options = {}) {
        if (!baseUrl) {
            throw new Error('WebSocket 基础URL 不能为空');
        }

        this.baseUrl = baseUrl;
        this.wsMap = new Map(); // 储不同类型的WebSocket连接
        this.isConnectedMap = new Map();
        this.manuallyClosedMap = new Map();

        // 配置默认值
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;

        // 事件回调存储
        this.events = {
            open: [],
            message: [],
            error: [],
            close: []
        };

        // 请求-响应相关
        this.requestId = 0;
        this.pendingRequests = new Map();
    }

    /**
     * 接特定类型的WebSocket服务器
     * @param {string} dataType - 数据类型 (blood, heart, oxygen, pi, pre, slp)
     * @param {string} userId - 用户ID
     */
    connect(dataType, userId) {
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

        // console.log(`尝试连接到 WebSocket: ${wsUrl}`); // 注释掉调试信息

        // 标记为非手动关闭
        this.manuallyClosedMap.set(dataType, false);

        try {
            const ws = new WebSocket(wsUrl);
            this.wsMap.set(dataType, ws);
            this.isConnectedMap.set(dataType, false);

            ws.onopen = (event) => {
                // console.log(`${dataType} WebSocket 接成功`);
                this.isConnectedMap.set(dataType, true);
                this.trigger('open', { dataType, event });
            };

            ws.onmessage = (event) => {
                // console.log(`${dataType} 收到消息:`, event.data); // 注释掉调试信息
                let data;
                try {
                    data = JSON.parse(event.data);
                    // console.log(`${dataType} 解析消息:`, data); // 注释掉调试信息
                    
                    // 处理后端返回的HealthDataMessage格式
                    if (data && data.data && Array.isArray(data.data)) {
                        // 触发消息事件，传递解析后的数据
                        this.trigger('message', { dataType, data: data.data });
                    } else {
                        // console.warn(`${dataType} 息格式不符合HealthDataMessage格式:`, data); // 注释掉调试信息
                    }
                } catch (e) {
                    console.error(`${dataType} 解析消息失败:`, e);
                    this.trigger('error', { dataType, error: e });
                }
            };

            ws.onerror = (error) => {
                console.error(`${dataType} WebSocket 错误:`, error);
                this.trigger('error', { dataType, error });
            };

            ws.onclose = (event) => {
                // console.log(`${dataType} WebSocket 接关闭:`, event.code, event.reason); // 注释掉调试信息
                this.isConnectedMap.set(dataType, false);
                this.wsMap.delete(dataType);
                this.trigger('close', { dataType, event });
            };

        } catch (error) {
            console.error(`创建 ${dataType} WebSocket 连接失败:`, error);
            this.trigger('error', { dataType, error });
        }
    }

    /**
     * 断开特定类型的WebSocket连接
     * @param {string} dataType - 数据类型
     */
    disconnect(dataType) {
        this.manuallyClosedMap.set(dataType, true);
        
        const ws = this.wsMap.get(dataType);
        if (ws) {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
            this.wsMap.delete(dataType);
            this.isConnectedMap.set(dataType, false);
        }
    }

    /**
     * 断开所有WebSocket连接
     */
    disconnectAll() {
        for (const dataType of this.wsMap.keys()) {
            this.disconnect(dataType);
        }
    }

    /**
     * 获取连接状态
     * @param {string} dataType - 数据类型
     * @returns {boolean}
     */
    getStatus(dataType) {
        return this.isConnectedMap.get(dataType) || false;
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