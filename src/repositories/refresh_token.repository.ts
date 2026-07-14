import { prisma } from "../config/prisma.js";
import type { CreateRefreshTokenParams } from "../types/refresh_token.type.js";

export async function createRefreshToken(params: CreateRefreshTokenParams) {
  return await prisma.refreshToken.create({
    data: {
      userId: params.userId,
      refreshToken: params.refreshTokenHash,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      expiredAt: params.expiredAt,
    },
  });
}

export async function findByToken(token: string) {
  return await prisma.refreshToken.findFirst({
    where: {
      refreshToken: token,
    },
  });
}

export async function deleteByToken(token: string) {
  return await prisma.refreshToken.deleteMany({
    where: {
      refreshToken: token,
    },
  });
}

export async function deleteByUserId(userId: string) {
  await prisma.refreshToken.deleteMany({
    where: {
      userId: userId,
    },
  });
}
