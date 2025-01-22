import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import apiRouter from "./api";
import { logError } from "./utils/errorHandler";

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 3001;

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// API 路由
app.use("/api", apiRouter);

// 错误处理中间件
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logError(err, `Global Error Handler - ${req.method} ${req.url}`);

    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Internal server error",
      details:
        process.env.NODE_ENV === "development"
          ? {
              stack: err instanceof Error ? err.stack : undefined,
              type: typeof err,
              errorObject: err,
              path: req.path,
              method: req.method,
              body: req.body,
              query: req.query,
              headers: req.headers,
            }
          : undefined,
    });
  }
);

// 未找到路由处理
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.url} not found`);
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:");
  logError(error, "Uncaught Exception");
  process.exit(1);
});

export default app;
