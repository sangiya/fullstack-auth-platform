import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { userRouter } from "./modules/user/user.routes";

export function createApp(): Express {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
  app.use("/api/auth", authRouter);
  app.use("/api", userRouter);

  app.use(errorHandler);
  return app;
}
