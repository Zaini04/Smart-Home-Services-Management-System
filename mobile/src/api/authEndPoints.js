import axiosInstance from './apiInstance';

export const login = (credentials) => {
  return axiosInstance.post('/api/user/login', credentials);
};

export const logout = () => {
  return axiosInstance.post('/api/user/logout');
};

export const signUp = (credentials) => {
  return axiosInstance.post('/api/user/signup', credentials);
};

export const forgotPassword = (data) => {
  return axiosInstance.post('/api/user/forgot-password', data);
};

export const resetPassword = (token, data) => {
  return axiosInstance.put(`/api/user/reset-password/${token}`, data);
};

export const verifyEmailOTP = (data) => {
  return axiosInstance.post('/api/user/verify-otp', data);
};
