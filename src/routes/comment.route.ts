import { Router } from "express";
import { authMiddleWare } from "../middlewares/auth.middleware.js";
import { sendCommentController } from "../controllers/comment.controller.js";

const route = Router();

route.post("/comments", authMiddleWare, sendCommentController);

export default route;