import axiosInstance from './apiInstance';

export const submitSupportTicket = (payload) => {
  return axiosInstance.post('/api/public/support', payload);
};
