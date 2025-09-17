import service from "../utils/request"

const oxygenData = async (user_id) =>{
    return (await service.post('/api/oxygenData',{user_id: user_id})).data
}

export{
    oxygenData
}