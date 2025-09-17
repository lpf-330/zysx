import service from "../utils/request"

const dataBox = async (user_id) =>{
    return (await service.post('/api/data',{user_id: user_id})).data
}

export{
    dataBox
}