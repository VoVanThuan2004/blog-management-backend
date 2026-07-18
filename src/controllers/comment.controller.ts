import type { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async.js";
import type { CommentRequest } from "../types/comment.type.js";
import {
  getCommentsService,
  getRepliesService,
  sendCommentService,
} from "../services/comment.service.js";
import { ApiResponse } from "../utils/api.response.js";

/**
 * POST /api/v1/comments
 * @openapi
 * /api/v1/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Send a comment on a blog post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [blogId, content]
 *             properties:
 *               blogId:
 *                 type: string
 *               parentCommentId:
 *                 type: string
 *                 nullable: true
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
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
 *                     commentId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *                     blogId:
 *                       type: string
 *                     parentCommentId:
 *                       type: string
 *                       nullable: true
 *                     content:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     replyCount:
 *                       type: integer
 *       400:
 *         description: Validation error
 *       401:
 *         description: No token provided
 *       404:
 *         description: User or blog not found
 */
export const sendCommentController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const commentRequest: CommentRequest = req.body;

    const commentResponse = await sendCommentService(commentRequest, userId);

    return ApiResponse(res, 201, "Sent comment successfully", commentResponse);
  },
);

/**
 * GET /api/v1/blogs/:blogId/comments
 * @openapi
 * /api/v1/blogs/{blogId}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: Get all comments for a blog post with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: List of comments
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
 *                           commentId:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                             nullable: true
 *                           blogId:
 *                             type: string
 *                           parentCommentId:
 *                             type: string
 *                             nullable: true
 *                           content:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           reactions:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 reactionId:
 *                                   type: string
 *                                 reactionType:
 *                                   type: string
 *                                 userId:
 *                                   type: string
 *                                 commentId:
 *                                   type: string
 *                                 createdAt:
 *                                   type: string
 *                                   format: date-time
 *                           replyCount:
 *                             type: integer
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
 *       404:
 *         description: Blog not found
 */
export const getCommentsController = catchAsync(
  async (req: Request, res: Response) => {
    const blogId = req.params["blogId"] as string;
    const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
    const size = Math.min(
      100,
      Math.max(1, parseInt(req.query["size"] as string) || 10),
    );

    const data = await getCommentsService(blogId, page, size);

    return ApiResponse(res, 200, "Get comments successfully", data);
  },
);

/**
 * GET /api/v1/comments/:commentId/replies
 * @openapi
 * /api/v1/comments/{commentId}/replies:
 *   get:
 *     tags: [Comments]
 *     summary: Get replies of a comment with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: List of replies
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
 *                           commentId:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                             nullable: true
 *                           blogId:
 *                             type: string
 *                           parentCommentId:
 *                             type: string
 *                             nullable: true
 *                           content:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           reactions:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 reactionId:
 *                                   type: string
 *                                 reactionType:
 *                                   type: string
 *                                 userId:
 *                                   type: string
 *                                 commentId:
 *                                   type: string
 *                                 createdAt:
 *                                   type: string
 *                                   format: date-time
 *                           replyCount:
 *                             type: integer
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
export const getRepliesController = catchAsync(
  async (req: Request, res: Response) => {
    const parentCommentId = req.params["commentId"] as string;
    const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
    const size = Math.min(
      100,
      Math.max(1, parseInt(req.query["size"] as string) || 10),
    );

    const data = await getRepliesService(parentCommentId, page, size);

    return ApiResponse(res, 200, "Get replies successfully", data);
  },
);
