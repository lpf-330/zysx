import service from "../utils/request"

const pressureData = async (user_id) =>{
    return (await service.post('/api/pressureData',{user_id: user_id})).data
}

export{
    pressureData
}