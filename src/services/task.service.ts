import pool from "../db/pool";
import { NotFoundError } from "../errors/app.error";

interface GetTasksOptions {
  status?: string;
  search?: string;
  limit: number;
  offset: number;
  page: number;
}

export async function createTask(userId: string, data: any) {

  const result = await pool.query(
    "INSERT INTO tasks (user_id, title, status) VALUES ($1, $2, $3) RETURNING *",
    [userId, data.title, data.status ?? "pending"]
  );

  return result.rows[0];
}

export async function getTasks(userId: string, { status, search, limit, page, offset }: GetTasksOptions) {

  let conditions = ["user_id = $1"];
  let params: any[] = [userId];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`title ILIKE $${params.length}`);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const dataSql = `
    SELECT *
    FROM tasks
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;

  const dataResult = await pool.query(dataSql, [...params, limit, offset]);

  const countSql = `
    SELECT COUNT(*) 
    FROM tasks 
    ${whereClause}
  `;

  const countResult = await pool.query(countSql, params);

  const totalItems = parseInt(countResult.rows[0].count, 10);

  return {
    data: dataResult.rows,
    pagination: {
      totalItems,
      page,
      limit,
    },
  };
}

export async function getTaskById(userId: string, id: string) {
  const result = await pool.query("SELECT * FROM tasks WHERE id = $1 AND user_id = $2", [id, userId]);
  if (result.rowCount === 0) throw new NotFoundError("Task not found");
  return result.rows[0]
}

export async function updateTask(userId: string, id: string, body: any) {
  const { title, status } = body || {};

  const result = await pool.query(
    "UPDATE tasks SET title = COALESCE($1, title), status = COALESCE($2, status) WHERE id = $3 AND user_id = $4 RETURNING *",
    [title, status, id, userId]
  );
  if (result.rowCount === 0) throw new NotFoundError("Task not found") //sendResponse(res, 404, null, "Task not found");

  return result.rows[0]
}

export async function deleteTask(userId: string, id: string) {
  const result = await pool.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id", [id, userId]);
  if (result.rowCount === 0) throw new NotFoundError("Task not found");
}
export async function deleteBatchTask(userId: string, ids: string[]) {
  const result = await pool.query("DELETE FROM tasks WHERE id = ANY($1) AND user_id = $2 RETURNING id", [ids, userId]);

  if (result.rowCount === 0) throw new NotFoundError("No tasks found or already deleted");
  return result?.rowCount
}
