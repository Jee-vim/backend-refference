import { NextFunction, Request, Response } from "express";
import { sendResponse, sendPaginatedResponse, getSafeParams, } from "../utils/lib";
import * as taskService from "../services/task.service"
import { ValidationError } from "../errors/app.error";

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const task = await taskService.createTask(userId, req.body);

    return sendResponse(res, 201, task, "Task successfully created");
  } catch (error) {
    next(error)
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { status, search } = (req.query as any) || {};
    const { limit, page, offset } = getSafeParams(req.query)
    const { data, pagination } = await taskService.getTasks(userId, { status, search, limit, page, offset });
    const { totalItems } = pagination

    return sendPaginatedResponse(res, 200, data, totalItems, page, limit, "Tasks retrieved successfully");
  } catch (error) {
    next(error)
  }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (typeof id !== "string") {
      throw new ValidationError("Invalid task id");
    }

    const result = await taskService.getTaskById(userId, id)

    return sendResponse(res, 200, result, "Task retrieved successfully");
  } catch (error) {
    next(error)
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (typeof id !== "string") {
      throw new ValidationError("Invalid task id");
    }

    const result = await taskService.updateTask(userId, id, req.query)

    return sendResponse(res, 200, result, "Task updated successfully");
  } catch (error) {
    next(error)
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (typeof id !== "string") {
      throw new ValidationError("Invalid task id");
    }

    await taskService.deleteTask(userId, id)

    return sendResponse(res, 200, null, "Task deleted successfully");
  } catch (error) {
    next(error)
  }
};

export const deleteBatchTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body || {};
    const userId = (req as any).userId;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError("Please provide an array of task IDs")
    }

    const result = await taskService.deleteBatchTask(userId, ids)

    return sendResponse(res, 200, { deletedCount: result }, "Tasks deleted successfully");
  } catch (error) {
    next(error)
  }
};
