import { Router } from "express";
import { fileDelete, fileUpload } from "../controllers/file.controller";
import { uploadLimiter } from "../utils/lib";
import auth from "../middleware/auth.middleware";

const router = Router();
router.use(auth);
router.use(uploadLimiter)

router.post("/upload", fileUpload);
router.post("/delete", fileDelete);

export default router;
