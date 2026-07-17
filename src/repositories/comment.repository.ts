import { prisma } from "../config/prisma.js";
import type { CommentRequest } from "../types/comment.type.js";

export async function createCommentRepo(
  commentRequest: CommentRequest,
  userId: string,
) {
  return await prisma.comment.create({
    data: {
      userId,
      ...commentRequest,
    },
    include: {
        user: {
            select: {
                fullName: true,
                avatar: true
            }
        },
    }
  });
}
