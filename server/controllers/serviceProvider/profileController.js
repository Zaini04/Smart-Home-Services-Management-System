import Category from "../../models/categoryModel.js";
import ServiceProvider from "../../models/service_providerModel.js";
import SubCategory from "../../models/subCategoryModel.js";
import User from "../../models/userModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

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

    const serviceCategories = JSON.parse(req.body.serviceCategories || "[]");
    const skills = JSON.parse(req.body.skills || "[]");

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

    const provider = await ServiceProvider.create({
      userId,
      age,
      description,
      cnic,
      serviceCategories,
      skills,
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
