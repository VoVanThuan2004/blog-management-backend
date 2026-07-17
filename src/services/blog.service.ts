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

export const getAllAuthorBlogsService = async ({
  page,
  size,
  search,
  categoryId,
  userId,
}: {
  page: number;
  size: number;
  search?: string | undefined;
  categoryId?: string | undefined;
  userId?: string | undefined;
}): Promise<PaginationResponse<BlogResponse>> => {
  const { items, total, totalPages } = await blogRepo.findAllBlogsRepo(
    page,
    size,
    search,
    categoryId,
    userId,
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

export async function updateBlogStatusService(blogId: string, blogStatus: string) {
  // 1. Kiểm tra blog có tồn tại
  const blog = await blogRepo.findBlogByIdRepo(blogId);
  if (!blog) {
    throw new AppError(404, "Blog is not found");
  }
  
  // 2. Kiểm tra trạng thái blog có hợp lệ
  const validStatuses = Object.values(BlogStatus);
  if (!validStatuses.includes(blogStatus as BlogStatus)) {
    throw new AppError(400, "Blog status is not valid");
  }

  // 3. Cập nhật trạng thái blog
  const updated = await blogRepo.updateBlogStatusRepo(
    blogId,
    blogStatus as BlogStatus,
  );

  return {
    blogId: updated.blogId,
    authorId: updated.authorId,
    authorName: updated.author.fullName,
    avatar: updated.author.avatar,
    categoryId: updated.categoryId,
    categoryName: updated.category.categoryName,
    title: updated.title,
    content: updated.content,
    status: updated.status as BlogStatus,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}