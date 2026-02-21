import axiosInstance from "./apiinstance"

export const login = (credientals)=>{
    return axiosInstance.post('/api/user/login',credientals)
}

export const logout = ()=>{
    return axiosInstance.post('/api/user/logout')
}

export const signUp = (credientals)=>{
    return axiosInstance.post('/api/user/signup',credientals)
}

