export interface CreateRefreshTokenParams {
  userId: string;
  refreshTokenHash: string;
  userAgent: string;
  ipAddress: string;
  expiredAt: Date;
}
