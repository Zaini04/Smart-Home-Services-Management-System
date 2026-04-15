const normalizeMediaPath = (value) => {
    if (typeof value !== "string") return value;
    if (!value.includes("uploads")) return value;
    return value.replace(/\\/g, "/");
};

const normalizeResponseData = (input) => {
    if (Array.isArray(input)) {
        return input.map(normalizeResponseData);
    }

    if (input && typeof input === "object") {
        return Object.fromEntries(
            Object.entries(input).map(([key, value]) => [key, normalizeResponseData(value)])
        );
    }

    return normalizeMediaPath(input);
};

export const successResponse = (res,message,data={},statusCode = 200)=>{
    const response = {
        success:true,
        message,
        data: normalizeResponseData(data)
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
