import axiosInstance from "./apiInstance"

export const login = (credientals)=>{
    return axiosInstance.post('/api/user/login',credientals)
}

export const logout = ()=>{
    return axiosInstance.post('/api/user/logout')
}

export const signUp = (credientals)=>{
    return axiosInstance.post('/api/user/signup',credientals)
}

export const forgotPassword = (data) => {
  return axiosInstance.post("/api/user/forgot-password", data);
};

export const resetPassword = (token, data) => {
  return axiosInstance.put(`/api/user/reset-password/${token}`, data);
};
export const verifyEmailOTP = (data) => {
  return axiosInstance.post("/api/user/verify-otp", data);
};