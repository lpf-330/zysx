import { httpService } from "../utils/apiService"
import { wsService } from "../utils/apiService"

const getDataBox = async (user_id) => {
    console.log('API call - user_id:', user_id)
    return (await httpService.post('/data', { user_id: user_id })).data
}

const getBloodData = async (user_id) => {
    return (await httpService.post('/bloodData', { user_id: user_id })).data
}

const getHeartData = async (user_id) => {
    return (await httpService.post('/heartData', { user_id: user_id })).data
}

const getOxygenData = async (user_id) => {
    return (await httpService.post('/oxygenData', { user_id: user_id })).data
}

const getPiData = async (user_id) => {
    return (await httpService.post('/piData', { user_id: user_id })).data
}

const getPreData = async (user_id) => {
    return (await httpService.post('/pressureData', { user_id: user_id })).data
}

const getPressureData = async (user_id) => {
    return (await httpService.post('/pressureData', { user_id: user_id })).data
}

const dataWebSocketService = wsService;

const getSlpData = async (user_id) => {
    return (await httpService.post('/sleepData', { user_id: user_id })).data
}

export {
    getDataBox,
    getBloodData,
    getHeartData,
    getOxygenData,
    getPiData,
    getPreData,
    getPressureData,
    dataWebSocketService,
    getSlpData,
}