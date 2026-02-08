// controllers/admin/serviceController.js
import Service from "../../models/servicesModel.js";
import Category from "../../models/categoryModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

/**
 * ADD SERVICE
 */
export const addService = async (req, res) => {
  try {
    const { title, description, category, price, discountPercentage } = req.body;

    if (!title || !description || !category || !price) {
      return errorResponse(res, "All required fields must be filled", 400);
    }

    if (!req.file) {
      return errorResponse(res, "Service image is required", 400);
    }

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return errorResponse(res, "Invalid category. Please select a valid category.", 400);
    }

    // Calculate final price
    let finalPrice = parseFloat(price);
    if (discountPercentage && parseFloat(discountPercentage) > 0) {
      finalPrice = finalPrice - (finalPrice * parseFloat(discountPercentage)) / 100;
    }

    const service = await Service.create({
      title,
      description,
      category, // Now stores the ObjectId
      price: parseFloat(price),
      finalPrice,
      discount: { percentage: parseFloat(discountPercentage) || 0 },
      image: {
        url: `/uploads/services/${req.file.filename}`,
      },
      createdBy: req.user._id,
    });

    // Populate category before returning
    await service.populate('category', 'name');

    return successResponse(res, "Service added successfully", service, 201);
  } catch (error) {
    console.error("Add service error:", error);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return errorResponse(res, "Invalid category ID format", 400);
    }
    return errorResponse(res, "Failed to add service", 500, error.message);
  }
};

/**
 * GET ALL SERVICES
 */
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate('category', 'name')  // This populates the category with its name
      .populate('createdBy', 'full_name')
      .sort({ createdAt: -1 });

    // Return empty array instead of error if no services
    return successResponse(res, "All services", services, 200);
  } catch (error) {
    console.error("Get services error:", error);
    return errorResponse(res, "Failed to fetch services", 500, error.message);
  }
};

/**
 * UPDATE SERVICE
 */
export const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { title, description, category, price, discountPercentage, status } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return errorResponse(res, "Service not found", 404);
    }

    // Validate and update category if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return errorResponse(res, "Invalid category", 400);
      }
      service.category = category;
    }

    // Update fields
    if (title) service.title = title;
    if (description) service.description = description;
    if (status) service.status = status;
    
    if (price !== undefined) {
      service.price = parseFloat(price);
    }
    
    if (discountPercentage !== undefined) {
      service.discount = { 
        ...service.discount,
        percentage: parseFloat(discountPercentage) || 0 
      };
    }

    // Calculate final price
    const discountPct = service.discount?.percentage || 0;
    service.finalPrice = service.price - (service.price * discountPct) / 100;

    // Handle image
    if (req.file) {
      service.image = {
        url: `/uploads/services/${req.file.filename}`,
      };
    }

    await service.save();
    await service.populate('category', 'name');

    return successResponse(res, "Service updated successfully", service, 200);
  } catch (error) {
    console.error("Update service error:", error);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return errorResponse(res, "Invalid ID format", 400);
    }
    return errorResponse(res, "Failed to update service", 500, error.message);
  }
};

/**
 * DELETE SERVICE (SOFT DELETE)
 */
export const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findByIdAndUpdate(
      serviceId,
      { status: "inactive" },
      { new: true }
    ).populate('category', 'name');

    if (!service) {
      return errorResponse(res, "Service not found", 404);
    }

    return successResponse(res, "Service deactivated successfully", service, 200);
  } catch (error) {
    return errorResponse(res, "Failed to delete service", 500, error.message);
  }
};