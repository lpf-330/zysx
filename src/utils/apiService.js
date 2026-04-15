import axios from 'axios'

const httpService = axios.create({
    baseURL: 'http://localhost:8081',
    timeout: 5000
})

// 请求拦截器
httpService.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // 添加允许跨域的请求头
    config.headers['Access-Control-Allow-Origin'] = '*';
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
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
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
        this.manuallyClosed = false; // 👈 标记是否为主动关闭

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
        // 重置手动关闭标记
        this.manuallyClosed = false;

        // 如果已有连接，先断开
        if (this.ws) {
            this.disconnect();
        }

        try {
            this.ws = new WebSocket(this.url);

            // 连接成功
            this.ws.onopen = (event) => {
                console.log('WebSocket 连接成功');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.trigger('open', event);
            };

            // 接收消息（自动尝试 JSON 解析）
            this.ws.onmessage = (event) => {
                let data = event.data;
                try {
                    data = JSON.parse(event.data);
                } catch (e) {
                    // 非 JSON，保留原始字符串
                }
                this.trigger('message', data);
            };

            // 错误处理
            this.ws.onerror = (error) => {
                console.error('WebSocket 错误:', error);
                this.trigger('error', error);
            };

            // 连接关闭
            this.ws.onclose = (event) => {
                console.log('WebSocket 连接关闭:', event);
                this.isConnected = false;
                this.trigger('close', event);

                // 仅在非主动关闭时重连
                if (!this.manuallyClosed) {
                    this.autoReconnect();
                }
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
        this.manuallyClosed = true; // 标记为主动关闭

        if (this.ws) {
            // 只有 OPEN 或 CONNECTING 状态才调用 close()
            if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
                this.ws.close(code, reason);
            }
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
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket 未连接或未就绪，当前状态:', this.ws?.readyState);
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
     * 触发事件（隔离错误，避免一个回调崩溃影响其他）
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
     * 自动重连（指数退避）
     */
    autoReconnect() {
        // 如果是主动关闭，不重连
        if (this.manuallyClosed) {
            console.log('主动关闭连接，取消自动重连');
            return;
        }

        // 达到最大重连次数
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error(`已达到最大重连次数(${this.maxReconnectAttempts})，停止重连`);
            this.trigger('error', new Error(`已达到最大重连次数(${this.maxReconnectAttempts})`));
            return;
        }

        // 清除旧定时器（防御性）
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }

        // 指数退避计算
        const nextReconnectTime = this.reconnectInterval * (this.reconnectAttempts + 1);
        this.reconnectAttempts++;

        console.log(`将在 ${nextReconnectTime}ms 后进行第 ${this.reconnectAttempts} 次重连...`);

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null; // 👈 显式清空，语义清晰
            console.log(`进行第 ${this.reconnectAttempts} 次重连...`);
            this.connect();
        }, nextReconnectTime);
    }

    /**
     * 更新WebSocket URL并重新连接（保留原逻辑，不考虑 token 过期）
     * @param {string} newUrl - 新的WebSocket URL
     */
    updateUrl(newUrl) {
        if (newUrl && newUrl !== this.url) {
            this.url = newUrl;
            if (this.isConnected) {
                this.disconnect(1000, 'URL更新，重新连接');
                this.connect();
            }
        }
    }

    /**
     * 获取当前连接状态
     * @returns {boolean}
     */
    getStatus() {
        return this.isConnected;
    }
}

// 创建实例（示例）
const wsService = new WebSocketService("/ws/data", {
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
});

export { httpService, wsService }