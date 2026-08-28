import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../../middleware/authenticate";
import { loginHandler, logoutHandler, refreshHandler, registerHandler } from "./auth.controller";

// Login is rate-limited specifically -- it's the endpoint a credential-
// stuffing attack actually hits, unlike register or refresh.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRouter = Router();

authRouter.post("/register", registerHandler);
authRouter.post("/login", loginLimiter, loginHandler);
authRouter.post("/refresh", refreshHandler);
authRouter.post("/logout", authenticate, logoutHandler);
