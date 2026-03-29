import axios from 'axios';
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
  timeout: 15000,
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
      console.error('[Network Error]: Server unreachable.', error.message);
      if (Platform.OS !== 'web') {
        Alert.alert('Network Error', 'Cannot connect to Server. If using a physical device, ensure your PC and phone are on the exact same Wi-Fi network, and Windows Defender Firewall is turned OFF for Private networks (or it explicitly allows port 5000 inbound). If using Android Emulator, set BASE_URL to 10.0.2.2.');
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
