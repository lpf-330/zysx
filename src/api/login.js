import { httpService } from "../utils/apiService"

const userLogin = async (account, password) => {
    return (await httpService.post('/userInfo', { account: account, password: password })).data
}
<<<<<<< Updated upstream
=======

const childLogin = async (account, password) => {
    return (await httpService.post('/child/login', {
        account: account,
        password: password
    })).data
}

>>>>>>> Stashed changes
export {
    userLogin
}