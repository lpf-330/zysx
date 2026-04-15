import { httpService } from "../utils/apiService"

const getHealthReportList = async (userId) => {
    return (await httpService.post('/getHealthReportList', { userId })).data;
};

const getHealthReport = async (reportId) => {
    return (await httpService.post('/getHealthReport', { reportId })).data;
};

const deleteHealthReport = async (reportId) => {
    return (await httpService.post('/deleteHealthReport', { reportId })).data;
};

const saveHealthReport = async (userId, reportContent) => {
    return (await httpService.post('/saveHealthReport', { userId, reportContent })).data;
};

export {
    getHealthReportList,
    getHealthReport,
    deleteHealthReport,
    saveHealthReport
}