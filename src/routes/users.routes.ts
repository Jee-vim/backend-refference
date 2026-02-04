import { Router } from "express";
import auth from "../middleware/auth.middleware";
import { userLimiter, validate } from "../utils/lib";
import { updateUserSchema } from "../schemas/users.schema";
import { getUser, getUserById, updateUser } from "../controllers/users.controller";

const router = Router();

router.use(auth);
router.use(userLimiter)

router.get("/", getUser);
router.put("/", validate(updateUserSchema), updateUser);
router.get("/:id", getUserById);

export default router;
