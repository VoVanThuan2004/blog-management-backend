import type { CommentRequest, CommentReaction, CommentResponse } from "../types/comment.type.js";
import * as userRepo from "../repositories/user.repository.js";
import { AppError } from "../utils/app-error.js";
import * as blogRepo from "../repositories/blog.repository.js";
import * as commentRepo from "../repositories/comment.repository.js";
import { getIO } from "../config/socket.js";
import type { PaginationResponse } from "../types/pagination.response.type.js";

function toCommentResponse(
  comment: Record<string, unknown>,
  blogId: string,
): CommentResponse {
  const user = comment["user"] as { fullName: string; avatar: string | null };
  const reactions = (comment["reactions"] ?? []) as CommentReaction[];
  const _count = comment["_count"] as { replies: number } | undefined;

  return {
    commentId: comment["commentId"] as string,
    userId: comment["userId"] as string,
    fullName: user.fullName,
    avatar: user.avatar,
    blogId,
    parentCommentId: (comment["parentCommentId"] as string | null) ?? null,
    content: comment["content"] as string,
    createdAt: (comment["createdAt"] as Date).toISOString(),
    reactions,
    replyCount: _count?.replies ?? 0,
  };
}

export async function sendCommentService(
  commentRequest: CommentRequest,
  userId: string,
): Promise<CommentResponse> {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new AppError(404, "User is not found");
  }

  const blog = await blogRepo.findBlogByIdRepo(commentRequest.blogId);
  if (!blog) {
    throw new AppError(404, "Blog is not found");
  }

  const comment = await commentRepo.createCommentRepo(commentRequest, userId);

  const commentResponse: CommentResponse = {
    commentId: comment.commentId,
    userId,
    fullName: comment.user.fullName,
    avatar: comment.user.avatar,
    blogId: commentRequest.blogId,
    parentCommentId: commentRequest.parentCommentId ?? null,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    reactions: [],
    replyCount: 0,
  };

  getIO().to(`blog:${commentRequest.blogId}`).emit("newComment", commentResponse);

  return commentResponse;
}

export async function getCommentsService(
  blogId: string,
  page: number,
  size: number,
): Promise<PaginationResponse<CommentResponse>> {
  const blog = await blogRepo.findBlogByIdRepo(blogId);
  if (!blog) {
    throw new AppError(404, "Blog is not found");
  }

  const { items, total, totalPages } = await commentRepo.findAllCommentsRepo(
    blogId,
    page,
    size,
  );

  return {
    items: items.map((item) =>
      toCommentResponse(item as Record<string, unknown>, blogId),
    ),
    total,
    page,
    size,
    totalPages,
  };
}

export async function getRepliesService(
  parentCommentId: string,
  page: number,
  size: number,
): Promise<PaginationResponse<CommentResponse>> {
  const { items, total, totalPages } = await commentRepo.findRepliesRepo(
    parentCommentId,
    page,
    size,
  );

  return {
    items: items.map((item) =>
      toCommentResponse(item as Record<string, unknown>, item.blogId),
    ),
    total,
    page,
    size,
    totalPages,
  };
}