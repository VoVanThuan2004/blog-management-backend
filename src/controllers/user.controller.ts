import type { Request, Response } from "express";
import { ApiResponse } from "../utils/api.response.js";
import { catchAsync } from "../utils/catch-async.js";
import { AppError } from "../utils/app-error.js";
import { getProfile, updateProfile } from "../services/user.service.js";
import type { UpdateUserDTO } from "../types/user.type.js";

/**
 * GET /api/v1/profile
 * @openapi
 * /api/v1/profile:
 *   get:
 *     tags: [User]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                     userId:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *                     gender:
 *                       type: integer
 *                       nullable: true
 *                     dateOfBirth:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: No token provided
 *       404:
 *         description: User not found
 */
export const getProfileController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId!;

    const data = await getProfile(userId);

    return ApiResponse(res, 200, "Profile retrieved successfully", data);
  },
);

/**
 * PATCH /api/v1/profile
 * @openapi
 * /api/v1/profile:
 *   patch:
 *     tags: [User]
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               gender:
 *                 type: integer
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: No token provided
 *       404:
 *         description: User not found
 */
export const updateProfileController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId!;
    const dto: UpdateUserDTO = req.body;
    const file = req.file;

    if (!dto.fullName && !dto.gender && !dto.dateOfBirth && !file) {
      throw new AppError(400, "No fields to update");
    }

    const data = await updateProfile(userId, dto, file);

    return ApiResponse(res, 200, "Profile updated successfully", data);
  },
);
