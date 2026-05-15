// frontend/src/services/departmentService.js
import apiService from './apiService';

export const departmentService = {
  getDepartments: (params) => apiService.getDepartments(params),
  getDepartment: (id) => apiService.getDepartment(id),
  createDepartment: (data) => apiService.createDepartment(data),
  updateDepartment: (id, data) => apiService.updateDepartment(id, data),
  deleteDepartment: (id) => apiService.deleteDepartment(id),
  getDepartmentStaff: (id, params) => apiService.getDepartmentStaff(id, params),
  updateDepartmentBudget: (id, data) => apiService.updateDepartmentBudget(id, data)
};