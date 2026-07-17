import { Router } from "express";
import { authMiddleWare } from "../middlewares/auth.middleware.js";
import {
  approveBlogStatusController,
  createBlogController,
  getAllAuthorBlogsController,
  getAllBlogsController,
  getBlogDetailController,
  rejectBlogStatusController,
} from "../controllers/blog.controller.js";
import { adminMiddleWare } from "../middlewares/admin.middleware.js";

const route = Router();

route.post("/blogs", authMiddleWare, createBlogController);
route.get("/blogs", getAllBlogsController);
route.get("/author/blogs", authMiddleWare, getAllAuthorBlogsController);
route.get("/:blogId/blogs", getBlogDetailController);
route.patch("/blogs/:blogId/approved", adminMiddleWare, approveBlogStatusController);
route.patch("/blogs/:blogId/reject", adminMiddleWare, rejectBlogStatusController);

export default route;
