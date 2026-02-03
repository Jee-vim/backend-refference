import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { sendResponse } from "../utils/lib";
import * as authService from "../services/auth.service";
import { ValidationError } from "../errors/app.error";

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await authService.register(email, hash, name)

    return sendResponse(res, 201, result, "User registered successfully");
  } catch (error: any) {
    if (error.code === "23505") {
      throw new ValidationError("Email is already registered")
    }

    return sendResponse(res, 500, null, "Internal server error");
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password, res)

  return sendResponse(res, 200, result, "Login successful");
};
