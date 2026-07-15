import type {
  CategoryRequest,
  CategoryResponse,
} from "../types/category.type.js";
import { AppError } from "../utils/app-error.js";
import * as categoryRepo from "../repositories/category.repository.js";

export const createCategory = async (
  categoryRequest: CategoryRequest,
): Promise<CategoryResponse> => {
  // 1. Kiểm tra category name
  const categoryName = categoryRequest.categoryName;
  if (!categoryName || categoryName === null) {
    throw new AppError(400, "Category name is required");
  }

  // 2. Tạo mới category
  const categoryResponse = await categoryRepo.createNewCategory(categoryName);

  return categoryResponse;
};

export const updateCategory = async (
  categoryId: string,
  categoryRequest: CategoryRequest,
): Promise<CategoryResponse> => {
  // 1. Kiểm tra category có tồn tại
  const category = await categoryRepo.findById(categoryId);
  if (!category) {
    throw new AppError(404, "Category not found");
  }

  // 2. Kiểm tra category name
  const categoryName = categoryRequest.categoryName;
  if (!categoryName || categoryName === null) {
    throw new AppError(400, "Category name is required");
  }

  if (category.categoryName === categoryRequest.categoryName) {
    throw new AppError(400, "Category name is exist");
  }

  // 3. Cập nhật danh mục
  return await categoryRepo.updateCategory(categoryId, categoryName);
};

export const deleteCategoryService = async (categoryId: string) => {
  // 1. Kiểm tra category có tồn tại
  const category = await categoryRepo.findById(categoryId);
  if (!category) {
    throw new AppError(404, "Category not found");
  }

  // 2. Cập nhật trạng thái xóa mềm
  await categoryRepo.deleteCategoryRepo(categoryId);
};

export const getCategoriesService = async (): Promise<CategoryResponse[]> => {
  const categories = await categoryRepo.getCategoriesRepo();

  return categories.map((c) => ({
    categoryId: c.categoryId,
    categoryName: c.categoryName,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  })) as CategoryResponse[];
};
