import axiosInstance from "./apiInstance";



export const getAdminDashboardStats = () => {
  return axiosInstance.get("/api/admin/platform/dashboard");
};
export const getComprehensiveAnalytics = () => {
  return axiosInstance.get("/api/admin/platform/comprehensive-analytics"); // Adjust path based on your route setup
};
/* ===================== WORKERS ===================== */


export const getPendingWorkers = () => {
  return axiosInstance.get("/api/admin/getPendingWorkers");
};

export const updateKyc = (providerId, payload) => {
  return axiosInstance.put(
    `/api/admin/update-KYC/${providerId}`,
    payload
  );
};

export const getAllWorkers = ()=>{
    return axiosInstance.get("/api/admin/getAllWorkers")
}

/* ===================== CATEGORIES ===================== */
export const createCategory = (payload) => {
  return axiosInstance.post("/api/admin/createCategory", payload);
};

export const getCategories = () => {
  return axiosInstance.get("/api/admin/categories");
};

export const updateCategory = (categoryId, payload) => {
  return axiosInstance.put(
    `/api/admin/category/${categoryId}`,
    payload
  );
};

export const deleteCategory = (categoryId) => {
  return axiosInstance.delete(
    `/api/admin/category/${categoryId}`
  );
};

/* ===================== SUB CATEGORIES ===================== */
export const createSubCategory = (payload) => {
  return axiosInstance.post(
    "/api/admin/subCategory/createSubCategory",
    payload
  );
};

export const updateSubCategory = (subCategoryId, payload) => {
  return axiosInstance.put(
    `/api/admin/subCategory/${subCategoryId}`,
    payload
  );
};

export const deleteSubCategory = (subCategoryId) => {
  return axiosInstance.delete(
    `/api/admin/subCategory/${subCategoryId}`
  );
};

export const getCategoriesWithSkills = ()=>{
    return axiosInstance.get('/api/admin/getCategoriesWithSkills')
}


// ... existing code stays ...

// ── PLATFORM EARNINGS ──

export const getPlatformDashboard = () => {
  return axiosInstance.get("/api/admin/platform/dashboard");
};

export const getPlatformWallet = () => {
  return axiosInstance.get("/api/admin/platform/wallet");
};

export const getPlatformTransactions = (params) => {
  return axiosInstance.get("/api/admin/platform/transactions", { params });
};

export const adminWithdraw = (data) => {
  return axiosInstance.post("/api/admin/platform/withdraw", data);
};

export const getEarningsReport = (params) => {
  return axiosInstance.get("/api/admin/platform/earnings-report", { params });
};

export const getTopProviders = (params) => {
  return axiosInstance.get("/api/admin/platform/top-providers", { params });
};

export const viewProviderWallet = (providerId) => {
  return axiosInstance.get(
    `/api/admin/platform/provider-wallet/${providerId}`
  );
};