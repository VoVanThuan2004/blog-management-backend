import type { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async.js";
import type { CommentRequest } from "../types/comment.type.js";
import { sendCommentService } from "../services/comment.service.js";
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
