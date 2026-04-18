import Slider from "../../models/sliderModel.js";
import User from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import { errorResponse, successResponse } from "../../utills/response.js";

// @route   GET /api/admin/settings/slides
// @desc    Get all slides
// @access  Admin
export const getSlides = async (req, res) => {
  try {
    const slides = await Slider.find().sort({ order: 1, createdAt: -1 });
    return successResponse(res, "Slides retrieved successfully", slides, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @route   POST /api/admin/settings/slides
// @desc    Add a new slide
// @access  Admin
export const addSlide = async (req, res) => {
  try {
    const { title, ctaText, ctaLink, order } = req.body;
    
    // Use req.file for the uploaded image. We expect multer.
    let imagePath = "";
    if (req.file) {
      // Normalize paths replacing backward slashes with forward slashes
      imagePath = req.file.path.replace(/\\/g, "/");
    } else {
      return errorResponse(res, "Image is required for slider", 400);
    }

    const slide = await Slider.create({
      image: imagePath,
      title,
      ctaText,
      ctaLink,
      order: order || 0,
    });

    return successResponse(res, "Slide added successfully", slide, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @route   DELETE /api/admin/settings/slides/:id
// @desc    Delete a slide
// @access  Admin
export const deleteSlide = async (req, res) => {
  try {
    const slide = await Slider.findByIdAndDelete(req.params.id);
    if (!slide) return errorResponse(res, "Slide not found", 404);

    return successResponse(res, "Slide deleted successfully", null, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @route   PUT /api/admin/settings/profile
// @desc    Update admin profile (name, password, image)
// @access  Admin
export const updateAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, "Admin not found", 404);

    const { full_name, currentPassword, newPassword } = req.body;

    if (full_name) user.full_name = full_name;

    if (newPassword && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return errorResponse(res, "Invalid current password", 400);
      
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (req.file) {
      user.profileImage = req.file.path.replace(/\\/g, "/");
    }

    await user.save();
    
    // We don't send the password back
    user.password = undefined;

    return successResponse(res, "Profile updated successfully", user, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
