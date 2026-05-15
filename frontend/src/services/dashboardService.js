// frontend/src/services/dashboardService.js
import apiService from './apiService';

export const dashboardService = {
  getSystemStats: () => apiService.getSystemStats(),
  
  getVehiclesNeedingService: () => apiService.getVehiclesNeedingService(),
  
  getExpiringDocuments: (days = 30) => apiService.getExpiringVehicleDocuments(days),
  
  getUpcomingMaintenance: (params = {}) => apiService.getUpcomingMaintenance(params),
  
  getUnverifiedFuelRecords: (params = {}) => apiService.getUnverifiedFuelRecords(params),
  
  clearCache: () => {
    console.log('Cache cleared');
  }
};