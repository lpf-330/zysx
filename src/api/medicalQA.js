import { httpService } from "../utils/apiService"

const userQuery = async (question) => {
    return (await httpService.post('/api/query', { question: question })).data
}

export {
    userQuery
}