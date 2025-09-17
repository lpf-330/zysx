import service from "../utils/request"

export const userTabPageData = (user_id) => {
  return service.post('/api/personal_history', { user_id }, {
    headers: { 'Content-Type': 'application/json' }
  }).then(response => response.data);
}