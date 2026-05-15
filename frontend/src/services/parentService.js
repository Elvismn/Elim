// frontend/src/services/parentService.js
import apiService from './apiService';

export const parentService = {
  getParents: (params) => apiService.getParents(params),
  getParent: (id) => apiService.getParent(id),
  createParent: (data) => apiService.createParent(data),
  updateParent: (id, data) => apiService.updateParent(id, data),
  deleteParent: (id) => apiService.deleteParent(id),
  addChildToParent: (parentId, studentId) => apiService.addChildToParent(parentId, studentId),
  removeChildFromParent: (parentId, studentId) => apiService.removeChildFromParent(parentId, studentId),
  toggleStatus: (id) => apiService.toggleParentStatus(id)
};