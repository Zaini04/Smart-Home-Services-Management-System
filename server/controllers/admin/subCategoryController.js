import SubCategory from "../../models/subCategoryModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

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