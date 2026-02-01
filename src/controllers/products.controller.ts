import { Request, Response } from "express";
import pool from "../db/pool";
import { getSafeParams, sendPaginatedResponse, sendResponse } from "../utils/lib";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { sort, search } = req.query as any;
    const { limit, page, offset } = getSafeParams(req.query)

    let conditions = [];
    let params: any[] = [];

    if (search) {
      const cleanSearch = `%${search.trim()}%`;
      params.push(cleanSearch);

      const idx = params.length;
      conditions.push(`(name ILIKE $${idx} OR COALESCE(description, '') ILIKE $${idx})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    let orderBy = "ORDER BY created_at DESC";
    if (sort === "oldest") {
      orderBy = "ORDER BY created_at ASC";
    }

    const dataSql = `SELECT * FROM products ${whereClause} ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const result = await pool.query(dataSql, [...params, limit, offset]);

    const countSql = `SELECT COUNT(*) FROM products ${whereClause}`;
    const countResult = await pool.query(countSql, params);
    const total_items = parseInt(countResult.rows[0].count) || 0;

    return sendPaginatedResponse(
      res,
      200,
      result.rows,
      total_items,
      page,
      limit,
      "Products retrieved successfully"
    );
  } catch (error: any) {
    console.error("GET_PRODUCTS_ERROR:", error.message);
    return sendResponse(res, 500, null, "Internal server error");
  }
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
