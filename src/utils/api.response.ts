import type { Response } from "express";
import type { ApiResponseType } from "../types/api.response.type.js";

export function ApiResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
): Response<ApiResponseType<T>> {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    code: statusCode,
    message,
    data,
  });
}
