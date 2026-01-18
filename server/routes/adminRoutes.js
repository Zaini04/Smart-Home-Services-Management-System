import express from "express";
import { uploadServiceImage } from "../middlewares/serviceUpload.js";
import { protect } from "../middlewares/protect.js";
import { adminOnly } from "../middlewares/adminOnly.js";
import { getPendingWorkers, updateKycStatus } from "../controllers/admin/workersController.js";
import { createCategory, getCategories } from "../controllers/admin/categoryController.js";
import { createSubCategory } from "../controllers/admin/subCategoryController.js";
import { addService } from "../controllers/admin/serviceController.js";


const adminRouter = express.Router();

adminRouter.post(
  "/addService",
  protect,
  adminOnly,
  uploadServiceImage.single("image"),
  addService
);
adminRouter.get('/getPendingWorkers',getPendingWorkers)
adminRouter.put('/update-KYC/:providerId',updateKycStatus)
adminRouter.post('/createCategory',createCategory)
adminRouter.post('/createSubCategory',createSubCategory)
adminRouter.get("/categories", getCategories);



export default adminRouter;
