import { Request, Response } from "express";
import pool from "../db/pool";
import { sendResponse, sendPaginatedResponse } from "../utils/lib";

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, status } = req.body || {};
    const userId = (req as any).userId;

    const result = await pool.query(
      "INSERT INTO tasks (user_id, title, status) VALUES ($1, $2, $3) RETURNING *",
      [userId, title, status]
    );

    return sendResponse(res, 201, result.rows[0], "Task successfully created");
  } catch (error: any) {
    return sendResponse(res, 500, null, "Internal server error");
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { status, search } = (req.query as any) || {};
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let conditions = ["user_id = $1"];
    let params: any[] = [userId];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`); // The % symbols are for partial matching
      conditions.push(`title ILIKE $${params.length}`); // ILIKE is case-insensitive
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const dataSql = `SELECT * FROM tasks ${whereClause} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const dataQuery = await pool.query(dataSql, [...params, limit, offset]);

    const countSql = `SELECT COUNT(*) FROM tasks ${whereClause}`;
    const countQuery = await pool.query(countSql, params);

    const total_items = parseInt(countQuery.rows[0].count);

    return sendPaginatedResponse(res, 200, dataQuery.rows, total_items, page, limit, "Tasks retrieved successfully");
  } catch (error: any) {
    console.error("GET_TASKS_ERROR:", error.message);
    return sendResponse(res, 500, null, "Internal server error");
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const result = await pool.query("SELECT * FROM tasks WHERE id = $1 AND user_id = $2", [id, userId]);

    if (result.rowCount === 0) return sendResponse(res, 404, null, "Task not found");
    return sendResponse(res, 200, result.rows[0], "Task retrieved successfully");
  } catch (error: any) {
    console.error("GET_BY_ID_ERROR:", error.message);
    return sendResponse(res, 500, null, "Internal server error");
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body || {};
    const userId = (req as any).userId;

    const result = await pool.query(
      "UPDATE tasks SET title = COALESCE($1, title), status = COALESCE($2, status) WHERE id = $3 AND user_id = $4 RETURNING *",
      [title, status, id, userId]
    );

    if (result.rowCount === 0) return sendResponse(res, 404, null, "Task not found");
    return sendResponse(res, 200, result.rows[0], "Task updated successfully");
  } catch (error: any) {
    console.error("UPDATE_TASK_ERROR:", error.message);
    return sendResponse(res, 500, null, "Internal server error");
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const result = await pool.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id", [id, userId]);

    if (result.rowCount === 0) return sendResponse(res, 404, null, "Task not found");
    return sendResponse(res, 200, null, "Task deleted successfully");
  } catch (error: any) {
    console.error("DELETE_TASK_ERROR:", error.message);
    return sendResponse(res, 500, null, "Internal server error");
  }
};

export const deleteBatchTasks = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body || {};
    const userId = (req as any).userId;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse(res, 400, null, "Please provide an array of task IDs");
    }

    const result = await pool.query("DELETE FROM tasks WHERE id = ANY($1) AND user_id = $2 RETURNING id", [ids, userId]);

    if (result.rowCount === 0) return sendResponse(res, 404, null, "No tasks found or already deleted");
    return sendResponse(res, 200, { deletedCount: result.rowCount }, "Tasks deleted successfully");
  } catch (error: any) {
    console.error("DELETE_BATCH_ERROR:", error.message);
    return sendResponse(res, 500, null, "Internal server error");
  }
};
