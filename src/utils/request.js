import axios from 'axios'

const service = axios.create({
    baseURL: 'http://localhost:8081/admin/common', // 根据实际地址修改
    timeout: 5000
})

// 请求拦截器（可添加token）
service.interceptors.request.use(config => {
    // config.headers['Authorization'] = 'Bearer your_token'
    return config
})

// 响应拦截器
service.interceptors.response.use(
    response => {
        return response.data
    },
    error => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

export default service