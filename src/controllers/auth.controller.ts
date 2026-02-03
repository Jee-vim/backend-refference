import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/lib";
import * as authService from "../services/auth.service";
import { ValidationError } from "../errors/app.error";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  try {
    const result = await authService.register(email, password, name)

    return sendResponse(res, 201, result, "User registered successfully");
  } catch (error: any) {
    if (error.code === "23505") {
      throw new ValidationError("Email is already registered")
    }

    return next(error)
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login(email, password);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendResponse(res, 200, { accessToken, user }, "Login successful");
  } catch (error: any) {
    // If login fails, any old/bad refresh token is wiped
    res.clearCookie("refreshToken", { 
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    if (error.message === "Invalid credentials") {
      return sendResponse(res, 401, null, "Invalid credentials");
    }
    next(error);
  }
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return sendResponse(res, 401, null, "No refresh token provided")

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };

    // Check if this token is still valid in the database
    const dbToken = await authService.refresh(payload.userId)

    // If the token in the cookie doesn't match the DB, it has been invalidated
    if (!dbToken || dbToken !== refreshToken) {
      res.clearCookie("refreshToken", { path: "/" });
      return sendResponse(res, 403, null, "Session invalidated")
    }

    const accessToken = authService.generateAccessToken(payload.userId);
    return sendResponse(res, 200, { accessToken }, "Token refreshed");
  } catch (err) {
    res.clearCookie
    return sendResponse(res, 403, null, "Invalid or expired refresh token")
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    try {
      const payload = jwt.decode(refreshToken) as { userId: string };
      await authService.logout(payload.userId)
    } catch (e) {
      next(e)
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });

  return sendResponse(res, 200, null, "Logged out successfully");
};
