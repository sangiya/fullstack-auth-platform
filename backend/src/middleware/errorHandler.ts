import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../modules/auth/auth.errors";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", details: err.issues.map((issue) => issue.message) });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
