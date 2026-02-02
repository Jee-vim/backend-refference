import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Known / expected errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.statusCode,
      message: err.message,
      data: null,
    });
  }

  // Unknown / programmer errors
  console.error("UNHANDLED_ERROR:", err);

  return res.status(500).json({
    success: false,
    code: 500,
    message: "Internal server error",
    data: null,
  });
}
