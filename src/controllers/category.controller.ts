import type { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async.js";
import { ApiResponse } from "../utils/api.response.js";
import {
  createCategory,
  deleteCategoryService,
  getCategoriesService,
  updateCategory,
} from "../services/category.service.js";
import type { CategoryRequest } from "../types/category.type.js";

/**
 * POST /api/v1/categories
 * @openapi
 * /api/v1/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a new category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryName]
 *             properties:
 *               categoryName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categoryId:
 *                       type: string
 *                     categoryName:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Category name is required
 *       401:
 *         description: No token provided
 *       403:
 *         description: Not admin
 */
export const createCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const categoryRequest: CategoryRequest = req.body;

    const categoryResponse = await createCategory(categoryRequest);

    return ApiResponse(
      res,
      201,
      "Create category successfully",
      categoryResponse,
    );
  },
);

/**
 * PUT /api/v1/{categoryId}/categories
 * @openapi
 * /api/v1/{categoryId}/categories:
 *   put:
 *     tags: [Categories]
 *     summary: Update a category name
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryName]
 *             properties:
 *               categoryName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categoryId:
 *                       type: string
 *                     categoryName:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Category name is required or already exists
 *       401:
 *         description: No token provided
 *       403:
 *         description: Not admin
 *       404:
 *         description: Category not found
 */
export const updateCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const categoryId = req.params.categoryId as string;
    const categoryRequest: CategoryRequest = req.body;

    const categoryResponse = await updateCategory(categoryId, categoryRequest);

    return ApiResponse(
      res,
      200,
      "Update category successfully",
      categoryResponse,
    );
  },
);

/**
 * DELETE /api/v1/{categoryId}/categories
 * @openapi
 * /api/v1/{categoryId}/categories:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 *       401:
 *         description: No token provided
 *       403:
 *         description: Not admin
 *       404:
 *         description: Category not found
 */
export const deleteCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const categoryId = req.params.categoryId as string;

    await deleteCategoryService(categoryId);

    return ApiResponse(res, 200, "Deleted category successfully", { categoryId });
  },
);

/**
 * GET /api/v1/categories
 * @openapi
 * /api/v1/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoryId:
 *                         type: string
 *                       categoryName:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 */
export const getCategoriesController = catchAsync(
  async (req: Request, res: Response) => {
    const categories = await getCategoriesService();

    return ApiResponse(res, 200, "Get categories successfully", categories);
  },
);
