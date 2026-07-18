import { Router } from "express";
import { authMiddleWare } from "../middlewares/auth.middleware.js";
import {
  getCommentsController,
  getRepliesController,
  sendCommentController,
} from "../controllers/comment.controller.js";

const route = Router();

route.post("/comments", authMiddleWare, sendCommentController);
route.get("/blogs/:blogId/comments", authMiddleWare, getCommentsController);
route.get("/comments/:commentId/replies", authMiddleWare, getRepliesController);

export default route;