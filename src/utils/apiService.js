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
     * @param {string} url - WebSocket服务器地址
     * @param {Object} options - 配置选项
     * @param {number} options.reconnectInterval - 重连间隔时间(ms)，默认3000
     * @param {number} options.maxReconnectAttempts - 最大重连次数，默认5
     */
    constructor(url, options = {}) {
        if (!url) {
            throw new Error('WebSocket URL 不能为空');
        }

        this.url = url;
        this.ws = null;
        this.isConnected = false;
        this.reconnectTimer = null;
        this.reconnectAttempts = 0;

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
    }

    /**
     * 连接WebSocket服务器
     */
    connect() {
        // 如果已经连接，则先断开
        if (this.ws) {
            this.disconnect();
        }

        try {
            this.ws = new WebSocket(this.url);

            // 连接成功回调
            this.ws.onopen = (event) => {
                console.log('WebSocket 连接成功');
                this.isConnected = true;
                this.reconnectAttempts = 0; // 重置重连次数
                this.trigger('open', event);
            };

            // 接收消息回调
            this.ws.onmessage = (event) => {
                this.trigger('message', event.data);
            };

            // 错误回调
            this.ws.onerror = (error) => {
                console.error('WebSocket 错误:', error);
                this.trigger('error', error);
            };

            // 关闭回调
            this.ws.onclose = (event) => {
                console.log('WebSocket 连接关闭:', event);
                this.isConnected = false;
                this.trigger('close', event);

                // 自动重连
                this.autoReconnect();
            };
        } catch (error) {
            console.error('WebSocket 初始化失败:', error);
            this.trigger('error', error);
        }
    }

    /**
     * 断开WebSocket连接
     * @param {number} code - 关闭代码，默认1000（正常关闭）
     * @param {string} reason - 关闭原因
     */
    disconnect(code = 1000, reason = '正常关闭') {
        if (this.ws) {
            this.ws.close(code, reason);
            this.ws = null;
            this.isConnected = false;

            // 清除重连定时器
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
        }
    }

    /**
     * 发送消息
     * @param {string|Object} data - 要发送的数据，对象会自动转为JSON字符串
     * @returns {boolean} - 发送成功返回true，否则返回false
     */
    send(data) {
        if (!this.isConnected || !this.ws) {
            console.error('WebSocket 未连接，无法发送消息');
            return false;
        }

        try {
            const sendData = typeof data === 'object' ? JSON.stringify(data) : data;
            this.ws.send(sendData);
            return true;
        } catch (error) {
            console.error('WebSocket 发送消息失败:', error);
            this.trigger('error', error);
            return false;
        }
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
     * 移除事件监听
     * @param {string} event - 事件名称
     * @param {Function} callback - 要移除的回调函数，不传则移除所有该事件的回调
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

    /**
     * 自动重连
     */
    autoReconnect() {
        // 如果已经达到最大重连次数，则停止重连
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error(`已达到最大重连次数(${this.maxReconnectAttempts})，停止重连`);
            this.trigger('error', new Error(`已达到最大重连次数(${this.maxReconnectAttempts})`));
            return;
        }

        // 清除已有的重连定时器
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }

        // 计算下一次重连时间，采用指数退避策略
        const nextReconnectTime = this.reconnectInterval * (this.reconnectAttempts + 1);
        this.reconnectAttempts++;

        console.log(`将在 ${nextReconnectTime}ms 后进行第 ${this.reconnectAttempts} 次重连...`);

        this.reconnectTimer = setTimeout(() => {
            console.log(`进行第 ${this.reconnectAttempts} 次重连...`);
            this.connect();
        }, nextReconnectTime);
    }

    /**
     * 更新WebSocket URL并重新连接
     * @param {string} newUrl - 新的WebSocket URL
     */
    updateUrl(newUrl) {
        if (newUrl && newUrl !== this.url) {
            this.url = newUrl;
            // 如果当前已连接，则先断开再重连
            if (this.isConnected) {
                this.disconnect(1000, 'URL更新，重新连接');
                this.connect();
            }
        }
    }
}

export { httpService, WebSocketService }