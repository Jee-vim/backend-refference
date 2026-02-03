import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/lib";
import * as profileService from "../services/profile.service";

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const result = await profileService.getById(userId);

    return sendResponse(res, 200, result, "Profile retrieved successfully");
  } catch (err) {
    next(err)
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const updateData = req.body;

    const result = await profileService.update(userId, updateData);

    return sendResponse(res, 200, result, "Profile updated successfully");
  } catch (err) {
    next(err)
  }
};
