import express from "express";
import { completeProviderProfile, getCategoriesWithSkills } from "../controllers/serviceProviderController.js";
import { upload } from "../middlewares/upload.js";

const serviceProviderRouter = express.Router();

serviceProviderRouter.post("/completeProfile",upload.fields([
    { name: "cnicFront", maxCount: 1 },
    { name: "cnicBack", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
  ]), completeProviderProfile);
serviceProviderRouter.get('/getCategoriesWithSkills',getCategoriesWithSkills)
export default serviceProviderRouter;
