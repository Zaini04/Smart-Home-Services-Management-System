import axiosIntance from "./apiinstance";

export const addService = (formData)=>{
    return axiosIntance.post('/api/admin/addService',formData)
}

export const getPendingWorkers = ()=>{
    return axiosIntance.get('/api/admin/getPendingWorkers')
}

export const updateKyc = (providerId,payload)=>{
    return axiosIntance.put(`/api/admin/update-KYC/${providerId}`,payload)
}

export const createCategory = (payload)=>{
    return axiosIntance.post('/api/admin/createCategory',payload)
}

export const createSubCategory = (payload)=>{
    return axiosIntance.post('/api/admin/createSubCategory',payload)
}

export const getCategories = () => {
  return axiosIntance.get("/api/admin/categories");
};



