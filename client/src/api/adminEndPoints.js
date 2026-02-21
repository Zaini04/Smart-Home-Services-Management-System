import axios from "axios";
import axiosInstance from "./apiinstance";

/* ===================== SERVICES ===================== */
export const addService = (formData) => {
  return axiosInstance.post("/api/admin/addService", formData);
};

export const getAllServices = () => {
  return axiosInstance.get("/api/admin/services");
};

export const updateService = (serviceId, formData) => {
  return axiosInstance.put(
    `/api/admin/service/${serviceId}`,
    formData
  );
};

export const deleteService = (serviceId) => {
  return axiosInstance.delete(
    `/api/admin/service/${serviceId}`
  );
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