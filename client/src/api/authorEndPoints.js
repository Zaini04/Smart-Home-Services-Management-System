import axiosIntance from "./apiinstance"

export const login = (credientals)=>{
    return axiosIntance.post('/api/user/login',credientals)
}

export const logout = ()=>{
    return axiosIntance.post('/api/user/logout')
}

export const signUp = (credientals)=>{
    return axiosIntance.post('/api/user/signup',credientals)
}

