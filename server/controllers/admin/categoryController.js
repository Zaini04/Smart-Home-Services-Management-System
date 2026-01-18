import Category from "../../models/categoryModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

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