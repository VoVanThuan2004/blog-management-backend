import type { CommentRequest, CommentResponse } from "../types/comment.type.js";
import * as userRepo from "../repositories/user.repository.js";
import { AppError } from "../utils/app-error.js";
import * as blogRepo from "../repositories/blog.repository.js";
import * as commentRepo from "../repositories/comment.repository.js";
import { getIO } from "../config/socket.js";

export async function sendCommentService(
  commentRequest: CommentRequest,
  userId: string,
): Promise<CommentResponse> {
  // 1. Kiểm tra người dùng có tồn tại
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new AppError(404, "User is not found");
  }

  // 2. Kiểm blog có tồn tại
  const blog = await blogRepo.findBlogByIdRepo(commentRequest.blogId);
  if (!blog) {
    throw new AppError(404, "Blog is not found");
  }

  // 3. Tạo comment mới
  const comment = await commentRepo.createCommentRepo(commentRequest, userId);

  // 4. Gửi data qua socket
  const commentResponse: CommentResponse = {
    commentId: comment.commentId,
    userId,
    avatar: comment.user.avatar,
    fullName: comment.user.fullName,
    ...commentRequest,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
  };

  const io = getIO();
  io.to(`blog:${commentRequest.blogId}`).emit("newComment", commentResponse);

  // 5. Mapping data trả về
  return commentResponse;
}
