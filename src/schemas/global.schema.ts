import z from "zod";
import { TaskStatusSchema } from "./tasks.schema";

export const queryGlobalSchema = z.object({
  page: z.coerce.number().int().positive().catch(1).default(1),
  limit: z.coerce.number().int().positive().max(100).catch(10).default(10),
  search: z.string().optional()
});

export const queryTaskSchema = queryGlobalSchema.extend({
  status: TaskStatusSchema.optional(),
})
