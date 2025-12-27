import { httpService } from "../utils/apiService"

const userLogin = async (account, password) => {
    return (await httpService.post('/api/userInfo', { account: account, password: password })).data
}

const childLogin = async (account, password) => {
    return (await httpService.post('/api/child/login', { 
        account: account, 
        password: password 
    })).data
}

export {
    userLogin,
    childLogin,
}