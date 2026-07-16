import type { BlogRequest, BlogResponse } from "../types/blog.type.js";
import { BlogStatus } from "../types/blog.type.js";
import * as userRepo from "../repositories/user.repository.js";
import { AppError } from "../utils/app-error.js";
import * as categoryRepo from "../repositories/category.repository.js";
import * as blogRepo from "../repositories/blog.repository.js";
import type { PaginationResponse } from "../types/pagination.response.type.js";

export const createBlogService = async (
  authorId: string,
  blogRequest: BlogRequest,
): Promise<BlogResponse> => {
  if (!blogRequest.title?.trim()) {
    throw new AppError(400, "Title is required");
  }

  if (!blogRequest.content?.trim()) {
    throw new AppError(400, "Content is required");
  }

  if (!blogRequest.categoryId?.trim()) {
    throw new AppError(400, "Category ID is required");
  }

  const author = await userRepo.findById(authorId);
  if (!author) {
    throw new AppError(404, "User not found");
  }

  const category = await categoryRepo.findById(blogRequest.categoryId);
  if (!category) {
    throw new AppError(404, "Category not found");
  }

  const blog = await blogRepo.createBlogRepo(authorId, blogRequest);

  return {
    blogId: blog.blogId,
    authorId: blog.authorId,
    authorName: blog.author.fullName,
    avatar: blog.author.avatar,
    categoryId: blog.categoryId,
    categoryName: blog.category.categoryName,
    title: blog.title,
    content: blog.content,
    status: blog.status as BlogStatus,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
  };
};

export const getBlogDetailService = async (
  blogId: string,
): Promise<BlogResponse> => {
  // 1. Gọi repo lấy data
  const blog = await blogRepo.findBlogByIdRepo(blogId);
  if (!blog) {
    throw new AppError(404, "Blog not found");
  }

  // 2. Mapping data trả về
  return {
    blogId,
    authorId: blog.authorId,
    authorName: blog.author.fullName,
    avatar: blog.author.avatar,
    categoryId: blog.categoryId,
    categoryName: blog.category.categoryName,
    title: blog.title,
    content: blog.content,
    status: blog.status as BlogStatus,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
  };
};

export const getAllBlogsService = async ({
  page,
  size,
  search,
  categoryId,
}: {
  page: number;
  size: number;
  search?: string | undefined;
  categoryId?: string | undefined;
}): Promise<PaginationResponse<BlogResponse>> => {
  const { items, total, totalPages } = await blogRepo.findAllBlogsRepo(
    page,
    size,
    search,
    categoryId,
  );

  const blogResponses: BlogResponse[] = items.map((blog) => ({
    blogId: blog.blogId,
    authorId: blog.authorId,
    authorName: blog.author.fullName,
    avatar: blog.author.avatar,
    categoryId: blog.categoryId,
    categoryName: blog.category.categoryName,
    title: blog.title,
    content: blog.content,
    status: blog.status as BlogStatus,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
  }));

  return {
    items: blogResponses,
    total,
    page,
    size,
    totalPages,
  };
};
