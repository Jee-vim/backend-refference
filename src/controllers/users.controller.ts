import { Request, Response } from "express";
import { sendResponse } from "../utils/lib";
import * as profileService from "../services/user.service";

export const getUser = async (req: Request, res: Response) => {
  const result = await profileService.get();
  return sendResponse(res, 200, result, "User retrieved successfully");
};

export const getUserById = async (req: Request, res: Response) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const userId = (req as any).userId;
  const result = await profileService.getById(userId);

  return sendResponse(res, 200, result, "User retrieved successfully");
};

export const updateUser = async (req: Request, res: Response) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const userId = (req as any).userId;
  const { profile, email } = req.body;

  const result = await profileService.update(userId, { profile, email });

  return sendResponse(res, 200, result, "User updated successfully");
};
