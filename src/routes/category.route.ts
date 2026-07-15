import { Router } from "express";
import { adminMiddleWare } from "../middlewares/admin.middleware.js";
import {
  createCategoryController,
  deleteCategoryController,
  getCategoriesController,
  updateCategoryController,
} from "../controllers/category.controller.js";

const route = Router();

route.post("/categories", adminMiddleWare, createCategoryController);
route.put("/:categoryId/categories", adminMiddleWare, updateCategoryController);
route.delete("/:categoryId/categories", adminMiddleWare, deleteCategoryController);
route.get("/categories", getCategoriesController);

export default route;
