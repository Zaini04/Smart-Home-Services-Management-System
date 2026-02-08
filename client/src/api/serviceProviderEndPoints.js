import axiosIntance from "./apiinstance"

export const completeProfile = (profileData)=>{
    return axiosIntance.post('/api/serviceProvider/completeProfile',profileData)
}

export const getCategoriesWithSkills = ()=>{
    return axiosIntance.get('/api/serviceProvider/getCategoriesWithSkills')
}

export const getProviderStatus = (userId) =>{
    return axiosIntance.get(`/api/serviceProvider/status/${userId}`)
}

export const getProviderProfile = (userId) => {
    return axiosIntance.get(`/api/serviceProvider/profile/${userId}`)

}

export const updateProviderProfile = (userId, formData) => {
    return axiosIntance.put(`/api/serviceProvider/profile/${userId}`,formData)
}