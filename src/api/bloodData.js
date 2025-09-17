import service from "../utils/request"

const bloodData = async (user_id) =>{
    return (await service.post('/api/bloodData',{user_id: user_id})).data
}

export{
    bloodData
}