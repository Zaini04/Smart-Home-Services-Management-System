import axiosInstance from "./apiInstance";

export const getMyNotifications = () => {
  return axiosInstance.get("/api/notifications");
};

export const markNotificationsAsRead = () => {
  return axiosInstance.put("/api/notifications/mark-read");
};