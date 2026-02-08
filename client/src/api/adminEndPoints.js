import axios from "axios";
import axiosIntance from "./apiinstance";

/* ===================== SERVICES ===================== */
export const addService = (formData) => {
  return axiosIntance.post("/api/admin/addService", formData);
};

export const getAllServices = () => {
  return axiosIntance.get("/api/admin/services");
};

export const updateService = (serviceId, formData) => {
  return axiosIntance.put(
    `/api/admin/service/${serviceId}`,
    formData
  );
};

export const deleteService = (serviceId) => {
  return axiosIntance.delete(
    `/api/admin/service/${serviceId}`
  );
};

/* ===================== WORKERS ===================== */
export const getPendingWorkers = () => {
  return axiosIntance.get("/api/admin/getPendingWorkers");
};

export const updateKyc = (providerId, payload) => {
  return axiosIntance.put(
    `/api/admin/update-KYC/${providerId}`,
    payload
  );
};

export const getAllWorkers = ()=>{
    return axiosIntance.get("/api/admin/getAllWorkers")
}

/* ===================== CATEGORIES ===================== */
export const createCategory = (payload) => {
  return axiosIntance.post("/api/admin/createCategory", payload);
};

export const getCategories = () => {
  return axiosIntance.get("/api/admin/categories");
};

export const updateCategory = (categoryId, payload) => {
  return axiosIntance.put(
    `/api/admin/category/${categoryId}`,
    payload
  );
};

export const deleteCategory = (categoryId) => {
  return axiosIntance.delete(
    `/api/admin/category/${categoryId}`
  );
};

/* ===================== SUB CATEGORIES ===================== */
export const createSubCategory = (payload) => {
  return axiosIntance.post(
    "/api/admin/subCategory/createSubCategory",
    payload
  );
};

export const updateSubCategory = (subCategoryId, payload) => {
  return axiosIntance.put(
    `/api/admin/subCategory/${subCategoryId}`,
    payload
  );
};

export const deleteSubCategory = (subCategoryId) => {
  return axiosIntance.delete(
    `/api/admin/subCategory/${subCategoryId}`
  );
};

export const getCategoriesWithSkills = ()=>{
    return axiosIntance.get('/api/admin/getCategoriesWithSkills')
}