import type { Request, Response } from "express";
import { ApiResponse } from "../utils/api.response.js";
import { catchAsync } from "../utils/catch-async.js";
import { AppError } from "../utils/app-error.js";
import {
  activateUserAccount,
  getAllUsers,
  getProfile,
  updateProfile,
} from "../services/user.service.js";
import type { UpdateUserDTO } from "../types/user.type.js";
import type { PaginationParams } from "../types/pagination.response.type.js";

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

/**
 * PUT /api/v1/{userId}/activate
 * @openapi
 * /api/v1/{userId}/activate:
 *   put:
 *     tags: [User]
 *     summary: Activate or deactivate a user account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to toggle
 *     responses:
 *       200:
 *         description: Account status toggled
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
 *       401:
 *         description: No token provided or not admin
 *       404:
 *         description: User not found
 */
export const activateUserAccountController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.userId as string;

    const newStatus = await activateUserAccount(userId);
    const message = newStatus ? "Account activated" : "Account deactivated";

    return ApiResponse(res, 200, message);
  },
);

/**
 * GET /api/v1/users
 * @openapi
 * /api/v1/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all non-admin users with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by email or fullName
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                           email:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                             nullable: true
 *                           gender:
 *                             type: integer
 *                             nullable: true
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           roles:
 *                             type: array
 *                             items:
 *                               type: string
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     size:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: No token provided
 *       403:
 *         description: Not admin
 */
export const getAllUsersController = catchAsync(
  async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
    const size = Math.min(100, Math.max(1, parseInt(req.query["size"] as string) || 10));
    const search = (req.query["search"] as string) || undefined;

    const params: PaginationParams = { page, size, ...(search ? { search } : {}) };

    const data = await getAllUsers(params);

    return ApiResponse(res, 200, "Users retrieved successfully", data);
  },
);
