import axiosInstance from "./apiinstance"

export const completeProfile = (profileData)=>{
    return axiosInstance.post('/api/serviceProvider/completeProfile',profileData)
}

export const getCategoriesWithSkills = ()=>{
    return axiosInstance.get('/api/serviceProvider/getCategoriesWithSkills')
}

export const getProviderStatus = (userId) =>{
    return axiosInstance.get(`/api/serviceProvider/status/${userId}`)
}

export const getProviderProfile = (userId) => {
    return axiosInstance.get(`/api/serviceProvider/profile/${userId}`)

}

export const updateProviderProfile = (userId, formData) => {
    return axiosInstance.put(`/api/serviceProvider/profile/${userId}`,formData)
}

// booking routes
export const getProviderDashboard = () => {
  return axiosInstance.get("/api/provider/dashboard");
};

export const getAvailableBookings = () => {
  return axiosInstance.get("/api/provider/available-jobs");
};

export const getMyJobs = (params) => {
  return axiosInstance.get("/api/provider/my-jobs", { params });
};

export const getMyOffers = () => {
  return axiosInstance.get("/api/provider/my-offers");
};

export const getJobDetails = (bookingId) => {
  return axiosInstance.get(`/api/provider/job/${bookingId}`);
};

export const sendOrUpdateOffer = (bookingId, data) => {
  return axiosInstance.post(`/api/provider/offer/${bookingId}`, data);
};

export const verifyStartOTP = (bookingId, data) => {
  return axiosInstance.post(`/api/provider/verify-otp/${bookingId}`, data);
};

export const completeInspection = (bookingId, data) => {
  return axiosInstance.post(`/api/provider/complete-inspection/${bookingId}`, data);
};

export const sendFinalPrice = (bookingId, data) => {
  return axiosInstance.post(`/api/provider/send-price/${bookingId}`, data);
};

export const startWork = (bookingId) => {
  return axiosInstance.post(`/api/provider/start-work/${bookingId}`);
};

export const completeWork = (bookingId) => {
  return axiosInstance.post(`/api/provider/complete-work/${bookingId}`);
};