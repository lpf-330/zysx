import { httpService } from "../utils/apiService"

const userLogin = async (account, password) => {
    return (await httpService.post('/api/userInfo', { account: account, password: password })).data
}
export {
    userLogin
}