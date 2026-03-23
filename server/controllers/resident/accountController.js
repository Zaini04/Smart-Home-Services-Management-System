import User from "../../models/userModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";
import bcrypt from "bcryptjs";

// GET PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return errorResponse(res, "User not found", 404);
    return successResponse(res, "User profile", user, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch profile", 500, err.message);
  }
};

// UPDATE PROFILE (Name, Phone, City, Address, Image)
export const updateUserProfile = async (req, res) => {
  try {
    const { full_name, phone, city, address } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, "User not found", 404);

    if (full_name) user.full_name = full_name;
    if (phone) user.phone = phone;
    if (city) user.city = city;
    if (address) user.address = address;

    // If an image was uploaded via multer
    if (req.file) {
      user.profileImage = req.file.path;
    }

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id).select("-password");
    
    return successResponse(res, "Profile updated successfully", updatedUser, 200);
  } catch (err) {
    return errorResponse(res, "Failed to update profile", 500, err.message);
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return errorResponse(res, "Please provide current and new password", 400);
    }

    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, "User not found", 404);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return errorResponse(res, "Incorrect current password", 400);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return successResponse(res, "Password changed successfully", null, 200);
  } catch (err) {
    return errorResponse(res, "Failed to change password", 500, err.message);
  }
};