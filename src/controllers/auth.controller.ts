import type { Request, Response } from "express";
import { ApiResponse } from "../utils/api.response.js";
import { catchAsync } from "../utils/catch-async.js";
import { AppError } from "../utils/app-error.js";
import {
  changePassword,
  login,
  logout,
  refreshTokenForUser,
} from "../services/auth.service.js";
import type { LoginSuccess } from "../types/login.type.js";
import type { ChangePasswordDTO } from "../types/auth.type.js";

/**
 * POST /api/v1/login
 * @openapi
 * /api/v1/login:
 *   post:
 *     tags: [Auth]
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: Invalid email or password
 */
export const loginController = catchAsync(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, "Email and password are required");
    }

    const userAgent = req.headers["user-agent"] ?? "unknown";
    const ipAddress = req.ip ?? req.socket.remoteAddress ?? "unknown";

    const data: LoginSuccess = await login(
      email,
      password,
      res,
      userAgent,
      ipAddress,
    );

    return ApiResponse(res, 200, "Login successfully!", data);
  },
);

/**
 * POST /api/v1/auth/logout
 * @openapi
 * /api/v1/logout:
 *   post:
 *     tags: [Auth]
 *     summary: User logout
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: No refresh token provided
 *       404:
 *         description: Refresh token not found
 */
export const logoutController = catchAsync(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken) {
      throw new AppError(401, "No refresh token provided");
    }

    await logout(refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1",
    });

    return ApiResponse(res, 200, "Logout successfully!");
  },
);

/**
 * POST /api/v1/auth/change-password
 * @openapi
 * /api/v1/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, newPassword]
 *             properties:
 *               password:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 description: New password (min 8 characters)
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error (incorrect password, same password, too short)
 *       401:
 *         description: No token provided
 *       404:
 *         description: User not found
 */
export const changePasswordController = catchAsync(
  async (req: Request, res: Response) => {
    const changePasswordDTO: ChangePasswordDTO = req.body;
    const userId = req.user?.userId as string;

    await changePassword(userId, changePasswordDTO);

    return ApiResponse(res, 200, "Password changed successfully");
  },
);

/**
 * POST /api/v1/refresh-token
 * @openapi
 * /api/v1/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using httpOnly refresh token cookie
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: No refresh token provided or token expired
 *       404:
 *         description: Refresh token not found in database
 */
export const refreshTokenController = catchAsync(
  async (req: Request, res: Response) => {
    const accessToken = await refreshTokenForUser(req);

    return ApiResponse(res, 200, "Token refreshed successfully", {
      accessToken,
    });
  },
);
