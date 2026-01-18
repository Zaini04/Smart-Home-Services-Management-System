import Service from "../../models/servicesModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

export const addService = async (req, res) => {
  try {
    const { title, description, category, price, discountPercentage } =
      req.body;

    if (!title || !description || !category || !price) {
      return errorResponse(res, "All required fields must be filled", 400);
    }

    if (!req.file) {
      return errorResponse(res, "Service image is required", 400);
    }

    let finalPrice = price;

    if (discountPercentage && discountPercentage > 0) {
      finalPrice = price - (price * discountPercentage) / 100;
    }

    const service = await Service.create({
      title,
      description,
      category,
      price,
      finalPrice,
      discount: {
        percentage: discountPercentage || 0,
      },
      image: {
        url: `/uploads/services/${req.file.filename}`,
      },
      createdBy: req.user._id,
    });

    return successResponse(res, "Service added successfully", service, 201);
  } catch (error) {
    return errorResponse(res, "Failed to add service", 500, error.message);
  }
};

export const getAllServices = async (req,res)=>{
  try {
    const allServices = await Service.find().sort({createdAt: -1})

    if(allServices.length === 0){
        return errorResponse(res, "No services found", 404);
    }
    return successResponse(res,"All Services ",allServices, 200)
  } catch (error) {
        return errorResponse(res, "Failed to fetch Services", 500, error.message);
  }
}
