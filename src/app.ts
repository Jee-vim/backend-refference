import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/tasks.routes";
import productRoutes from "./routes/products.routes";
import profileRoutes from "./routes/profile.routes";
import { generalLimiter, sendResponse } from "./utils/lib";
import { errorHandler } from "./middleware/errror.middleware";

const app = express();
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

app.use((err: any, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && "status" in err && "body" in err) {
    return sendResponse(res, 400, null, "Invalid JSON format");
  }
  next();
});

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/tasks", taskRoutes);
app.use("/products", productRoutes);

app.use((req: Request, res: Response) => {
  sendResponse(res, 404, null, `Route ${req.originalUrl} not found`);
});

app.use(errorHandler);

export default app;
