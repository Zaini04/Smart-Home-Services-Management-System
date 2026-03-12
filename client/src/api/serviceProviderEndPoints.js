import axiosInstance from "./apiinstance"

export const completeProfile = (profileData) => {
  return axiosInstance.post('/api/serviceProvider/completeProfile', profileData)
}

export const getCategoriesWithSkills = () => {
  return axiosInstance.get('/api/serviceProvider/getCategoriesWithSkills')
}

export const getProviderStatus = (userId) => {
  return axiosInstance.get(`/api/serviceProvider/status/${userId}`)
}

export const getProviderProfile = (userId) => {
  return axiosInstance.get(`/api/serviceProvider/profile/${userId}`)
}

export const updateProviderProfile = (userId, formData) => {
  return axiosInstance.put(`/api/serviceProvider/profile/${userId}`, formData)
}

// booking routes
export const getProviderDashboard = () => {
  return axiosInstance.get("/api/serviceProvider/dashboard");
};

export const getAvailableBookings = () => {
  return axiosInstance.get("/api/serviceProvider/available-jobs");
};

export const getMyJobs = (params) => {
  return axiosInstance.get("/api/serviceProvider/my-jobs", { params });
};

export const getMyOffers = () => {
  return axiosInstance.get("/api/serviceProvider/my-offers");
};

export const getJobDetails = (bookingId) => {
  return axiosInstance.get(`/api/serviceProvider/job/${bookingId}`);
};

// Offer — only laborEstimate + message (no inspection fields)
export const sendOrUpdateOffer = (bookingId, data) => {
  return axiosInstance.post(`/api/serviceProvider/offer/${bookingId}`, data);
};

export const verifyStartOTP = (bookingId, data) => {
  return axiosInstance.post(`/api/serviceProvider/verify-otp/${bookingId}`, data);
};

export const completeInspection = (bookingId, data) => {
  return axiosInstance.post(`/api/serviceProvider/complete-inspection/${bookingId}`, data);
};

export const sendFinalPrice = (bookingId, data) => {
  return axiosInstance.post(`/api/serviceProvider/send-price/${bookingId}`, data);
};

export const startWork = (bookingId) => {
  return axiosInstance.post(`/api/serviceProvider/start-work/${bookingId}`);
};

export const completeWork = (bookingId) => {
  return axiosInstance.post(`/api/serviceProvider/complete-work/${bookingId}`);
};

// Inspection — provider requests inspection with fee + message
export const requestInspection = (bookingId, data) => {
  return axiosInstance.post(
    `/api/serviceProvider/request-inspection/${bookingId}`,
    data
  );
};

// Provider responds to resident's counter offer on inspection fee
export const respondToCounterFee = (bookingId, data) => {
  return axiosInstance.post(
    `/api/serviceProvider/respond-counter-fee/${bookingId}`,
    data
  );
};

export const updatePriceDuringWork = (bookingId, data) => {
  return axiosInstance.post(
    `/api/serviceProvider/update-price/${bookingId}`,
    data
  );
};

export const updateSchedule = (bookingId, data) => {
  return axiosInstance.post(
    `/api/serviceProvider/update-schedule/${bookingId}`,
    data
  );
};

export const providerCancelJob = (bookingId, data) => {
  return axiosInstance.post(
    `/api/serviceProvider/cancel-job/${bookingId}`,
    data
  );
};

// ── WALLET ENDPOINTS ──
export const getProviderWallet = () => {
  return axiosInstance.get("/api/serviceProvider/wallet");
};

export const topUpWallet = (data) => {
  return axiosInstance.post("/api/serviceProvider/wallet/topup", data);
};

export const withdrawFromWallet = (data) => {
  return axiosInstance.post("/api/serviceProvider/wallet/withdraw", data);
};

export const getWalletTransactions = (params) => {
  return axiosInstance.get("/api/serviceProvider/wallet/transactions", { params });
};
