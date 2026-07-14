import { Router } from "express";
import {
  changePasswordController,
  loginController,
  logoutController,
  refreshTokenController,
} from "../controllers/auth.controller.js";
import { authMiddleWare } from "../middlewares/auth.middleware.js";

const route = Router();

route.post("/login", loginController);
route.post("/logout", logoutController);
route.post("/change-password", authMiddleWare, changePasswordController);
route.post("/refresh-token", refreshTokenController);

export default route;
