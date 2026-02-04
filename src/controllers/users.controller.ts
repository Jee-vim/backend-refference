import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/lib";
import * as profileService from "../services/user.service";

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await profileService.get();

    return sendResponse(res, 200, result, "User retrieved successfully");
  } catch (err) {
    next(err)
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const result = await profileService.getById(userId);

    return sendResponse(res, 200, result, "User retrieved successfully");
  } catch (err) {
    next(err)
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { profile, email } = req.body;

    const result = await profileService.update(userId, { profile, email });

    return sendResponse(res, 200, result, "User updated successfully");
  } catch (err) {
    next(err)
  }
};
