import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/api.response.js";
import { verifyToken } from "../utils/jwt.utils.js";

export const authMiddleWare = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return ApiResponse(res, 401, "Access token is required");
        }

        const accessToken = authorization.split(" ")[1] as string;

        // Verify mã token
        const tokenPayload = verifyToken(accessToken);
        if (tokenPayload === null) {
            return ApiResponse(res, 401, "Access token is not valid");
        }

        // Lưu vào req
        req.user = {
            userId: tokenPayload.userId,
            fullName: tokenPayload.fullName,
            roles: tokenPayload.roles
        };

        next();
    } catch (error) {
        next(error);
    }
}