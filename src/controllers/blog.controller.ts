import type { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async.js";
import type { BlogRequest } from "../types/blog.type.js";
import {
  createBlogService,
  getAllAuthorBlogsService,
  getAllBlogsService,
  getBlogDetailService,
  updateBlogStatusService,
} from "../services/blog.service.js";
import { ApiResponse } from "../utils/api.response.js";
import type { PaginationParams } from "../types/pagination.response.type.js";

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

/**
 * GET /api/v1/blogs
 * @openapi
 * /api/v1/blogs:
 *   get:
 *     tags: [Blogs]
 *     summary: Get all blogs with pagination, search, and category filter
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or content
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *     responses:
 *       200:
 *         description: List of blogs
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
 *                           blogId:
 *                             type: string
 *                           authorId:
 *                             type: string
 *                           authorName:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                             nullable: true
 *                           categoryId:
 *                             type: string
 *                           categoryName:
 *                             type: string
 *                           title:
 *                             type: string
 *                           content:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [PENDING, APPROVED, REJECTED]
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     size:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
export const getAllBlogsController = catchAsync(
  async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
    const size = Math.min(
      100,
      Math.max(1, parseInt(req.query["size"] as string) || 10),
    );
    const search = (req.query["search"] as string) ?? undefined;
    const categoryId = (req.query["categoryId"] as string) ?? undefined;

    const paginationParams: PaginationParams = {
      page,
      size,
      search,
    };

    const data = await getAllBlogsService({
      ...paginationParams,
      categoryId,
    });

    return ApiResponse(res, 200, "Get all blogs", data);
  },
);

/**
 * GET /api/v1/author/blogs
 * @openapi
 * /api/v1/author/blogs:
 *   get:
 *     tags: [Blogs]
 *     summary: Get all blogs of the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or content
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *     responses:
 *       200:
 *         description: List of author's blogs
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
 *                           blogId:
 *                             type: string
 *                           authorId:
 *                             type: string
 *                           authorName:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                             nullable: true
 *                           categoryId:
 *                             type: string
 *                           categoryName:
 *                             type: string
 *                           title:
 *                             type: string
 *                           content:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [PENDING, APPROVED, REJECTED]
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
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
 */
export const getAllAuthorBlogsController = catchAsync(
  async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
    const size = Math.min(
      100,
      Math.max(1, parseInt(req.query["size"] as string) || 10),
    );
    const search = (req.query["search"] as string) ?? undefined;
    const categoryId = (req.query["categoryId"] as string) ?? undefined;

    const authorId = req.user?.userId as string;

    const paginationParams: PaginationParams = {
      page,
      size,
      search,
    };

    const data = await getAllAuthorBlogsService({
      ...paginationParams,
      categoryId,
      userId: authorId,
    });

    return ApiResponse(res, 200, "Get all author's blogs", data);
  },
);

/**
 * PATCH /api/v1/blogs/:blogId/approved
 * @openapi
 * /api/v1/blogs/{blogId}/approved:
 *   patch:
 *     tags: [Blogs]
 *     summary: Approve a blog post (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog approved
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
 *       401:
 *         description: No token provided
 *       403:
 *         description: Admin only
 *       404:
 *         description: Blog not found
 */
export const approveBlogStatusController = catchAsync(
  async (req: Request, res: Response) => {
    const blogId = req.params["blogId"] as string;

    const blogResponse = await updateBlogStatusService(blogId, "APPROVED");

    return ApiResponse(res, 200, "Approved blog", blogResponse);
  },
);

/**
 * PATCH /api/v1/blogs/:blogId/reject
 * @openapi
 * /api/v1/blogs/{blogId}/reject:
 *   patch:
 *     tags: [Blogs]
 *     summary: Reject a blog post (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog rejected
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
 *       401:
 *         description: No token provided
 *       403:
 *         description: Admin only
 *       404:
 *         description: Blog not found
 */
export const rejectBlogStatusController = catchAsync(
  async (req: Request, res: Response) => {
    const blogId = req.params["blogId"] as string;

    const blogResponse = await updateBlogStatusService(blogId, "REJECTED");

    return ApiResponse(res, 200, "Rejected blog", blogResponse);
  },
);
