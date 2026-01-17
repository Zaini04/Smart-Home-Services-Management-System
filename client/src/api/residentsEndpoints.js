import axiosIntance from "./apiinstance"

export const getWorkers = ()=>{
    return axiosIntance.get('/api/residents/getWorkers')
}
export const getServices = ()=>{
    return axiosIntance.get('/api/residents/getServices')
}

