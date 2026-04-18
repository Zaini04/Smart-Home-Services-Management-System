import axiosInstance from "./apiInstance";

export const getPublicSlides = () => {
  return axiosInstance.get("/api/public/slider");
};

export const submitSupportTicket = (payload) => {
  return axiosInstance.post("/api/public/support", payload);
};
