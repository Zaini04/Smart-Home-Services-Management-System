import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getSecureItem, setSecureItem, removeSecureItem } from '../utils/storage';

import { Platform, Alert } from 'react-native';

// Use localhost for Web to prevent Chrome cross-site strict cookie blocking
// Use specific IP for actual physical devices to find the server
const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000' 
  : 'http://192.168.100.58:5000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

axiosRetry(axiosInstance, { 
  retries: 4, 
  retryDelay: (retryCount) => 1000 * retryCount, // 1s, 2s, 3s, 4s
  retryCondition: (error) => {
    // React Native specifically throws a string message 'Network Error' without standard Node error codes
    const isNetworkError = error.message === 'Network Error';
    return isNetworkError || error.code === 'ECONNABORTED' || axiosRetry.isNetworkOrIdempotentRequestError(error);
  }
});

// Request interceptor → attach token before every request
axiosInstance.interceptors.request.use(async (config) => {
  try {
    const accessToken = await getSecureItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  } catch (err) {
    console.warn('Failed to get access token:', err);
  }
  return config;
});

// Response interceptor → handle expired token & refresh
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      console.error('[Network Error API Failed]:', error.message);
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Network Error', 
          'The server took too long to respond or the connection dropped. We tried 4 times automatically. Please check your WiFi and try again.'
        );
      }
      return Promise.reject(error);
    }

    // Avoid infinite loop on refresh endpoint
    if (originalRequest.url?.includes('/api/user/refreshToken')) {
      return Promise.reject(error);
    }

    // If token expired
    if (
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${BASE_URL}/api/user/refreshToken`,
          {},
          { withCredentials: true }
        );

        if (data.success) {
          await setSecureItem('accessToken', data.accessToken);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (err) {
        console.error('Refresh Failed', err);
        await removeSecureItem('accessToken');
        // Navigation to login will be handled by auth context
      }
    }

    return Promise.reject(error);
  }
);

export { BASE_URL };
export default axiosInstance;
