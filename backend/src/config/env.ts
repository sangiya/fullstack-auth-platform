function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  mongoUri: process.env.MONGO_URI ?? "mongodb://localhost:27017/auth-platform",
  // No fallback for secrets -- a deployment must supply its own; a shared
  // default committed to source control is a secret in name only.
  jwtAccessSecret: required("JWT_ACCESS_SECRET", process.env.NODE_ENV === "test" ? "test-access-secret" : undefined),
  jwtRefreshSecret: required(
    "JWT_REFRESH_SECRET",
    process.env.NODE_ENV === "test" ? "test-refresh-secret" : undefined,
  ),
  // Seconds, not a string like "15m" -- @types/jsonwebtoken's expiresIn
  // only accepts a number or its own narrow string-literal union type, and
  // a plain `string` here doesn't satisfy either overload.
  accessTokenTtlSeconds: 15 * 60,
  refreshTokenTtlDays: 7,
};
