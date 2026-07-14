import { Router } from "express";
import { adminMiddleWare } from "../middlewares/admin.middleware.js";
import {
  createCategoryController,
  updateCategoryController,
} from "../controllers/category.controller.js";

const route = Router();

route.post("/categories", adminMiddleWare, createCategoryController);
route.put("/:categoryId/categories", adminMiddleWare, updateCategoryController);

export default route;
