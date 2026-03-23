import axiosInstance from "./apiinstance";

export const getMyNotifications = () => {
  return axiosInstance.get("/api/notifications");
};

export const markNotificationsAsRead = () => {
  return axiosInstance.put("/api/notifications/mark-read");
};