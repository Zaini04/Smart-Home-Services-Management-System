import SubCategory from "../../models/subCategoryModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

/**
 * CREATE SUBCATEGORY
 */
export const createSubCategory = async (req, res) => {
  try {
    const { categoryId, name, isActive = true } = req.body;

    if (!categoryId || !name) {
      return errorResponse(res, "Category and name are required", 400);
    }

    const exists = await SubCategory.findOne({ categoryId, name });
    if (exists) {
      return errorResponse(res, "Subcategory already exists", 400);
    }

    const subCategory = await SubCategory.create({
      categoryId,
      name,
      isActive
    });

    return successResponse(res, "Subcategory created successfully", subCategory, 201);
  } catch (error) {
    return errorResponse(res, "Failed to create subcategory", 500, error.message);
  }
};

/**
 * UPDATE SUBCATEGORY
 */
export const updateSubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const { name, isActive } = req.body;

    const subCategory = await SubCategory.findByIdAndUpdate(
      subCategoryId,
      { name, isActive },
      { new: true }
    );

    if (!subCategory) {
      return errorResponse(res, "Subcategory not found", 404);
    }

    return successResponse(res, "Subcategory updated successfully", subCategory, 200);
  } catch (error) {
    return errorResponse(res, "Failed to update subcategory", 500, error.message);
  }
};

/**
 * DELETE SUBCATEGORY (Soft Delete)
 */
export const deleteSubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;

    const subCategory = await SubCategory.findByIdAndUpdate(
      subCategoryId,
      { isActive: false },
      { new: true }
    );

    if (!subCategory) {
      return errorResponse(res, "Subcategory not found", 404);
    }

    return successResponse(res, "Subcategory deactivated successfully", subCategory, 200);
  } catch (error) {
    return errorResponse(res, "Failed to delete subcategory", 500, error.message);
  }
};
