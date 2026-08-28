import { Schema, model, type Document } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  // Only the SHA-256 hash of the current refresh token is stored, never
  // the token itself -- a database read (backup leak, injection) can't be
  // turned into a usable session the way a stored plaintext token could.
  refreshTokenHash: string | null;
  refreshTokenExpiresAt: Date | null;
  createdAt: Date;
}

const userSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  refreshTokenHash: { type: String, default: null },
  refreshTokenExpiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: () => new Date() },
});

export const UserModel = model<UserDocument>("User", userSchema);
