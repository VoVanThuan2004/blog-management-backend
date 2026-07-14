import { Router } from "express";
import { authMiddleWare } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import {
  getProfileController,
  updateProfileController,
} from "../controllers/user.controller.js";

const route = Router();

route.get("/profile", authMiddleWare, getProfileController);
route.patch("/profile", authMiddleWare, uploadAvatar, updateProfileController);

export default route;