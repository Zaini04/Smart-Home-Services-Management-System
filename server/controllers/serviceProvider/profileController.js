import Category from "../../models/categoryModel.js";
import ServiceProvider from "../../models/service_providerModel.js";
import SubCategory from "../../models/subCategoryModel.js";
import User from "../../models/userModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

import mongoose from "mongoose";


export const completeProviderProfile = async (req, res) => {
  try {
    const {
      userId,
      age,
      description,
      cnic,
      experience,
      visitPrice,
      hourlyRate,
    } = req.body;

    // Parse JSON strings safely
    let serviceCategories = [];
    let skills = [];

    try {
      serviceCategories = JSON.parse(req.body.serviceCategories || "[]");
      skills = JSON.parse(req.body.skills || "[]");
    } catch (parseError) {
      return errorResponse(res, "Invalid JSON format for categories or skills", 400);
    }

    // ✅ Filter out any invalid ObjectIds (keeps only valid ones)
    serviceCategories = serviceCategories.filter(id => 
      mongoose.Types.ObjectId.isValid(id)
    );
    
    skills = skills.filter(id => 
      mongoose.Types.ObjectId.isValid(id)
    );

    // Validation
    if (
      !userId ||
      !age ||
      !description ||
      !cnic ||
      !experience ||
      serviceCategories.length === 0
    ) {
      return errorResponse(res, "Missing required fields", 400);
    }

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, "User not found", 404);

    if (user.role !== "serviceprovider") {
      return errorResponse(res, "Invalid role", 400);
    }

    const exists = await ServiceProvider.findOne({ userId });
    if (exists) {
      return errorResponse(res, "Profile already exists", 400);
    }

    if (
      !req.files?.cnicFront ||
      !req.files?.cnicBack ||
      !req.files?.profileImage
    ) {
      return errorResponse(res, "All images are required", 400);
    }

    // ✅ Convert to ObjectIds before saving
    const provider = await ServiceProvider.create({
      userId,
      age,
      description,
      cnic,
      serviceCategories: serviceCategories.map(id => new mongoose.Types.ObjectId(id)),
      skills: skills.map(id => new mongoose.Types.ObjectId(id)),
      experience,
      visitPrice,
      hourlyRate,
      cnicFrontImage: req.files.cnicFront[0].path,
      cnicBackImage: req.files.cnicBack[0].path,
      profileImage: req.files.profileImage[0].path,
    });

    return successResponse(
      res,
      "Profile completed successfully",
      provider,
      201
    );
  } catch (err) {
    console.error("Complete Profile Error:", err);
    return errorResponse(res, "Failed to complete profile", 500, err.message);
  }
};
export const getCategoriesWithSkills = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).lean();

    const result = await Promise.all(
      categories.map(async (cat) => {
        const subCategories = await SubCategory.find({
          categoryId: cat._id,
          isActive: true,
        }).lean();

        return {
          ...cat,
          subCategories,
        };
      })
    );

    return successResponse(res, "Categories with skills", result, 200);
  } catch (error) {
    return errorResponse(res, "Failed to complete profile", 500, err.message);
  }
};
// ✅ Get Provider KYC Status
export const getProviderStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const provider = await ServiceProvider.findOne({ userId })
      .select("kycStatus kycMessage profileImage")
      .populate("userId", "name email");

    if (!provider) {
      return errorResponse(res, "Provider profile not found", 404);
    }

    return successResponse(res, "Provider status fetched", {
      kycStatus: provider.kycStatus,
      kycMessage: provider.kycMessage,
      profileImage: provider.profileImage,
      user: provider.userId
    });
  } catch (err) {
    return errorResponse(res, "Failed to fetch status", 500, err.message);
  }
};

// ✅ Get Full Provider Profile (for editing)
export const getProviderProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const provider = await ServiceProvider.findOne({ userId })
      .populate("userId", "name email phone")
      .populate("serviceCategories", "name")
      .populate("skills", "name");

    if (!provider) {
      return errorResponse(res, "Provider profile not found", 404);
    }

    return successResponse(res, "Provider profile fetched", provider);
  } catch (err) {
    return errorResponse(res, "Failed to fetch profile", 500, err.message);
  }
};

// ✅ Update Provider Profile (after rejection)
export const updateProviderProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      age,
      description,
      cnic,
      experience,
      visitPrice,
      hourlyRate,
    } = req.body;

    let serviceCategories = [];
    let skills = [];

    try {
      serviceCategories = JSON.parse(req.body.serviceCategories || "[]");
      skills = JSON.parse(req.body.skills || "[]");
    } catch (parseError) {
      return errorResponse(res, "Invalid JSON format", 400);
    }

    // Filter valid ObjectIds
    serviceCategories = serviceCategories.filter(id => 
      mongoose.Types.ObjectId.isValid(id)
    );
    skills = skills.filter(id => 
      mongoose.Types.ObjectId.isValid(id)
    );

    const provider = await ServiceProvider.findOne({ userId });

    if (!provider) {
      return errorResponse(res, "Provider not found", 404);
    }

    // Only allow update if rejected
    if (provider.kycStatus !== "rejected") {
      return errorResponse(res, "Can only update rejected profiles", 400);
    }

    // Update fields
    provider.age = age || provider.age;
    provider.description = description || provider.description;
    provider.cnic = cnic || provider.cnic;
    provider.experience = experience || provider.experience;
    provider.visitPrice = visitPrice || provider.visitPrice;
    provider.hourlyRate = hourlyRate || provider.hourlyRate;
    provider.serviceCategories = serviceCategories.length > 0 
      ? serviceCategories.map(id => new mongoose.Types.ObjectId(id)) 
      : provider.serviceCategories;
    provider.skills = skills.length > 0 
      ? skills.map(id => new mongoose.Types.ObjectId(id)) 
      : provider.skills;

    // Update images if provided
    if (req.files?.cnicFront) {
      provider.cnicFrontImage = req.files.cnicFront[0].path;
    }
    if (req.files?.cnicBack) {
      provider.cnicBackImage = req.files.cnicBack[0].path;
    }
    if (req.files?.profileImage) {
      provider.profileImage = req.files.profileImage[0].path;
    }

    // Reset to pending for re-review
    provider.kycStatus = "pending";
    provider.kycMessage = "";

    await provider.save();

    return successResponse(res, "Profile updated and resubmitted for review", provider);
  } catch (err) {
    return errorResponse(res, "Failed to update profile", 500, err.message);
  }
};