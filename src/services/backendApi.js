import { apiClient } from './apiClient';

export const backendApi = {
  auth: {
    register: (payload) => apiClient.post('/api/auth/register', payload),
    login: (payload) => apiClient.post('/api/auth/login', payload),
    refresh: () => apiClient.post('/api/auth/refresh', {}),
    logout: () => apiClient.post('/api/auth/logout', {})
  },
  bookings: {
    complete: (payload) => apiClient.post('/api/bookings/complete', payload)
  },
  relationships: {
    forCustomer: (customerId) => apiClient.get(`/api/relationships/active/customer/${customerId}`),
    forTherapist: (therapistId) => apiClient.get(`/api/relationships/active/therapist/${therapistId}`)
  },
  carePlans: {
    forCustomer: (customerId) => apiClient.get(`/api/care-plans/customer/${customerId}`),
    forTherapist: (therapistId) => apiClient.get(`/api/care-plans/therapist/${therapistId}`)
  },
  sessionHistory: {
    forCustomer: (customerId) => apiClient.get(`/api/session-history/customer/${customerId}`),
    forTherapist: (therapistId) => apiClient.get(`/api/session-history/therapist/${therapistId}`)
  }
};

export default backendApi;
