import bcrypt from "bcrypt";
import * as userRepo from "../repositories/user.repository.js";
import * as refreshTokenRepo from "../repositories/refresh_token.repository.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/jwt.utils.js";
import { AppError } from "../utils/app-error.js";
import type { LoginSuccess } from "../types/login.type.js";
import type { Request, Response } from "express";
import ms from "ms";
import { jwtConfig } from "../config/jwt.js";
import type { ChangePasswordDTO } from "../types/auth.type.js";

export async function logout(refreshToken: string): Promise<void> {
  const record = await refreshTokenRepo.findByToken(refreshToken);

  if (!record) {
    throw new AppError(404, "Refresh token not found");
  }

  await refreshTokenRepo.deleteByToken(refreshToken);
}

export async function login(
  email: string,
  password: string,
  res: Response,
  userAgent: string,
  ipAddress: string,
): Promise<LoginSuccess> {
  const user = await userRepo.findByEmail(email);

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new AppError(401, "Invalid email or password");
  }

  const payload = {
    userId: user.userId,
    fullName: user.fullName,
    avatar: user.avatar ?? "",
    roles: user.roles,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await refreshTokenRepo.createRefreshToken({
    userId: user.userId,
    refreshTokenHash: refreshToken,
    userAgent,
    ipAddress,
    expiredAt: new Date(
      Date.now() + ms(jwtConfig.refreshExpiresIn as ms.StringValue),
    ),
  });

  const maxAge = ms(jwtConfig.refreshExpiresIn as ms.StringValue);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/v1",
    maxAge,
  });

  return {
    userId: user.userId,
    fullName: user.fullName,
    avatar: user.avatar as string,
    roles: user.roles,
    accessToken,
  };
}

export async function changePassword(
  userId: string,
  changePasswordDTO: ChangePasswordDTO,
) {
  const user = await userRepo.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const isMatch = await bcrypt.compare(
    changePasswordDTO.password,
    user.passwordHash,
  );

  if (!isMatch) {
    throw new AppError(400, "Current password is incorrect");
  }

  // Error: Type jugling
  if (changePasswordDTO.password === changePasswordDTO.newPassword) {
    throw new AppError(
      400,
      "New password must be different from current password",
    );
  }

  if (changePasswordDTO.newPassword.length < 8) {
    throw new AppError(400, "New password must be at least 8 characters");
  }

  const newPasswordHash = await bcrypt.hash(changePasswordDTO.newPassword, 10);

  await userRepo.updatePassword(userId, newPasswordHash);
}

export async function refreshTokenForUser(req: Request): Promise<string> {
  const refreshToken = req.cookies["refreshToken"];
  if (!refreshToken) {
    throw new AppError(401, "No refresh token provided");
  }

  const refreshTokenDB = await refreshTokenRepo.findByToken(refreshToken);
  if (!refreshTokenDB) {
    throw new AppError(401, "Invalid refresh token");
  }

  const tokenPayload = verifyToken(refreshToken);
  if (tokenPayload === null) {
    throw new AppError(401, "Refresh token expired");
  }

  const { userId, fullName, roles } = tokenPayload;

  return generateAccessToken({ userId, fullName, roles });
}
