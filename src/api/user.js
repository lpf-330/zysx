import { httpService } from "../utils/apiService"

const getUserTabPageData = async (user_id) => {
  return (await httpService.post('/api/personal_history', { "user_id":user_id })).data;
}


export { getUserTabPageData }
