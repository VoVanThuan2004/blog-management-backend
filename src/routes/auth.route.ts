import { Router } from "express";
import {
  changePasswordController,
  loginController,
  logoutController,
  refreshTokenController,
  registerAccountController,
  resendOtpController,
  verifyOtpController,
} from "../controllers/auth.controller.js";
import { authMiddleWare } from "../middlewares/auth.middleware.js";

const route = Router();

route.post("/login", loginController);
route.post("/logout", logoutController);
route.post("/change-password", authMiddleWare, changePasswordController);
route.post("/refresh-token", refreshTokenController);
route.post("/auth/register", registerAccountController);
route.post("/auth/verify-otp", verifyOtpController);
route.post("/auth/resend-otp", resendOtpController);

export default route;
