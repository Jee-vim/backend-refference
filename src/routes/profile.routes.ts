import { Router } from "express";
import auth from "../middleware/auth.middleware";
import { userLimiter, validate } from "../utils/lib";
import { updateProfleSchema } from "../schemas/profile.schema";
import { getProfile, updateProfile } from "../controllers/profile.controller";

const router = Router();

router.use(auth);
router.use(userLimiter)

router.put("/:id", validate(updateProfleSchema), updateProfile);
router.get("/:id", getProfile);

export default router;
