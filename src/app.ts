import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import path from "path";

import { generalLimiter, sendResponse } from "./utils/lib";
import { errorHandler } from "./middleware/errror.middleware";

import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/tasks.routes";
import productRoutes from "./routes/products.routes";
import userRoutes from "./routes/users.routes";
import fileRoutes from "./routes/file.routes";

const app = express();
app.use(helmet({
  // Disables the Content-Security-Policy during development 
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: (_, callback) => {
    callback(null, true);
  },
  credentials: true, // This allows the browser to send/receive cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(generalLimiter)

app.use(express.json());
app.use(cookieParser());

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && "status" in err && "body" in err) {
    return sendResponse(res, 400, null, "Invalid JSON format");
  }
  next(err);
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/products", productRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));
app.use("/file", fileRoutes);

app.use((req: Request, res: Response) => {
  sendResponse(res, 404, null, `Route ${req.originalUrl} not found`);
});

app.use(errorHandler);

export default app;
