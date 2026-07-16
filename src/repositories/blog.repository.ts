import { prisma } from "../config/prisma.js";
import type { BlogRequest } from "../types/blog.type.js";

export const createBlogRepo = async (
  authorId: string,
  blogRequest: BlogRequest,
) => {
  return await prisma.blog.create({
    data: {
      authorId,
      categoryId: blogRequest.categoryId,
      title: blogRequest.title,
      content: blogRequest.content,
    },
    include: {
      author: {
        select: {
          fullName: true,
          avatar: true,
        },
      },
    },
  });
};

export const findBlogByIdRepo = async (blogId: string) => {
  return await prisma.blog.findUnique({
    where: { blogId },
    include: {
      author: {
        select: { fullName: true, avatar: true },
      },
      category: {
        select: { categoryName: true },
      },
    },
  });
};
