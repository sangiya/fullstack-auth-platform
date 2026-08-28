import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.accessTokenTtlSeconds });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

/**
 * A refresh token is a random opaque string, not a JWT -- unlike an access
 * token, it must be revocable (logout, rotation on reuse) and checkable
 * against server state, which a stateless JWT can't provide without an
 * extra denylist anyway. Only its hash is ever persisted.
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function refreshTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + env.refreshTokenTtlDays);
  return expiry;
}
