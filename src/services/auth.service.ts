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
import type { Response, Request } from "express";
import ms from "ms";
import { jwtConfig } from "../config/jwt.js";
import type {
  ChangePasswordDTO,
  RegisterRequest,
} from "../types/auth.type.js";
import otpGenerator from "otp-generator";
import { sendOTP } from "../config/mail.js";
import * as roleRepo from "../repositories/role.repository.js";

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

  if (!user.isActive) {
    throw new AppError(400, "User account is deactivated");
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

export async function registerAccountService(
  registerRequest: RegisterRequest,
) {
  const { email, fullName, password } = registerRequest;

  if (!email?.trim() || !fullName?.trim() || !password?.trim()) {
    throw new AppError(400, "Email, full name, and password are required");
  }

  if (password.length < 8) {
    throw new AppError(400, "Password must be at least 8 characters");
  }

  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new AppError(400, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const otpCode = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  const otpExpiredAt = new Date(Date.now() + 5 * 60 * 1000);

  // Lấy role hiện tại
  const role = await roleRepo.findByRoleName("USER");
  if (!role) {
    throw new AppError(404, "Role is not found");
  }

  // Tạo user
  const user = await userRepo.createUserAccount(email, fullName, passwordHash, otpCode, otpExpiredAt);

  // Tạo user role
  await userRepo.createUserRoleRepo(user.userId, role.roleId);

  await sendOTP(email, otpCode);
}

export async function verifyOtpService(
  email: string,
  otpCode: string,
  res: Response,
  userAgent: string,
  ipAddress: string,
): Promise<LoginSuccess> {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (!user.otpCode || !user.otpExpiredAt) {
    throw new AppError(400, "No OTP was requested");
  }

  if (user.otpExpiredAt < new Date()) {
    throw new AppError(400, "OTP has expired");
  }

  if (user.otpCode !== otpCode) {
    throw new AppError(400, "Invalid OTP code");
  }

  await userRepo.activateUser(user.userId, true);
  await userRepo.clearOtpRepo(user.userId);

  const payload = {
    userId: user.userId,
    fullName: user.fullName,
    avatar: user.avatar ?? "",
    roles: user.roles,
  };

  // Tạo mã access, refresh token cho sau khi tạo tài khoản thành công -> Tự login
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const maxAge = ms(jwtConfig.refreshExpiresIn as ms.StringValue);

  await refreshTokenRepo.createRefreshToken({
    userId: user.userId,
    refreshTokenHash: refreshToken,
    userAgent,
    ipAddress,
    expiredAt: new Date(
      Date.now() + ms(jwtConfig.refreshExpiresIn as ms.StringValue),
    ),
  });

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

export async function resendOtpService(email: string) {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.otpExpiredAt && user.otpExpiredAt > new Date()) {
    throw new AppError(400, "Current OTP is still valid, please wait");
  }

  const otpCode = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  const otpExpiredAt = new Date(Date.now() + 5 * 60 * 1000);

  await userRepo.saveOtpRepo(user.userId, otpCode, otpExpiredAt);

  await sendOTP(email, otpCode);
}
