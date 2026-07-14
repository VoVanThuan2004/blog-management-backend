export const jwtConfig = {
  secret: process.env["JWT_SECRET"] ?? "fallback-secret-key",
  accessExpiresIn: (process.env["JWT_ACCESS_EXPIRES_IN"] ?? "30m") as string,
  refreshExpiresIn: (process.env["JWT_REFRESH_EXPIRES_IN"] ?? "30d") as string,
};
