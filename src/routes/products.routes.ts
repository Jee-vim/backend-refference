import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteBatchProducts,
} from "../controllers/product.controller";
import auth from "../middleware/auth.middleware";
import { userLimiter, validate } from "../utils/lib";
import { createProductSchema } from "../schemas/products.schema";
import { queryGlobalSchema } from "../schemas/global.schema";

const router = Router();
router.use(userLimiter);

router.get("/", validate(queryGlobalSchema), getProducts);
router.get("/:id", getProductById);

router.post("/", auth, validate(createProductSchema), createProduct);
router.put("/:id", auth, validate(createProductSchema), updateProduct);
router.delete("/:id", auth, deleteProduct);
router.post("/delete/batch", auth, deleteBatchProducts);

export default router;
