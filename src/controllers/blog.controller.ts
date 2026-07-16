import type { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async.js";
import type { BlogRequest } from "../types/blog.type.js";
import {
  createBlogService,
  getBlogDetailService,
} from "../services/blog.service.js";
import { ApiResponse } from "../utils/api.response.js";

/**
 * POST /api/v1/blogs
 * @openapi
 * /api/v1/blogs:
 *   post:
 *     tags: [Blogs]
 *     summary: Create a new blog post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, title, content]
 *             properties:
 *               categoryId:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Blog created successfully
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
 *                     blogId:
 *                       type: string
 *                     authorId:
 *                       type: string
 *                     authorName:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *                     categoryId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [PENDING, APPROVED, REJECTED]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *       401:
 *         description: No token provided
 *       404:
 *         description: User or category not found
 */
export const createBlogController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const blogRequest: BlogRequest = req.body;

    const blogResponse = await createBlogService(userId, blogRequest);

    return ApiResponse(res, 201, "Created new blog successfully", blogResponse);
  },
);

/**
 * GET /api/v1/{blogId}/blogs
 * @openapi
 * /api/v1/{blogId}/blogs:
 *   get:
 *     tags: [Blogs]
 *     summary: Get blog detail by ID
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog detail
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
 *                     blogId:
 *                       type: string
 *                     authorId:
 *                       type: string
 *                     authorName:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *                     categoryId:
 *                       type: string
 *                     categoryName:
 *                       type: string
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [PENDING, APPROVED, REJECTED]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Blog not found
 */
export const getBlogDetailController = catchAsync(
  async (req: Request, res: Response) => {
    const blogId = req.params["blogId"] as string;

    const blogResponse = await getBlogDetailService(blogId);

    return ApiResponse(res, 200, "Get blog detail", blogResponse);
  },
);
