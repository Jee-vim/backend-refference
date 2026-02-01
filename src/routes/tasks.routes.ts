import { Router } from "express";
import auth from "../middleware/auth.middleware";
import { createTask, getTasks, getTaskById, updateTask, deleteTask, deleteBatchTasks } from "../controllers/tasks.controller";

const router = Router();

router.use(auth);

router.put("/:id", updateTask);
router.get("/:id", getTaskById);
router.delete("/:id", deleteTask);
router.post("/delete/batch", deleteBatchTasks);
router.post("/", createTask);
router.get("/", getTasks);

export default router;
