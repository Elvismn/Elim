// frontend/src/services/apiService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return !!this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
          localStorage.removeItem('user');
        }
        throw { status: response.status, ...data };
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // ========== AUTH ENDPOINTS ==========
  
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST'
    });
    this.setToken(null);
    localStorage.removeItem('user');
    return response;
  }

  // ========== USER ENDPOINTS ==========
  
  async setupAdmin(name, email, password) {
    return this.request('/users/setup-admin', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  }

  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(name, email) {
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  async getSystemStats() {
    return this.request('/users/stats');
  }

  // ========== STUDENT ENDPOINTS ==========
  
  async getStudents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/students${queryString ? `?${queryString}` : ''}`);
  }

  async getStudent(id) {
    return this.request(`/students/${id}`);
  }

  async createStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  async updateStudent(id, studentData) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  }

  async deleteStudent(id) {
    return this.request(`/students/${id}`, {
      method: 'DELETE'
    });
  }

  async getStudentsByGrade(grade, status = 'Active') {
    return this.request(`/students/grade/${grade}?status=${status}`);
  }

  async updateStudentStatus(studentIds, status) {
    return this.request('/students/status', {
      method: 'PATCH',
      body: JSON.stringify({ studentIds, status })
    });
  }

  // ========== PARENT ENDPOINTS ==========
  
  async getParents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/parents${queryString ? `?${queryString}` : ''}`);
  }

  async getParent(id) {
    return this.request(`/parents/${id}`);
  }

  async createParent(parentData) {
    return this.request('/parents', {
      method: 'POST',
      body: JSON.stringify(parentData)
    });
  }

  async updateParent(id, parentData) {
    return this.request(`/parents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(parentData)
    });
  }

  async deleteParent(id) {
    return this.request(`/parents/${id}`, {
      method: 'DELETE'
    });
  }

  async addChildToParent(parentId, studentId) {
    return this.request(`/parents/${parentId}/children/${studentId}`, {
      method: 'POST'
    });
  }

  async removeChildFromParent(parentId, studentId) {
    return this.request(`/parents/${parentId}/children/${studentId}`, {
      method: 'DELETE'
    });
  }

  async toggleParentStatus(id) {
    return this.request(`/parents/${id}/toggle-status`, {
      method: 'PATCH'
    });
  }

  // ========== STAFF ENDPOINTS ==========
  
  async getStaff(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/staff${queryString ? `?${queryString}` : ''}`);
  }

  async getStaffMember(id) {
    return this.request(`/staff/${id}`);
  }

  async createStaff(staffData) {
    return this.request('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData)
    });
  }

  async updateStaff(id, staffData) {
    return this.request(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData)
    });
  }

  async deleteStaff(id) {
    return this.request(`/staff/${id}`, {
      method: 'DELETE'
    });
  }

  async markAttendance(id, date, status, checkIn = null, checkOut = null, notes = '') {
    return this.request(`/staff/${id}/attendance`, {
      method: 'POST',
      body: JSON.stringify({ date, status, checkIn, checkOut, notes })
    });
  }

  async addPerformanceReview(id, reviewData) {
    return this.request(`/staff/${id}/performance-review`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  async updateStaffStatus(id, status, notes = '') {
    return this.request(`/staff/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
  }

  // ========== DEPARTMENT ENDPOINTS ==========
  
  async getDepartments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/departments${queryString ? `?${queryString}` : ''}`);
  }

  async getDepartment(id) {
    return this.request(`/departments/${id}`);
  }

  async createDepartment(departmentData) {
    return this.request('/departments', {
      method: 'POST',
      body: JSON.stringify(departmentData)
    });
  }

  async updateDepartment(id, departmentData) {
    return this.request(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(departmentData)
    });
  }

  async deleteDepartment(id) {
    return this.request(`/departments/${id}`, {
      method: 'DELETE'
    });
  }

  async getDepartmentStaff(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/departments/${id}/staff${queryString ? `?${queryString}` : ''}`);
  }

  async updateDepartmentBudget(id, budgetData) {
    return this.request(`/departments/${id}/budget`, {
      method: 'PATCH',
      body: JSON.stringify(budgetData)
    });
  }

  // ========== VEHICLE ENDPOINTS ==========
  
  async getVehicles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/vehicles${queryString ? `?${queryString}` : ''}`);
  }

  async getVehicle(id) {
    return this.request(`/vehicles/${id}`);
  }

  async createVehicle(vehicleData) {
    return this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    });
  }

  async updateVehicle(id, vehicleData) {
    return this.request(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData)
    });
  }

  async deleteVehicle(id) {
    return this.request(`/vehicles/${id}`, {
      method: 'DELETE'
    });
  }

  async updateVehicleOdometer(id, odometer) {
    return this.request(`/vehicles/${id}/odometer`, {
      method: 'PATCH',
      body: JSON.stringify({ odometer })
    });
  }

  async assignDriverToVehicle(id, driverId) {
    return this.request(`/vehicles/${id}/assign-driver`, {
      method: 'PATCH',
      body: JSON.stringify({ driverId })
    });
  }

  async getVehiclesNeedingService() {
    return this.request('/vehicles/needing-service');
  }

  async getVehiclesExpiringDocuments(days = 30) {
    return this.request(`/vehicles/expiring-documents?days=${days}`);
  }

  // ========== FUEL RECORD ENDPOINTS ==========
  
  async getFuelRecords(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/fuel-records${queryString ? `?${queryString}` : ''}`);
  }

  async getFuelRecord(id) {
    return this.request(`/fuel-records/${id}`);
  }

  async createFuelRecord(recordData) {
    return this.request('/fuel-records', {
      method: 'POST',
      body: JSON.stringify(recordData)
    });
  }

  async updateFuelRecord(id, recordData) {
    return this.request(`/fuel-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recordData)
    });
  }

  async deleteFuelRecord(id) {
    return this.request(`/fuel-records/${id}`, {
      method: 'DELETE'
    });
  }

  async verifyFuelRecord(id) {
    return this.request(`/fuel-records/${id}/verify`, {
      method: 'PATCH'
    });
  }

  async getFuelAnalytics(vehicleId, year = new Date().getFullYear()) {
    return this.request(`/fuel-records/vehicle/${vehicleId}/analytics?year=${year}`);
  }

  async getUnverifiedFuelRecords(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/fuel-records/unverified${queryString ? `?${queryString}` : ''}`);
  }

  async bulkVerifyFuelRecords(recordIds) {
    return this.request('/fuel-records/bulk-verify', {
      method: 'POST',
      body: JSON.stringify({ recordIds })
    });
  }

  // ========== MAINTENANCE RECORD ENDPOINTS ==========
  
  async getMaintenanceRecords(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/maintenance${queryString ? `?${queryString}` : ''}`);
  }

  async getMaintenanceRecord(id) {
    return this.request(`/maintenance/${id}`);
  }

  async createMaintenanceRecord(recordData) {
    return this.request('/maintenance', {
      method: 'POST',
      body: JSON.stringify(recordData)
    });
  }

  async updateMaintenanceRecord(id, recordData) {
    return this.request(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recordData)
    });
  }

  async deleteMaintenanceRecord(id) {
    return this.request(`/maintenance/${id}`, {
      method: 'DELETE'
    });
  }

  async verifyMaintenanceRecord(id) {
    return this.request(`/maintenance/${id}/verify`, {
      method: 'PATCH'
    });
  }

  async getMaintenanceAnalytics(vehicleId, year = new Date().getFullYear()) {
    return this.request(`/maintenance/vehicle/${vehicleId}/analytics?year=${year}`);
  }

  async getUpcomingMaintenance(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/maintenance/upcoming${queryString ? `?${queryString}` : ''}`);
  }

  async getMaintenanceForecast(vehicleId, months = 12) {
    return this.request(`/maintenance/vehicle/${vehicleId}/forecast?months=${months}`);
  }

  async getOverdueMaintenance() {
    return this.request('/maintenance/overdue');
  }

  // ========== STAKEHOLDER ENDPOINTS ==========
  
  async getStakeholders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/stakeholders${queryString ? `?${queryString}` : ''}`);
  }

  async getStakeholder(id) {
    return this.request(`/stakeholders/${id}`);
  }

  async createStakeholder(stakeholderData) {
    return this.request('/stakeholders', {
      method: 'POST',
      body: JSON.stringify(stakeholderData)
    });
  }

  async updateStakeholder(id, stakeholderData) {
    return this.request(`/stakeholders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stakeholderData)
    });
  }

  async deleteStakeholder(id) {
    return this.request(`/stakeholders/${id}`, {
      method: 'DELETE'
    });
  }

  async addStakeholderEngagement(id, engagementData) {
    return this.request(`/stakeholders/${id}/engagements`, {
      method: 'POST',
      body: JSON.stringify(engagementData)
    });
  }

  async getStakeholderEngagements(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/stakeholders/${id}/engagements${queryString ? `?${queryString}` : ''}`);
  }

  async updateStakeholderStatus(id, status, reason = '') {
    return this.request(`/stakeholders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason })
    });
  }

  async assignStakeholder(id, staffId) {
    return this.request(`/stakeholders/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ staffId })
    });
  }

  async addStakeholderDocument(id, documentData) {
    return this.request(`/stakeholders/${id}/documents`, {
      method: 'POST',
      body: JSON.stringify(documentData)
    });
  }

  // ========== VEHICLE DOCUMENT ENDPOINTS ==========
  
  async getVehicleDocuments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/vehicle-documents${queryString ? `?${queryString}` : ''}`);
  }

  async getVehicleDocument(id) {
    return this.request(`/vehicle-documents/${id}`);
  }

  async createVehicleDocument(documentData) {
    return this.request('/vehicle-documents', {
      method: 'POST',
      body: JSON.stringify(documentData)
    });
  }

  async updateVehicleDocument(id, documentData) {
    return this.request(`/vehicle-documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData)
    });
  }

  async deleteVehicleDocument(id) {
    return this.request(`/vehicle-documents/${id}`, {
      method: 'DELETE'
    });
  }

  async verifyVehicleDocument(id) {
    return this.request(`/vehicle-documents/${id}/verify`, {
      method: 'PATCH'
    });
  }

  async renewVehicleDocument(id, newExpiryDate, newDocumentNumber = null, newPremium = null, notes = '') {
    const data = { newExpiryDate };
    if (newDocumentNumber) data.newDocumentNumber = newDocumentNumber;
    if (newPremium !== null) data.newPremium = newPremium;
    if (notes) data.notes = notes;
    
    return this.request(`/vehicle-documents/${id}/renew`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async getExpiringVehicleDocuments(days = 30, params = {}) {
    const queryString = new URLSearchParams({ days, ...params }).toString();
    return this.request(`/vehicle-documents/expiring${queryString ? `?${queryString}` : ''}`);
  }

  async getExpiredVehicleDocuments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/vehicle-documents/expired${queryString ? `?${queryString}` : ''}`);
  }

  async getVehicleDocumentAnalytics(vehicleId = null) {
    const url = vehicleId 
      ? `/vehicle-documents/vehicle/${vehicleId}/analytics`
      : '/vehicle-documents/analytics';
    return this.request(url);
  }

  async bulkUpdateVehicleDocuments(documentIds, updates) {
    return this.request('/vehicle-documents/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ documentIds, ...updates })
    });
  }

  async getDocumentReminderCandidates() {
    return this.request('/vehicle-documents/reminders');
  }
}

const apiService = new ApiService();
export default apiService;
export { apiService };