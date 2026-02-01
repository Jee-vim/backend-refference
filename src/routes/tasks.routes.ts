import { Router } from "express";
import auth from "../middleware/auth.middleware";
import { createTask, getTasks, getTaskById, updateTask, deleteTask, deleteBatchTasks } from "../controllers/tasks.controller";
import { validate } from "../utils/lib";
import { createTaskSchema } from "../schemas/tasks.schema";
import { queryTaskSchema } from "../schemas/global.schema";

const router = Router();

router.use(auth);

router.get("/", validate(queryTaskSchema, "query"), getTasks);
router.post("/", validate(createTaskSchema), createTask);
router.put("/:id", validate(createTaskSchema), updateTask);
router.get("/:id", getTaskById);
router.delete("/:id", deleteTask);
router.post("/delete/batch", deleteBatchTasks);

export default router;
