import { Router } from "express";
import { authMiddleWare } from "../middlewares/auth.middleware.js";
import {
  createBlogController,
  getBlogDetailController,
} from "../controllers/blog.controller.js";

const route = Router();

route.post("/blogs", authMiddleWare, createBlogController);
route.get("/:blogId/blogs", getBlogDetailController);

export default route;
