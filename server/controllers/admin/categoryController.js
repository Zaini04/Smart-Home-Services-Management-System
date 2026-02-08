import Category from "../../models/categoryModel.js";
import SubCategory from "../../models/subCategoryModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

/**
 * CREATE CATEGORY
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body;

    if (!name) {
      return errorResponse(res, "Category name is required", 400);
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      return errorResponse(res, "Category already exists", 400);
    }

    const category = await Category.create({
      name,
      description,
      isActive
    });

    return successResponse(res, "Category created successfully", category, 201);
  } catch (error) {
    return errorResponse(res, "Failed to create category", 500, error.message);
  }
};

/**
 * GET ALL CATEGORIES (Admin)
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    return successResponse(res, "Categories fetched", categories, 200);
  } catch (error) {
    return errorResponse(res, "Failed to fetch categories", 500, error.message);
  }
};

/**
 * UPDATE CATEGORY
 */
export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name, description, isActive },
      { new: true }
    );

    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }

    return successResponse(res, "Category updated successfully", category, 200);
  } catch (error) {
    return errorResponse(res, "Failed to update category", 500, error.message);
  }
};

/**
 * DELETE CATEGORY (Soft Delete)
 */
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }

    return successResponse(res, "Category deactivated successfully", category, 200);
  } catch (error) {
    return errorResponse(res, "Failed to delete category", 500, error.message);
  }
};


export const getCategoriesWithSkills = async (req, res) => {
  try {
    const categories = await Category.find().lean();

    const result = await Promise.all(
      categories.map(async (cat) => {
        const subCategories = await SubCategory.find({
          categoryId: cat._id,
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