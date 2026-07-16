import { prisma } from "../config/prisma.js";
import type { BlogRequest, BlogResponse } from "../types/blog.type.js";
import type { PaginationResponse } from "../types/pagination.response.type.js";

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
      category: {
        select: { categoryName: true },
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

export const findAllBlogsRepo = async (
  page: number,
  size: number,
  search?: string,
  categoryId?: string,
) => {
  const skip = (page - 1) * size;

  const where: Record<string, unknown> = {
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where: where as never,
      skip,
      take: size,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { fullName: true, avatar: true } },
        category: { select: { categoryName: true } },
      },
    }),
    prisma.blog.count({ where: where as never }),
  ]);

  return {
    items: blogs,
    total,
    page,
    size,
    totalPages: Math.ceil(total / size),
  };
};
