import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { AppError } from "./utils/app-error.js";
import userRoute from "./routes/user.route.js";
import categoryRoute from "./routes/category.route.js";
import blogRoute from "./routes/blog.route.js";
import { initSocket } from "./config/socket.js";
import commentRoute from "./routes/comment.route.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT ?? 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 429,
    message: "Too many requests, please try again later.",
  },
});

app.use(limiter);
app.use(express.json());
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/v1", authRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", categoryRoute);
app.use("/api/v1", blogRoute);
app.use("/api/v1", commentRoute);

// 404 handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, "Route not found"));
});

// Global error middleware
app.use(
  (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
      success: false,
      code: statusCode,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  },
);

initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
