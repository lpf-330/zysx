import { httpService } from "../utils/apiService"

const getUserTabPageData = async (user_id) => {
  return (await httpService.post('/api/personal_history', { user_id })).data;
}

const updateUserInfo = async (user_id, username, gender, age, height, weight, phone_number) => {
  return (await httpService.post('/api/updateUserInfo', {
    user_id,
    username,
    gender,
    age,
    height,
    weight,
    phone_number
  })).data;
}


export { getUserTabPageData, updateUserInfo }
