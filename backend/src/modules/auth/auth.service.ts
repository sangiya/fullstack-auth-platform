import bcrypt from "bcryptjs";
import { UserModel, type UserDocument } from "../user/user.model";
import { EmailAlreadyRegisteredError, InvalidCredentialsError, InvalidRefreshTokenError } from "./auth.errors";
import { generateRefreshToken, hashToken, refreshTokenExpiry, signAccessToken } from "./token.util";

const BCRYPT_ROUNDS = 12;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

async function issueTokenPair(user: UserDocument): Promise<TokenPair> {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = generateRefreshToken();
  user.refreshTokenHash = hashToken(refreshToken);
  user.refreshTokenExpiresAt = refreshTokenExpiry();
  await user.save();
  return { accessToken, refreshToken };
}

export async function register(email: string, password: string): Promise<TokenPair> {
  const existing = await UserModel.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new EmailAlreadyRegisteredError();
  }
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await UserModel.create({ email, passwordHash });
  return issueTokenPair(user);
}

export async function login(email: string, password: string): Promise<TokenPair> {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new InvalidCredentialsError();
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new InvalidCredentialsError();
  }
  return issueTokenPair(user);
}

/**
 * Rotation, not reuse: every successful refresh issues a brand new refresh
 * token and immediately invalidates the one just used. A stolen refresh
 * token that gets used by an attacker after the legitimate client already
 * rotated it will fail this hash comparison -- the legitimate client's
 * *next* refresh attempt is what would reveal the token was compromised
 * (a real system would also log/alert on that mismatch, out of scope here).
 */
export async function refresh(refreshToken: string): Promise<TokenPair> {
  const tokenHash = hashToken(refreshToken);
  const user = await UserModel.findOne({ refreshTokenHash: tokenHash });
  if (!user || !user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date()) {
    throw new InvalidRefreshTokenError();
  }
  return issueTokenPair(user);
}

export async function logout(userId: string): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, { refreshTokenHash: null, refreshTokenExpiresAt: null });
}
