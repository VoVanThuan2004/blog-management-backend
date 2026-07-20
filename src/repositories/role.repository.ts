import { prisma } from "../config/prisma.js";

export async function findByRoleName(roleName: string) {
  return await prisma.role.findUnique({
    where: {
      roleName,
    },
  });
}
