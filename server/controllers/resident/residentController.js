import Category from "../../models/categoryModel.js";
import ServiceProvider from "../../models/service_providerModel.js";
import Service from "../../models/servicesModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

export const getApprovedProviders = async (req, res) => {
  try {
    const providers = await ServiceProvider.find({
      kycStatus: "approved",
    }).populate(
      "userId",
      "full_name city profileImage description age experience status visitPrice hourlyRate "
    );

    if (providers.length === 0) {
      return errorResponse(res, "No approved providers found", 404);
    }

    return successResponse(res, "Approved providers", providers, 200);
  } catch (error) {
    return errorResponse(
      res,
      "Failed to get approved workers",
      500,
      error.message
    );
  }
};

export const getActiveServices = async (req, res) => {
  try {
    const services = await Service.find({ status: "active" });
    if (services.length <= 0) {
      return errorResponse(res, "Services not availabe right now", 404);
    }

    return successResponse(res, "All Active Services", services, 200);
  } catch (error) {
    return errorResponse(res, "Failed to get Services", 500, error.message);
  }
};

export const getCategories  = async (req,res)=>{
  try {
    const categories = await Category.find({isActive:true})
    if(categories.length <=0){
      return errorResponse(res, "Categories not availabe right now", 404);
    }

    return successResponse(res, "All Active Categories", categories, 200)
  } catch (error) {
      return errorResponse(res, "Failed to get Categories", 500, error.message);
  }
}