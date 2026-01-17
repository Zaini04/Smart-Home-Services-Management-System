import Category from "../models/categoryModel.js";
import ServiceProvider from "../models/service_providerModel.js";
import Service from "../models/servicesModel.js";
import SubCategory from "../models/subCategoryModel.js";
import User from "../models/userModel.js";
import { errorResponse, successResponse } from "../utills/response.js";

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

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const exists = await Category.findOne({ name });
    if (exists) {
      return errorResponse(res, "Category already exists", 400);
    }

    const category = await Category.create({ name, description });

    return successResponse(res, "Category created successfully", category, 201);
  } catch (error) {
    return errorResponse(res, "Failed to create category", 500, error.message);
  }
};

export const createSubCategory = async (req, res) => {
  try {
    const { categoryId, name } = req.body;

    const subCategory = await SubCategory.create({
      categoryId,
      name,
    });

    return successResponse(
      res,
      "Subcategory created successfully",
      subCategory,
      201
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to create subcategory",
      500,
      error.message
    );
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    if (categories.length === 0) {
      return errorResponse(res, "No categories found", 404);
    }

    return successResponse(res, "Categories fetched", categories, 200);
  } catch (error) {
    return errorResponse(res, "Failed to fetch categories", 500, error.message);
  }
};

