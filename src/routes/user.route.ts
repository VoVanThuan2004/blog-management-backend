import { Router } from "express";
import { authMiddleWare } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import {
  activateUserAccountController,
  getAllUsersController,
  getProfileController,
  updateProfileController,
} from "../controllers/user.controller.js";
import { adminMiddleWare } from "../middlewares/admin.middleware.js";

const route = Router();

route.get("/profile", authMiddleWare, getProfileController);
route.patch("/profile", authMiddleWare, uploadAvatar, updateProfileController);
route.put("/:userId/activate", adminMiddleWare, activateUserAccountController);
route.get("/users", adminMiddleWare, getAllUsersController);

export default route;