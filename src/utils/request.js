import axios from 'axios'

const service = axios.create({
    //baseURL: 'http://localhost:8081/admin/common', 
    timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config
},
    (error) =>{
        return Promise.reject(error);
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        return response
    },
    error => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

export default service