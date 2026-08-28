import type { NextFunction, Request, Response } from "express";
import * as authService from "./auth.service";
import { loginSchema, refreshSchema, registerSchema } from "./auth.validation";

export async function registerHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = registerSchema.parse(req.body);
    const tokens = await authService.register(email, password);
    res.status(201).json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const tokens = await authService.login(email, password);
    res.status(200).json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const tokens = await authService.refresh(refreshToken);
    res.status(200).json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function logoutHandler(
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (req.userId) {
      await authService.logout(req.userId);
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
