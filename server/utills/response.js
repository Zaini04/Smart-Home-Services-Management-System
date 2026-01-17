export const successResponse = (res,message,data={},statusCode = 200)=>{
    const response = {
        success:true,
        message,
        data
    }

    return res.status(statusCode).json(response)
}

export const errorResponse = (res,message,statusCode = 500,errors=null)=>{
    const response = {
        success:false,
        message,
        errors
    }

    return res.status(statusCode).json(response)
}
