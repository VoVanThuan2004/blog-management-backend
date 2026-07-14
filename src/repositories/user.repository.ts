import { prisma } from "../config/prisma.js";
import type { User } from "@prisma/client";

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

export async function updatePassword(userId: string, passwordHash: string) {
  await prisma.user.update({
    where: { userId },
    data: { passwordHash },
  });
}

export async function updateUser(userId: string, data: Record<string, unknown>) {
  return await prisma.user.update({
    where: { userId },
    data: data as never,
  });
}
