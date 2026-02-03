import { Router } from "express";
import { register, login, refresh, logout } from "../controllers/auth.controller";
import { authLimiter, validate } from "../utils/lib";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
