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
