const normalizeMediaPath = (value) => {
    if (typeof value !== "string") return value;
    if (!value.includes("uploads")) return value;
    return value.replace(/\\/g, "/").replace(/^\/+/, "");
};

const isPlainObject = (value) => {
    if (!value || typeof value !== "object") return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
};

const normalizeResponseData = (input, seen = new WeakSet()) => {
    if (Array.isArray(input)) {
        return input.map((item) => normalizeResponseData(item, seen));
    }

    if (input && typeof input === "object") {
        if (seen.has(input)) return input;
        seen.add(input);

        // Normalize Mongoose documents safely.
        if (typeof input.toObject === "function") {
            return normalizeResponseData(input.toObject(), seen);
        }

        if (isPlainObject(input)) {
            return Object.fromEntries(
                Object.entries(input).map(([key, value]) => [key, normalizeResponseData(value, seen)])
            );
        }
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

export const errorResponse = (res,message,statusCode = 500,errors=null,extra = null)=>{
    const response = {
        success:false,
        message,
        errors,
        ...extra
    }

    return res.status(statusCode).json(response)
}
