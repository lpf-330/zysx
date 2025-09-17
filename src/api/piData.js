import service from "../utils/request"

const piData = async (user_id) =>{
    return (await service.post('/api/piData',{user_id: user_id})).data
}

export{
    piData
}