import { Request, Response } from "express";
import {
  getSafeParams,
  sendPaginatedResponse,
  sendResponse,
} from "../utils/lib";
import * as productService from "../services/product.service";
import { ValidationError } from "../errors/app.error";

export const getProducts = async (req: Request, res: Response) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const { sort, search } = req.query as any;
  const { limit, page, offset } = getSafeParams(req.query);

  const { result, countResult } = await productService.getProducts({
    search,
    sort,
    limit,
    offset,
  });

  return sendPaginatedResponse(
    res,
    200,
    result,
    countResult,
    page,
    limit,
    "Products retrieved successfully",
  );
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (typeof id !== "string") {
    throw new ValidationError("Product ID must be a single string");
  }
  const result = await productService.getProductById(id);
  return sendResponse(res, 200, result, "Product retrieved successfully");
};

export const createProduct = async (req: Request, res: Response) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const userId = (req as any).userId;
  const result = await productService.createProduct(userId, req.body);
  return sendResponse(res, 201, result, "Product created successfully");
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const userId = (req as any).userId;

  if (typeof id !== "string") {
    throw new ValidationError("Product ID must be a single string");
  }

  const result = await productService.updateProduct(userId, id, req.body);
  return sendResponse(res, 200, result, "Product updated successfully");
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const userId = (req as any).userId;
  if (typeof id !== "string") {
    throw new ValidationError("Product ID must be a single string");
  }
  await productService.deleteProduct(userId, id);
  return sendResponse(res, 200, null, "Product deleted successfully");
};

export const deleteBatchProducts = async (req: Request, res: Response) => {
  const { ids } = req.body;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const userId = (req as any).userId;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ValidationError("Invalid input: ids must be a non-empty array");
  }

  const count = await productService.deleteBatchProduct(userId, ids);
  return sendResponse(
    res,
    200,
    { deletedCount: count },
    "Batch delete successful",
  );
};
