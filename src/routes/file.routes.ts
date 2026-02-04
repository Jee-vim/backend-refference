import { Router } from "express";
import { fileDelete, fileUpload } from "../controllers/file.controller";
import { uploadLimiter } from "../utils/lib";
import auth from "../middleware/auth.middleware";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();
router.use(auth);
router.use(uploadLimiter)

router.post("/upload", upload.array("files"), fileUpload);
router.delete("/delete/:filename", fileDelete);

export default router;
