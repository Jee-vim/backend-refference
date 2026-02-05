import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error";
import { sendResponse } from "src/utils/lib";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return sendResponse(res, err.statusCode, null, err.message);
  }

  console.error("UNHANDLED_ERROR:", err);

  return sendResponse(res, 500, null, "Internal server error");
}
