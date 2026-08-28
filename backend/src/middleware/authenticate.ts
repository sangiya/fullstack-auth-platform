import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../modules/auth/token.util";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }
  try {
    const payload = verifyAccessToken(header.slice("Bearer ".length));
    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired access token" });
  }
}
