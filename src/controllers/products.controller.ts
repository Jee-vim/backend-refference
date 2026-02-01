import { Request, Response } from "express";
import pool from "../db/pool";
import { sendResponse } from "../utils/lib";

// add search query
export const getProducts = async (req: Request, res: Response) => {
  const { sort } = req.query;
  let orderBy = "ORDER BY created_at DESC";

  if (sort === "oldest") {
    orderBy = "ORDER BY created_at ASC";
  }

  const result = await pool.query(`SELECT * FROM products ${orderBy}`);
  return sendResponse(res, 200, result.rows, "Products retrieved successfully");
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return sendResponse(res, 404, null, "Product not found");
  }

  return sendResponse(res, 200, result.rows[0], "Product retrieved successfully");
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, stock } = req.body;

  const result = await pool.query(
    "INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, description, price, stock]
  );

  return sendResponse(res, 201, result.rows[0], "Product created successfully");
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, stock } = req.body;

  const result = await pool.query(
    "UPDATE products SET name = $1, description = $2, price = $3, stock = $4 WHERE id = $5 RETURNING *",
    [name, description, price, stock, id]
  );

  if (result.rowCount === 0) {
    return sendResponse(res, 404, null, "Product not found");
  }

  return sendResponse(res, 200, result.rows[0], "Product updated successfully");
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);

  if (result.rowCount === 0) {
    return sendResponse(res, 404, null, "Product not found");
  }

  return sendResponse(res, 200, null, "Product deleted successfully");
};

export const deleteBatchProducts = async (req: Request, res: Response) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return sendResponse(res, 400, null, "Invalid input: ids must be a non-empty array");
  }

  const result = await pool.query(
    "DELETE FROM products WHERE id = ANY($1) RETURNING id",
    [ids]
  );

  return sendResponse(res, 200, { deletedCount: result.rowCount }, "Batch delete successful");
};
