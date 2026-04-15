import { httpService } from "../utils/apiService"

const userLogin = async (account, password) => {
    return (await httpService.post('/userInfo', { account: account, password: password })).data
}
export {
    userLogin
}