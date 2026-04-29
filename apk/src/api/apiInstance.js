import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getSecureItem, setSecureItem, removeSecureItem } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform, Alert } from 'react-native';

// Use localhost for Web to prevent Chrome cross-site strict cookie blocking
// Use specific IP for actual physical devices to find the server
const BASE_URL = Platform.OS === 'web' 
  ? 'https://smart-home-services-management-system-production.up.railway.app/' 
  : 'https://smart-home-services-management-system-production.up.railway.app/';
const API_ORIGIN = BASE_URL.replace(/\/+$/, '');
const REFRESH_ENDPOINT = '/api/user/refreshToken';

const axiosInstance = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: true,
  timeout: 60000,
});

let isRefreshing = false;
let refreshFailed = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

axiosRetry(axiosInstance, { 
  retries: 4, 
  retryDelay: (retryCount) => 1000 * retryCount, // 1s, 2s, 3s, 4s
  retryCondition: (error) => {
    const config = error?.config || {};
    const requestUrl = config?.url || '';
    const contentType =
      config?.headers?.['Content-Type'] || config?.headers?.['content-type'] || '';
    const isMultipart = String(contentType).includes('multipart/form-data');
    const shouldSkipRetry = Boolean(config?.__skipRetry) || requestUrl.includes('/api/chat/upload');
    if (shouldSkipRetry || isMultipart) return false;

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
      if (Platform.OS !== 'web' && !originalRequest?.__skipNetworkAlert) {
        Alert.alert(
          'Network Error', 
          'The server took too long to respond or the connection dropped. We tried 4 times automatically. Please check your WiFi and try again.'
        );
      }
      return Promise.reject(error);
    }

    // Avoid infinite loop on refresh endpoint
    if (originalRequest?.url?.includes(REFRESH_ENDPOINT)) {
      return Promise.reject(error);
    }

    // If refresh already failed once, don't keep auto-refreshing.
    if (refreshFailed && (error.response.status === 401 || error.response.status === 403)) {
      return Promise.reject(error);
    }

    // If token expired
    if (
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${API_ORIGIN}${REFRESH_ENDPOINT}`,
          {},
          { withCredentials: true }
        );

        if (data.success) {
          refreshFailed = false;
          await setSecureItem('accessToken', data.accessToken);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
          processQueue(null, data.accessToken);
          return axiosInstance(originalRequest);
        }

        throw new Error('Refresh token response was not successful');
      } catch (err) {
        console.error('Refresh Failed', err);
        refreshFailed = true;
        processQueue(err, null);
        await removeSecureItem('accessToken');
        await AsyncStorage.removeItem('user');
        delete axiosInstance.defaults.headers.common['Authorization'];
        // Navigation to login will be handled by auth context
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { BASE_URL };
export default axiosInstance;
