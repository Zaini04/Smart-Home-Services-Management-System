import axiosIntance from "./apiinstance"

export const completeProfile = (profileData)=>{
    return axiosIntance.post('/api/serviceProvider/completeProfile',profileData)
}

export const getCategoriesWithSkills = ()=>{
    return axiosIntance.get('/api/serviceProvider/getCategoriesWithSkills')
}