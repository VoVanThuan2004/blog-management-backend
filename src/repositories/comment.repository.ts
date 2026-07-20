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
          avatar: true,
        },
      },
    },
  });
}

export async function findAllCommentsRepo(
  blogId: string,
  page: number,
  size: number,
) {
  const skip = (page - 1) * size;

  const where = { blogId, parentCommentId: null };

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      skip,
      take: size,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { fullName: true, avatar: true } },
        reactions: {
          select: {
            reactionId: true,
            reactionType: true,
            userId: true,
            commentId: true,
            createdAt: true,
          },
        },
        _count: {
          select: { replies: true },
        },
      },
    }),
    prisma.comment.count({ where }),
  ]);

  return {
    items: comments,
    total,
    page,
    size,
    totalPages: Math.ceil(total / size),
  };
}

export async function findRepliesRepo(
  parentCommentId: string,
  page: number,
  size: number,
) {
  const skip = (page - 1) * size;

  const where = { parentCommentId };

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      skip,
      take: size,
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { fullName: true, avatar: true } },
        reactions: {
          select: {
            reactionId: true,
            reactionType: true,
            userId: true,
            commentId: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    }),
    prisma.comment.count({ where }),
  ]);

  return {
    items: comments,
    total,
    page,
    size,
    totalPages: Math.ceil(total / size),
  };
}

export async function findCommentByIdRepo(commentId: string) {
  return await prisma.comment.findUnique({
    where: { commentId },
  });
}

export async function deleteCommentByIdRepo(commentId: string) {
  return await prisma.comment.delete({
    where: { commentId },
  });
}

export async function updateCommentByIdRepo(
  commentId: string,
  content: string,
) {
  return await prisma.comment.update({
    where: {
      commentId,
    },
    data: {
      content,
    },
    include: {
      user: {
        select: {
          fullName: true,
          avatar: true,
        },
      },
    },
  });
}

export async function findCommentUserRepo(commentId: string, userId: string) {
  return await prisma.comment.findUnique({
    where: { commentId, userId },
  });
}
