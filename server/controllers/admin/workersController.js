import ServiceProvider from "../../models/service_providerModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

export const getAllProviders = async(req,res)=>{
  try {
    const allProviders = await ServiceProvider.find().sort({createdAt: -1})
     if(allProviders.length === 0){
        return errorResponse(res, "No services found", 404);
    }
    return successResponse(res,"All Services ",allProviders, 200)
  } catch (error) {
        return errorResponse(res, "Failed to fetch Service Provdiers", 500, error.message);

  } 
}
export const getPendingWorkers = async (req, res) => {
  try {
    const pendingProviders = await ServiceProvider.find({
      kycStatus: "pending",
    }).populate(
      "userId",
      "full_name email phone city address profileImage cnicFrontImage cnicBackImage visitPrice hourlyRate cnic description"
    );

    if (pendingProviders.length === 0) {
      return errorResponse(res, "No pending providers", 404);
    }

    return successResponse(res, "Pending Providers", pendingProviders, 200);
  } catch (error) {
    return errorResponse(
      res,
      "Failed To get Pending Workers",
      500,
      error.message
    );
  }
};

export const updateKycStatus = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { status, message } = req.body;
    // status = approved | rejected
    // message = admin feedback

    if (!["approved", "rejected"].includes(status)) {
      return errorResponse(res, "Invalid KYC status", 400);
    }

    const provider = await ServiceProvider.findByIdAndUpdate(
      providerId,
      {
        kycStatus: status,
        kycMessage: message || "",
      },
      { new: true }
    ).populate("userId", "full_name email");

    if (!provider) {
      return errorResponse(res, "Provider not found", 404);
    }

    return successResponse(
      res,
      `Provider ${status} successfully`,
      provider,
      200
    );
  } catch (error) {
    return errorResponse(res, "Failed to update kyc", 500, error.message);
  }
};