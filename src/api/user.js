import { httpService } from "../utils/apiService"

const getUserTabPageData = async (user_id) => {
  return (await httpService.post('/api/personal_history', { "user_id":user_id })).data;
}
const getTodosByDate = async (start_date, user_id) => {
  return (await httpService.post('/api/api/todos/query', { 
    start_date: start_date, 
    user_id: user_id 
  })).data;
}
const createTodo = async (todoData) => {
  return (await httpService.post('/api/api/todos/create', todoData)).data;
}

const updateTodoMS = async (id, todoData) => {
  return (await httpService.post(`/api/api/todos/update/${id}`, todoData)).data;
}

const deleteTodoMS = async (id) => {
  return (await httpService.post(`/api/api/todos/delete/${id}`)).data;
}

const updateTodoStatusMS = async (id, completed) => {
  return (await httpService.post(`/api/api/todos/update-status/${id}`, { completed })).data;
}

export {getUserTabPageData,
  getTodosByDate,
  createTodo,
  updateTodoMS,
  deleteTodoMS,
  updateTodoStatusMS
 }
