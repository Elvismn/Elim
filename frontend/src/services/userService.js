// frontend/src/services/userService.js
import apiService from './apiService';

export const userService = {
  // Get current user profile
  getProfile: () => apiService.getProfile(),
  
  // Update user profile (name and email)
  updateProfile: (name, email) => apiService.updateProfile(name, email),
  
  // Change password
  changePassword: (currentPassword, newPassword) => apiService.changePassword(currentPassword, newPassword),
  
  // Get system statistics
  getSystemStats: () => apiService.getSystemStats(),
  
  // Setup initial admin account (first time setup)
  setupAdmin: (name, email, password) => apiService.setupAdmin(name, email, password)
};

export default userService;