import { Router } from "express";
import { authMiddleWare } from "../middlewares/auth.middleware.js";
import { adminMiddleWare } from "../middlewares/admin.middleware.js";
import {
  adminDeleteCommentController,
  deleteCommentController,
  getCommentsController,
  getRepliesController,
  sendCommentController,
  updateCommentController,
} from "../controllers/comment.controller.js";

const route = Router();

route.post("/comments", authMiddleWare, sendCommentController);
route.get("/blogs/:blogId/comments", authMiddleWare, getCommentsController);
route.get("/comments/:commentId/replies", authMiddleWare, getRepliesController);
route.delete("/comments/:commentId", authMiddleWare, deleteCommentController);
route.delete(
  "/admin/comments/:commentId",
  authMiddleWare,
  adminMiddleWare,
  adminDeleteCommentController,
);

route.put("/comments/:commentId", authMiddleWare, updateCommentController);

export default route;
