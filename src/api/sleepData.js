import service from "../utils/request"

const sleepData = async (user_id) =>{
    return (await service.post('/api/sleepData',{user_id: user_id})).data
}

export{
    sleepData
}