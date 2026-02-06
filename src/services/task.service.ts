import db from "../db";
import { NotFoundError } from "../errors/app.error";

interface GetTasksOptions {
  status?: string;
  search?: string;
  limit: number;
  offset: number;
  page: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function createTask(userId: string, data: any) {
  const [task] = await db("tasks")
    .insert({
      user_id: userId,
      title: data.title,
      status: data.status ?? "PENDING",
    })
    .returning("*");

  return task;
}

export async function getTasks(
  userId: string,
  { status, search, limit, page, offset }: GetTasksOptions,
) {
  const query = db("tasks").where({ user_id: userId });

  if (status) {
    query.andWhere({ status });
  }

  if (search) {
    query.andWhere("title", "ilike", `%${search}%`);
  }

  const countQuery = query.clone().count("* as count").first();

  const data = await query
    .orderBy("created_at", "desc")
    .limit(limit)
    .offset(offset);

  const countResult = await countQuery;
  const totalItems = parseInt((countResult?.count as string) || "0", 10);

  return {
    data,
    pagination: {
      totalItems,
      page,
      limit,
    },
  };
}

export async function getTaskById(userId: string, id: string) {
  const task = await db("tasks").where({ id, user_id: userId }).first();

  if (!task) throw new NotFoundError("Task not found");
  return task;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function updateTask(userId: string, id: string, body: any) {
  const { title, status } = body || {};

  const [task] = await db("tasks")
    .where({ id, user_id: userId })
    .update({
      title: title ?? undefined,
      status: status ?? undefined,
      updated_at: db.fn.now(),
    })
    .returning("*");

  if (!task) throw new NotFoundError("Task not found");
  return task;
}

export async function deleteTask(userId: string, id: string) {
  const deletedCount = await db("tasks")
    .where({ id, user_id: userId })
    .delete();

  if (deletedCount === 0) throw new NotFoundError("Task not found");
}

export async function deleteBatchTask(userId: string, ids: string[]) {
  const deletedCount = await db("tasks")
    .whereIn("id", ids)
    .andWhere({ user_id: userId })
    .delete();

  if (deletedCount === 0)
    throw new NotFoundError("No tasks found or already deleted");
  return deletedCount;
}
