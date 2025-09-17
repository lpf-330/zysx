import service from "../utils/request"

const heartData = async (user_id) =>{
    return (await service.post('/api/heartData',{user_id: user_id})).data
}

export{
    heartData
}