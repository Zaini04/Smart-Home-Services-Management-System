import express from "express";
import { uploadServiceImage } from "../middlewares/serviceUpload.js";
import { protect } from "../middlewares/protect.js";
import { adminOnly } from "../middlewares/adminOnly.js";
import { getAllProviders, getPendingWorkers, updateKycStatus } from "../controllers/admin/workersController.js";
import { createCategory, deleteCategory, getCategories, getCategoriesWithSkills, updateCategory } from "../controllers/admin/categoryController.js";
import { createSubCategory, deleteSubCategory, updateSubCategory } from "../controllers/admin/subCategoryController.js";
import { addService, deleteService, getAllServices, updateService } from "../controllers/admin/serviceController.js";
import { getAllBookings, getBookingDetails } from "../controllers/admin/bookingController.js";


const adminRouter = express.Router();


// Service Routes
adminRouter.post(
  "/addService",
  protect,
  adminOnly,
  uploadServiceImage.single("image"),
  addService
);
adminRouter.put(
  "/service/:serviceId",
  protect,
  adminOnly,
  uploadServiceImage.single("image"),
  updateService
);

adminRouter.delete("/service/:serviceId", protect, adminOnly, deleteService);
adminRouter.get("/services", protect, adminOnly, getAllServices);

// Workers Routes
adminRouter.get('/getPendingWorkers',getPendingWorkers)
adminRouter.put('/update-KYC/:providerId',updateKycStatus)
adminRouter.get('/getAllWorkers',getAllProviders)

// Category Routes
adminRouter.post('/createCategory',createCategory)
adminRouter.get("/categories", getCategories);
adminRouter.put("/category/:categoryId", protect, adminOnly, updateCategory);
adminRouter.delete("/category/:categoryId", protect, adminOnly, deleteCategory);
adminRouter.get('/getCategoriesWithSkills',getCategoriesWithSkills)


// SubCategory Routes 
adminRouter.post('/subCategory/createSubCategory',createSubCategory)
adminRouter.put("/subCategory/:subCategoryId", protect, adminOnly, updateSubCategory);
adminRouter.delete("/subCategory/:subCategoryId", protect, adminOnly, deleteSubCategory);

// Booking Routes

adminRouter.get("/", protect, adminOnly, getAllBookings);
adminRouter.get("/:bookingId", protect, adminOnly, getBookingDetails);

export default adminRouter;
