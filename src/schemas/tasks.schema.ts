import { z } from "zod";

export const TaskStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const createTaskSchema = z.object({
  title: z.string().min(1),
  status: TaskStatusSchema
});
