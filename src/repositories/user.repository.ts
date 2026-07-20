import { prisma } from "../config/prisma.js";
import type { User } from "@prisma/client";
import type { UserResponse } from "../types/user.type.js";
import type { PaginationResponse } from "../types/pagination.response.type.js";
import type { RegisterRequest } from "../types/auth.type.js";

export type UserWithRoles = User & { roles: string[] };

export async function findByEmail(
  email: string,
): Promise<UserWithRoles | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  if (!user) return null;

  return {
    ...user,
    roles: user.userRoles.map((ur) => ur.role.roleName),
  };
}

export async function findById(userId: string): Promise<UserWithRoles | null> {
  const user = await prisma.user.findUnique({
    where: { userId },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  if (!user) return null;

  return {
    ...user,
    roles: user.userRoles.map((ur) => ur.role.roleName),
  };
}

export async function findAll(
  page: number,
  size: number,
  search?: string,
): Promise<PaginationResponse<UserResponse>> {
  const offset = (page - 1) * size;
  const searchPattern = search ? `%${search}%` : null;

  const whereClause = searchPattern
    ? `WHERE (u."email" ILIKE $1 OR u."fullName" ILIKE $1) AND u."userId" NOT IN (
        SELECT ur."userId" FROM "user_roles" ur
        JOIN "roles" r ON r."roleId" = ur."roleId"
        WHERE r."roleName" = 'ADMIN'
      )`
    : `WHERE u."userId" NOT IN (
        SELECT ur."userId" FROM "user_roles" ur
        JOIN "roles" r ON r."roleId" = ur."roleId"
        WHERE r."roleName" = 'ADMIN'
      )`;

  const countQuery = `SELECT COUNT(*)::int AS total FROM "users" u ${whereClause}`;
  const dataQuery = `
    SELECT
      u."userId", u."email", u."fullName", u."avatar", u."gender",
      u."isActive", u."createdAt",
      COALESCE(
        (SELECT json_agg(r."roleName") FROM "user_roles" ur
         JOIN "roles" r ON r."roleId" = ur."roleId"
         WHERE ur."userId" = u."userId"), '[]'::json
      ) AS roles
    FROM "users" u
    ${whereClause}
    ORDER BY u."createdAt" DESC
    LIMIT ${size} OFFSET ${offset}
  `;

  const [countResult] = searchPattern
    ? await prisma.$queryRawUnsafe<{ total: number }[]>(
        countQuery,
        searchPattern,
      )
    : await prisma.$queryRawUnsafe<{ total: number }[]>(countQuery);

  const items = searchPattern
    ? await prisma.$queryRawUnsafe<UserResponse[]>(dataQuery, searchPattern)
    : await prisma.$queryRawUnsafe<UserResponse[]>(dataQuery);

  const total = countResult?.total ?? 0;

  return {
    items,
    total,
    page,
    size,
    totalPages: Math.ceil(total / size),
  };
}

export async function updatePassword(userId: string, passwordHash: string) {
  await prisma.user.update({
    where: { userId },
    data: { passwordHash },
  });
}

export async function activateUser(userId: string, newStatus: boolean) {
  await prisma.user.update({
    where: {
      userId: userId,
    },
    data: {
      isActive: newStatus,
    },
  });
}

export async function updateUser(
  userId: string,
  data: Record<string, unknown>,
) {
  return await prisma.user.update({
    where: { userId },
    data: data as never,
  });
}

export async function createUserAccount(
  email: string,
  fullName: string,
  passwordHash: string,
  otpCode: string,
  otpExpiredAt: Date,
) {
  return await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      otpCode,
      otpExpiredAt,
    },
  });
}

export async function saveOtpRepo(
  userId: string,
  otpCode: string,
  otpExpiredAt: Date,
) {
  return await prisma.user.update({
    where: { userId },
    data: { otpCode, otpExpiredAt },
  });
}

export async function clearOtpRepo(userId: string) {
  return await prisma.user.update({
    where: { userId },
    data: { otpCode: null, otpExpiredAt: null },
  });
}

export async function createUserRoleRepo(userId: string, roleId: string) {
  await prisma.userRole.create({
    data: {
      userId,
      roleId,
    },
  });
}
