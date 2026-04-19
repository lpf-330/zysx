import { httpService } from "../utils/apiService";

// 获取指定子女关联的所有监护对象信息
const getChildParentsInfo = async (childId) => {
  return (await httpService.get(`/api/child/${childId}/parents`)).data;
};

// 添加一位监护对象
const addChildParent = async (childId, parentData) => {
  return (await httpService.post(`/api/child/${childId}/parents`, parentData)).data;
};

// 更新一位监护对象的信息
const updateChildParent = async (childId, parentId, parentData) => {
  return (await httpService.put(`/api/child/${childId}/parents/${parentId}`, parentData)).data;
};

// 删除一位监护对象
const deleteChildParent = async (childId, parentId) => {
  return (await httpService.delete(`/api/child/${childId}/parents/${parentId}`)).data;
};

export {
  getChildParentsInfo,
  addChildParent,
  updateChildParent,
  deleteChildParent
};