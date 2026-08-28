import { Router, type Response } from "express";
import { authenticate, type AuthenticatedRequest } from "../../middleware/authenticate";

export const userRouter = Router();

userRouter.get("/me", authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({ id: req.userId, email: req.userEmail });
});
