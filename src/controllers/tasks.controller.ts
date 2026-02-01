import { Request, Response } from "express";
import pool from "../db/pool";
import { sendResponse, sendPaginatedResponse } from "../utils/lib";

export const createTask = async (req: Request, res: Response) => {
  const { title } = req.body;
  const userId = (req as any).userId;

  const result = await pool.query(
    "INSERT INTO tasks (user_id, title) VALUES ($1, $2) RETURNING *",
    [userId, title]
  );

  return sendResponse(res, 201, result.rows[0], "Task successfully created");
};

export const getTasks = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const dataQuery = await pool.query(
    "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    [userId, limit, offset]
  );

  const countQuery = await pool.query(
    "SELECT COUNT(*) FROM tasks WHERE user_id = $1",
    [userId]
  );
  
  const total_items = parseInt(countQuery.rows[0].count);

  return sendPaginatedResponse(
    res, 
    200, 
    dataQuery.rows, 
    total_items, 
    page, 
    limit, 
    "Tasks retrieved successfully"
  );
};

export const getTaskById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).userId;

  const result = await pool.query(
    "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
    [id, userId]
  );

  if (result.rowCount === 0) {
    return sendResponse(res, 404, null, "Task not found");
  }

  return sendResponse(res, 200, result.rows[0], "Task retrieved successfully");
};

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, status } = req.body as { title: string, status: TaskStatus };
  const userId = (req as any).userId;

  const validStatuses: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

  if (status && !validStatuses.includes(status)) {
    return sendResponse(res, 400, null, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  try {
    const result = await pool.query(
      "UPDATE tasks SET title = $1, status = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
      [title, status, id, userId]
    );

    if (result.rowCount === 0) {
      return sendResponse(res, 404, null, "Task not found");
    }

    return sendResponse(res, 200, result.rows[0], "Task updated successfully");
  } catch (error: any) {
    if (error.code === '22P02') {
      return sendResponse(res, 400, null, "Invalid status format");
    }
    return sendResponse(res, 500, null, "Internal server error");
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).userId;

  const result = await pool.query(
    "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );

  if (result.rowCount === 0) {
    return sendResponse(res, 404, null, "Task not found");
  }

  return sendResponse(res, 200, null, "Task deleted successfully");
};

export const deleteBatchTasks = async (req: Request, res: Response) => {
  const { ids } = req.body;
  const userId = (req as any).userId;

  if (!Array.isArray(ids) || ids.length === 0) {
    return sendResponse(res, 400, null, "Please provide an array of task IDs");
  }

  const result = await pool.query(
    "DELETE FROM tasks WHERE id = ANY($1) AND user_id = $2 RETURNING id",
    [ids, userId]
  );

  if (result.rowCount === 0) {
    return sendResponse(res, 404, null, "No tasks found or already deleted");
  }

  return sendResponse(res, 200, { deletedCount: result.rowCount }, "Tasks deleted successfully");
};
