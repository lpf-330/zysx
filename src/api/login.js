import service from "../utils/request"

const userLogin = async (account,password) => {
    return (await service.post('/api/userInfo',{account: account,password: password})).data
}
export{
    userLogin
}