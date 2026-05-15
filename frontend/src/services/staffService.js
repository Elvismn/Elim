// frontend/src/services/staffService.js
import apiService from './apiService';

export const staffService = {
  getStaff: (params) => apiService.getStaff(params),
  getStaffMember: (id) => apiService.getStaffMember(id),
  createStaff: (data) => apiService.createStaff(data),
  updateStaff: (id, data) => apiService.updateStaff(id, data),
  deleteStaff: (id) => apiService.deleteStaff(id),
  markAttendance: (id, date, status, checkIn, checkOut, notes) => 
    apiService.markAttendance(id, date, status, checkIn, checkOut, notes),
  addPerformanceReview: (id, data) => apiService.addPerformanceReview(id, data),
  updateStaffStatus: (id, status, notes) => apiService.updateStaffStatus(id, status, notes)
};