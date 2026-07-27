// third-party
import express from "express";

//routes
import authRouter from "./routes/auth.route.js";
import healthRouter from "./routes/health.route.js";

// middleware
import errorHandler from "./middleware/error.middleware.js";

export default function createApp() {
  const app = express();
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/api/auth", authRouter);

  app.use(errorHandler);

  return app;
}
