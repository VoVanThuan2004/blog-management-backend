import { prisma } from "../config/prisma.js";
import type { CategoryResponse } from "../types/category.type.js";

export const findById = async (categoryId: string) => {
  return await prisma.category.findUnique({
    where: {
      categoryId,
    },
  });
};

export const createNewCategory = async (
  categoryName: string,
): Promise<CategoryResponse> => {
  const category = await prisma.category.create({
    data: { categoryName },
  });

  return {
    categoryId: category.categoryId,
    categoryName: category.categoryName,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
};

export const updateCategory = async (
  categoryId: string,
  categoryName: string,
): Promise<CategoryResponse> => {
  const category = await prisma.category.update({
    where: {
      categoryId,
    },
    data: {
      categoryName,
    },
  });

  return {
    categoryId: category.categoryId,
    categoryName: category.categoryName,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
};

export const deleteCategoryRepo = async (categoryId: string) => {
  await prisma.category.update({
    where: {
      categoryId,
    },
    data: {
      isDeleted: true,
    },
  });
};

export const getCategoriesRepo = async () => {
  return await prisma.category.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
