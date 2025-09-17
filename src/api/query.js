import service from "../utils/request"

const userQuery = async (question) => {
    return (await service.post('/api/query',{question: question})).data
}

export{
    userQuery
}