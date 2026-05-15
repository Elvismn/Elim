// frontend/src/services/studentService.js
import apiService from './apiService';

export const studentService = {
  getStudents: (params) => apiService.getStudents(params),
  getStudent: (id) => apiService.getStudent(id),
  createStudent: (data) => apiService.createStudent(data),
  updateStudent: (id, data) => apiService.updateStudent(id, data),
  deleteStudent: (id) => apiService.deleteStudent(id),
  getStudentsByGrade: (grade, status) => apiService.getStudentsByGrade(grade, status),
  updateStudentStatus: (ids, status) => apiService.updateStudentStatus(ids, status)
};