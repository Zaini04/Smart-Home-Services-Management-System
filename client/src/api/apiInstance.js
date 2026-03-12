import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
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

    // Avoid infinite loop
    if (originalRequest.url.includes("/api/user/refreshToken")) {
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
          `${import.meta.env.VITE_BASE_URL}/api/user/refreshToken`,
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
        }
      } catch (err) {
        console.error("Refresh Failed", err);
        localStorage.removeItem("accessToken");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
