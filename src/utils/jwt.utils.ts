import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";
import type { TokenPayload } from "../types/token.payload.type.js";

// export function signToken(payload: TokenPayload): string {
//   return jwt.sign(payload, jwtConfig.secret, {
//     expiresIn: jwtConfig.expiresIn,
//   } as jwt.SignOptions);
// }

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}

export function decodeToken(token: string): TokenPayload | null {
  const decoded = jwt.decode(token);
  if (
    decoded &&
    typeof decoded === "object" &&
    "userId" in decoded &&
    "fullName" in decoded
  ) {
    return decoded as TokenPayload;
  }
  return null;
}

// Tạo access token
export const generateAccessToken = (payload: TokenPayload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.accessExpiresIn,
  } as jwt.SignOptions);
};

// Tạo refresh token
export const generateRefreshToken = (payload: TokenPayload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  } as jwt.SignOptions);
};
