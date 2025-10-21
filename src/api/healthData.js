import { httpService } from "../utils/apiService"
import { wsService } from "../utils/apiService"

const getDataBox = async (user_id) => {
    return (await httpService.post('/api/data', { user_id: user_id })).data
}

const getBloodData = async (user_id) => {
    return await wsService.requestData('blood', user_id);
}

const getHeartData = async (user_id) => {
    return await wsService.requestData('heart', user_id);
}

const getOxygenData = async (user_id) => {
    return await wsService.requestData('oxygen', user_id);
}

const getPiData = async (user_id) => {
    return await wsService.requestData('pi', user_id);
}

const getPreData = async (user_id) => {
    return await wsService.requestData('pre', user_id);
}

const getSlpData = async (user_id) => {
    return await wsService.requestData('slp', user_id);
}

export {
    getDataBox,
    getBloodData,
    getHeartData,
    getOxygenData,
    getPiData,
    getPreData,
    getSlpData,
}