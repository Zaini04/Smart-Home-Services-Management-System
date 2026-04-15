import axios from "axios";
import { getApiBaseUrl } from "../utils/url";

const API_BASE_URL = getApiBaseUrl();

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor → attach token before every request
axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor → handle expired token & refresh
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // If no response (server down, CORS, etc.)
    if (!error.response) {
      return Promise.reject(error);
    }

    // Avoid infinite loop on the refresh endpoint itself
    if (originalRequest.url.includes("/api/user/refreshToken")) {
      // Refresh endpoint itself failed — clear auth and signal logout
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:logout"));
      return Promise.reject(error);
    }

    // If token expired
    if (
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // Call refresh using plain axios (no interceptors)
        const { data } = await axios.post(
          `${API_BASE_URL}/api/user/refreshToken`,
          {},
          { withCredentials: true }
        );

        if (data.success) {
          // Save new token
          localStorage.setItem("accessToken", data.accessToken);

          // Update default headers for future requests
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${data.accessToken}`;

          // Retry original request with new token
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${data.accessToken}`;
          return axiosInstance(originalRequest);
        } else {
          // Refresh returned success:false — clear auth
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("auth:logout"));
        }
      } catch (err) {
        console.error("Refresh Failed", err);
        // Clear all auth data from localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        // Dispatch a custom event so AuthContext can clear React state
        // and let React Router redirect to /login — NO hard page reload
        window.dispatchEvent(new Event("auth:logout"));
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
