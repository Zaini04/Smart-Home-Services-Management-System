import express from "express";
import { addService, createCategory, createSubCategory, getCategories, getPendingWorkers, updateKycStatus } from "../controllers/adminController.js";
import { uploadServiceImage } from "../middlewares/serviceUpload.js";
import { protect } from "../middlewares/protect.js";
import { adminOnly } from "../middlewares/adminOnly.js";


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
